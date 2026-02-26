import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import type { Team } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", id);

    if (membersError) {
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ...team,
        members: members ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin auth
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "is_complete",
      "is_locked",
      "project_name",
      "project_description",
      "formation_type",
    ];
    const bodyRecord = body as Record<string, unknown>;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in bodyRecord) {
        updateData[field] = bodyRecord[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Fetch current team state for audit diff
    const { data: currentTeam, error: currentTeamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (currentTeamError || !currentTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { data: updatedTeam, error: updateError } = await supabase
      .from("teams")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedTeam) {
      return NextResponse.json(
        { error: "Failed to update team", details: updateError?.message },
        { status: 500 }
      );
    }

    // Write admin action entries for supported actions.
    const auditEntries = Object.keys(updateData)
      .filter((field) => currentTeam[field] !== updatedTeam[field])
      .map((field) => {
        if (field === "is_locked") {
          return {
            admin_email: admin.email,
            action_type: updatedTeam.is_locked ? "locked_team" : "unlocked_team",
            team_id: id,
            details: {
              field,
              previous: currentTeam[field],
              updated: updatedTeam[field],
            },
          };
        }

        if (field === "is_complete") {
          return {
            admin_email: admin.email,
            action_type: updatedTeam.is_complete
              ? "marked_complete"
              : "marked_incomplete",
            team_id: id,
            details: {
              field,
              previous: currentTeam[field],
              updated: updatedTeam[field],
            },
          };
        }

        if (field === "formation_type" && updatedTeam.formation_type === "algorithm_matched") {
          return {
            admin_email: admin.email,
            action_type: "confirmed_matching",
            team_id: id,
            details: {
              field,
              previous: currentTeam[field],
              updated: updatedTeam[field],
            },
          };
        }

        return null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (auditEntries.length > 0) {
      const { error: auditError } = await supabase
        .from("admin_actions")
        .insert(auditEntries);
      if (auditError) {
        return NextResponse.json(
          {
            error: "Team updated but failed to write audit log",
            details: auditError.message,
          },
          { status: 500 }
        );
      }
    }

    // Fetch members to return complete team info
    const { data: members } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", id);

    return NextResponse.json(
      {
        ...updatedTeam,
        members: members ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const typedTeam = team as Team;

    // Reject if locked
    if (typedTeam.is_locked) {
      return NextResponse.json(
        { error: "Unlock team before dissolving" },
        { status: 400 }
      );
    }

    // Count members and collect IDs
    const { data: members, error: membersError } = await supabase
      .from("participants")
      .select("id")
      .eq("team_id", id);

    if (membersError) {
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    const memberIds = (members ?? []).map((m: { id: string }) => m.id);
    const memberCount = memberIds.length;

    // Write audit entry before deletion
    const auditEntry = {
      admin_email: admin.email,
      action_type: "dissolved_team",
      team_id: id,
      details: {
        team_name: typedTeam.name,
        member_count: memberCount,
        member_ids: memberIds,
      },
    };

    const { error: auditError } = await supabase
      .from("admin_actions")
      .insert(auditEntry);

    if (auditError) {
      return NextResponse.json(
        { error: "Failed to write audit log", details: auditError.message },
        { status: 500 }
      );
    }

    // Reset team_id for all members
    if (memberCount > 0) {
      const { error: resetError } = await supabase
        .from("participants")
        .update({ team_id: null })
        .eq("team_id", id);

      if (resetError) {
        return NextResponse.json(
          { error: "Failed to reset participant team assignments", details: resetError.message },
          { status: 500 }
        );
      }
    }

    // Delete the team
    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete team", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, freed_participants: memberCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

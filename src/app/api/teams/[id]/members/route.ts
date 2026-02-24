import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import type { Team } from "@/types";

const addMembersSchema = z.object({
  participant_ids: z
    .array(z.string().uuid())
    .min(1, "At least one participant ID is required")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "participant_ids must not contain duplicates"
    ),
  force: z.boolean().optional().default(false),
});

const removeMemberSchema = z.object({
  participant_id: z.string().uuid("Invalid participant ID"),
});

async function recomputeAggregates(supabase: ReturnType<typeof createAdminClient>, teamId: string) {
  const { data: members } = await supabase
    .from("participants")
    .select("primary_role, specific_skills")
    .eq("team_id", teamId);

  const aggregateRoles = members
    ? [...new Set(members.map((m) => m.primary_role))]
    : [];
  const aggregateSkills = members
    ? [...new Set(members.flatMap((m) => m.specific_skills))]
    : [];

  const memberCount = members?.length ?? 0;

  await supabase
    .from("teams")
    .update({
      aggregate_roles: aggregateRoles,
      aggregate_skills: aggregateSkills,
      is_complete: memberCount >= 5,
    })
    .eq("id", teamId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = addMembersSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { participant_ids, force } = result.data;
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
        { error: "Cannot add members to a locked team" },
        { status: 400 }
      );
    }

    // Check team capacity
    const { count: currentCount, error: countError } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("team_id", id);

    if (countError) {
      return NextResponse.json(
        { error: "Failed to count team members" },
        { status: 500 }
      );
    }

    const totalAfterAdd = (currentCount ?? 0) + participant_ids.length;
    if (totalAfterAdd > 5) {
      return NextResponse.json(
        {
          error: "Adding these participants would exceed the team size limit of 5",
          current_members: currentCount ?? 0,
          requested_additions: participant_ids.length,
          max_team_size: 5,
        },
        { status: 400 }
      );
    }

    // Validate participants exist
    const { data: participants, error: fetchError } = await supabase
      .from("participants")
      .select("id, full_name, team_id")
      .in("id", participant_ids);

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch participants", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!participants || participants.length !== participant_ids.length) {
      return NextResponse.json(
        { error: "One or more participant IDs not found" },
        { status: 404 }
      );
    }

    // Check for participants already on another team
    const alreadyAssigned = participants.filter(
      (p) => p.team_id !== null && p.team_id !== id
    );
    if (alreadyAssigned.length > 0 && !force) {
      return NextResponse.json(
        {
          error: "One or more participants already belong to another team",
          participants: alreadyAssigned.map((p) => ({
            id: p.id,
            full_name: p.full_name,
            team_id: p.team_id,
          })),
        },
        { status: 409 }
      );
    }

    // Assign participants to team
    const { error: assignError } = await supabase
      .from("participants")
      .update({ team_id: id })
      .in("id", participant_ids);

    if (assignError) {
      return NextResponse.json(
        { error: "Failed to assign participants", details: assignError.message },
        { status: 500 }
      );
    }

    // Recompute aggregates
    await recomputeAggregates(supabase, id);

    // Write audit entries
    const auditEntries = participant_ids.map((pid) => ({
      team_id: id,
      admin_id: admin.id,
      action: "member_added",
      details: {
        participant_id: pid,
        participant_name: participants.find((p) => p.id === pid)?.full_name ?? null,
        forced: force && alreadyAssigned.some((a) => a.id === pid),
      },
    }));

    const { error: auditError } = await supabase
      .from("team_audit_log")
      .insert(auditEntries);

    if (auditError) {
      console.error("Audit log write failed:", auditError.message);
    }

    // Return updated team with members
    const { data: updatedTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    const { data: members } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", id);

    return NextResponse.json(
      {
        ...(updatedTeam ?? team),
        members: members ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team add members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = removeMemberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { participant_id } = result.data;
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

    // Validate participant belongs to this team
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id, full_name, team_id")
      .eq("id", participant_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    if (participant.team_id !== id) {
      return NextResponse.json(
        { error: "Participant does not belong to this team" },
        { status: 400 }
      );
    }

    // Remove participant from team
    const { error: removeError } = await supabase
      .from("participants")
      .update({ team_id: null })
      .eq("id", participant_id);

    if (removeError) {
      return NextResponse.json(
        { error: "Failed to remove participant", details: removeError.message },
        { status: 500 }
      );
    }

    // Recompute aggregates
    await recomputeAggregates(supabase, id);

    // Write audit entry
    const { error: auditError } = await supabase
      .from("team_audit_log")
      .insert({
        team_id: id,
        admin_id: admin.id,
        action: "member_removed",
        details: {
          participant_id,
          participant_name: participant.full_name,
        },
      });

    if (auditError) {
      console.error("Audit log write failed:", auditError.message);
    }

    // Return updated team with members
    const { data: updatedTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    const { data: members } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", id);

    return NextResponse.json(
      {
        ...(updatedTeam ?? team),
        members: members ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team remove member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

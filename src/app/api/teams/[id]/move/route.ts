import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sourceTeamId } = await params;
    const body = await request.json();
    const { participant_id, target_team_id } = body as {
      participant_id?: string;
      target_team_id?: string;
    };

    if (!participant_id || !target_team_id) {
      return NextResponse.json(
        { error: "participant_id and target_team_id are required" },
        { status: 400 }
      );
    }

    if (sourceTeamId === target_team_id) {
      return NextResponse.json(
        { error: "Source and target teams must be different" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify participant exists and belongs to source team
    const { data: participant, error: pError } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participant_id)
      .eq("team_id", sourceTeamId)
      .single();

    if (pError || !participant) {
      return NextResponse.json(
        { error: "Participant not found in source team" },
        { status: 404 }
      );
    }

    // Verify source team exists
    const { data: sourceTeam, error: stError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", sourceTeamId)
      .single();

    if (stError || !sourceTeam) {
      return NextResponse.json(
        { error: "Source team not found" },
        { status: 404 }
      );
    }

    // Verify target team exists and is not locked
    const { data: targetTeam, error: ttError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", target_team_id)
      .single();

    if (ttError || !targetTeam) {
      return NextResponse.json(
        { error: "Target team not found" },
        { status: 404 }
      );
    }

    if (targetTeam.is_locked) {
      return NextResponse.json(
        { error: "Target team is locked" },
        { status: 400 }
      );
    }

    // Check target team capacity
    const { count: targetMemberCount } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("team_id", target_team_id);

    if ((targetMemberCount ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Target team is full (5 members)" },
        { status: 400 }
      );
    }

    // Move participant
    const { error: moveError } = await supabase
      .from("participants")
      .update({ team_id: target_team_id })
      .eq("id", participant_id);

    if (moveError) {
      return NextResponse.json(
        { error: "Failed to move participant", details: moveError.message },
        { status: 500 }
      );
    }

    // Recalculate aggregates for source team
    const { data: sourceMembers } = await supabase
      .from("participants")
      .select("primary_role, specific_skills")
      .eq("team_id", sourceTeamId);

    const sourceRoles = [
      ...new Set((sourceMembers ?? []).map((m) => m.primary_role).filter(Boolean)),
    ];
    const sourceSkills = [
      ...new Set((sourceMembers ?? []).flatMap((m) => m.specific_skills ?? [])),
    ];

    await supabase
      .from("teams")
      .update({
        aggregate_roles: sourceRoles,
        aggregate_skills: sourceSkills,
      })
      .eq("id", sourceTeamId);

    // Recalculate aggregates for target team
    const { data: targetMembers } = await supabase
      .from("participants")
      .select("primary_role, specific_skills")
      .eq("team_id", target_team_id);

    const targetRoles = [
      ...new Set((targetMembers ?? []).map((m) => m.primary_role).filter(Boolean)),
    ];
    const targetSkills = [
      ...new Set((targetMembers ?? []).flatMap((m) => m.specific_skills ?? [])),
    ];

    await supabase
      .from("teams")
      .update({
        aggregate_roles: targetRoles,
        aggregate_skills: targetSkills,
      })
      .eq("id", target_team_id);

    // Write audit log entry
    const { error: auditError } = await supabase
      .from("team_audit_log")
      .insert([
        {
          team_id: sourceTeamId,
          admin_id: admin.id,
          action: "move_participant_out",
          details: {
            participant_id,
            participant_name: participant.full_name,
            target_team_id,
            target_team_name: targetTeam.name,
          },
        },
        {
          team_id: target_team_id,
          admin_id: admin.id,
          action: "move_participant_in",
          details: {
            participant_id,
            participant_name: participant.full_name,
            source_team_id: sourceTeamId,
            source_team_name: sourceTeam.name,
          },
        },
      ]);

    if (auditError) {
      console.error("Audit log write failed:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        participant_id,
        source_team_id: sourceTeamId,
        target_team_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Move participant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

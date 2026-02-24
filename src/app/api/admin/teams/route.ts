import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { generateInviteCode } from "@/lib/utils";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(1).optional(),
  participant_ids: z
    .array(z.string().uuid())
    .min(1, "At least one participant is required")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "participant_ids must not contain duplicates"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createTeamSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, participant_ids } = result.data;
    const supabase = createAdminClient();

    // Check that none of the participants already belong to a team
    const { data: existing, error: fetchError } = await supabase
      .from("participants")
      .select("id, full_name, team_id")
      .in("id", participant_ids);

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch participants", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!existing || existing.length !== participant_ids.length) {
      return NextResponse.json(
        { error: "One or more participant IDs not found" },
        { status: 404 }
      );
    }

    const alreadyAssigned = existing.filter((p) => p.team_id !== null);
    if (alreadyAssigned.length > 0) {
      return NextResponse.json(
        {
          error: "One or more participants already belong to a team",
          participants: alreadyAssigned.map((p) => ({
            id: p.id,
            full_name: p.full_name,
            team_id: p.team_id,
          })),
        },
        { status: 409 }
      );
    }

    // Auto-generate team name if not provided
    let teamName = name;
    if (!teamName) {
      const { count, error: countError } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true });

      if (countError) {
        return NextResponse.json(
          { error: "Failed to generate team name", details: countError.message },
          { status: 500 }
        );
      }

      teamName = `Team ${(count ?? 0) + 1}`;
    }

    // Create the team
    const { data: team, error: createError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        invite_code: generateInviteCode(),
        formation_type: "admin_assigned",
        is_complete: participant_ids.length >= 5,
        is_locked: false,
        aggregate_roles: [],
        aggregate_skills: [],
      })
      .select()
      .single();

    if (createError || !team) {
      return NextResponse.json(
        { error: "Failed to create team", details: createError?.message },
        { status: 500 }
      );
    }

    // Assign participants to the team
    const { error: assignError } = await supabase
      .from("participants")
      .update({ team_id: team.id })
      .in("id", participant_ids);

    if (assignError) {
      // Rollback: delete the team we just created
      await supabase.from("teams").delete().eq("id", team.id);
      return NextResponse.json(
        { error: "Failed to assign participants", details: assignError.message },
        { status: 500 }
      );
    }

    // Compute aggregate roles and skills from assigned members
    const { data: members } = await supabase
      .from("participants")
      .select("primary_role, specific_skills")
      .eq("team_id", team.id);

    if (members) {
      const aggregateRoles = [...new Set(members.map((m) => m.primary_role))];
      const aggregateSkills = [
        ...new Set(members.flatMap((m) => m.specific_skills)),
      ];

      await supabase
        .from("teams")
        .update({ aggregate_roles: aggregateRoles, aggregate_skills: aggregateSkills })
        .eq("id", team.id);
    }

    // Write audit log entry
    const { error: auditError } = await supabase
      .from("team_audit_log")
      .insert({
        team_id: team.id,
        admin_id: admin.id,
        action: "create_team",
        details: {
          team_name: teamName,
          participant_ids,
          formation_type: "admin_assigned",
        },
      });

    if (auditError) {
      console.error("Audit log write failed:", auditError.message);
    }

    // Fetch full team with members for response
    const { data: fullMembers } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", team.id);

    return NextResponse.json(
      {
        ...team,
        name: teamName,
        aggregate_roles: members
          ? [...new Set(members.map((m) => m.primary_role))]
          : [],
        aggregate_skills: members
          ? [...new Set(members.flatMap((m) => m.specific_skills))]
          : [],
        members: fullMembers ?? [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create team error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

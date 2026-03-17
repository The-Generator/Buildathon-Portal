import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { EVENT_CONFIG } from "@/lib/constants";
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

    // Determine the next team_number from the current max
    const { data: maxRow } = await supabase
      .from("teams")
      .select("team_number")
      .order("team_number", { ascending: false })
      .limit(1)
      .single();

    const teamNumber = (maxRow?.team_number ?? 0) + 1;
    const roomNumber = ((teamNumber - 1) % EVENT_CONFIG.roomCount) + 1;

    // Auto-generate team name if not provided
    const teamName = name ?? `Team ${teamNumber}`;

    // Create the team
    let createdTeam: Record<string, unknown> | null = null;

    const { data: team, error: createError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        team_number: teamNumber,
        room_number: roomNumber,
        formation_type: "admin_assigned",
        is_complete: participant_ids.length >= 5,
        is_locked: false,
        aggregate_roles: [],
        aggregate_skills: [],
      })
      .select()
      .single();

    // Retry once on unique constraint violation (concurrent request race)
    if (createError?.code === "23505") {
      const { data: retryMax } = await supabase
        .from("teams")
        .select("team_number")
        .order("team_number", { ascending: false })
        .limit(1)
        .single();

      const retryNumber = (retryMax?.team_number ?? 0) + 1;
      const retryRoom = ((retryNumber - 1) % EVENT_CONFIG.roomCount) + 1;

      const { data: retryTeam, error: retryError } = await supabase
        .from("teams")
        .insert({
          name: name ?? `Team ${retryNumber}`,
          team_number: retryNumber,
          room_number: retryRoom,
          formation_type: "admin_assigned",
          is_complete: participant_ids.length >= 5,
          is_locked: false,
          aggregate_roles: [],
          aggregate_skills: [],
        })
        .select()
        .single();

      if (retryError || !retryTeam) {
        return NextResponse.json(
          { error: "Failed to create team (conflict on team number)", details: retryError?.message },
          { status: 409 }
        );
      }

      createdTeam = retryTeam;
    } else if (createError || !team) {
      return NextResponse.json(
        { error: "Failed to create team", details: createError?.message },
        { status: 500 }
      );
    } else {
      createdTeam = team;
    }

    const teamId = createdTeam!.id as string;

    // Assign participants to the team
    const { error: assignError } = await supabase
      .from("participants")
      .update({ team_id: teamId })
      .in("id", participant_ids);

    if (assignError) {
      // Rollback: delete the team we just created
      await supabase.from("teams").delete().eq("id", teamId);
      return NextResponse.json(
        { error: "Failed to assign participants", details: assignError.message },
        { status: 500 }
      );
    }

    // Compute aggregate roles and skills from assigned members
    const { data: members } = await supabase
      .from("participants")
      .select("primary_role, specific_skills")
      .eq("team_id", teamId);

    if (members) {
      const aggregateRoles = [...new Set(members.map((m) => m.primary_role))];
      const aggregateSkills = [
        ...new Set(members.flatMap((m) => m.specific_skills)),
      ];

      await supabase
        .from("teams")
        .update({ aggregate_roles: aggregateRoles, aggregate_skills: aggregateSkills })
        .eq("id", teamId);
    }

    // Write audit log entry
    const { error: auditError } = await supabase
      .from("admin_actions")
      .insert({
        admin_email: admin.email,
        action_type: "created_team",
        team_id: teamId,
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
      .eq("team_id", teamId);

    return NextResponse.json(
      {
        ...createdTeam,
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

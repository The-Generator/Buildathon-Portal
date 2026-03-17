import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { EVENT_CONFIG } from "@/lib/constants";
import { z } from "zod";

const confirmMatchesSchema = z.object({
  matches: z.array(
    z.object({
      team_id: z.string(),
      participant_ids: z.array(z.string().uuid()).min(1),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const result = confirmMatchesSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { matches } = result.data;
    const supabase = createAdminClient();

    // Determine the next team_number from the current max
    const { data: maxRow } = await supabase
      .from("teams")
      .select("team_number")
      .order("team_number", { ascending: false })
      .limit(1)
      .single();

    let nextTeamNumber = (maxRow?.team_number ?? 0) + 1;

    const results = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const isDraftId = match.team_id.startsWith("draft-team-");

      let teamId = match.team_id;

      // If this is a draft team ID from the algorithm, create a new team
      if (isDraftId) {
        const teamNumber = nextTeamNumber++;
        const roomNumber = ((teamNumber - 1) % EVENT_CONFIG.roomCount) + 1;
        const teamName = `Team ${teamNumber}`;

        const { data: newTeam, error: createError } = await supabase
          .from("teams")
          .insert({
            name: teamName,
            team_number: teamNumber,
            room_number: roomNumber,
            formation_type: "algorithm_matched",
            is_complete: match.participant_ids.length >= 5,
            is_locked: true,
            aggregate_roles: [],
            aggregate_skills: [],
          })
          .select("id")
          .single();

        // Retry once on unique constraint violation (concurrent request race)
        if (createError?.code === "23505") {
          const { data: retryMax } = await supabase
            .from("teams")
            .select("team_number")
            .order("team_number", { ascending: false })
            .limit(1)
            .single();

          nextTeamNumber = (retryMax?.team_number ?? 0) + 1;
          const retryNumber = nextTeamNumber++;
          const retryRoom = ((retryNumber - 1) % EVENT_CONFIG.roomCount) + 1;

          const { data: retryTeam, error: retryError } = await supabase
            .from("teams")
            .insert({
              name: `Team ${retryNumber}`,
              team_number: retryNumber,
              room_number: retryRoom,
              formation_type: "algorithm_matched",
              is_complete: match.participant_ids.length >= 5,
              is_locked: true,
              aggregate_roles: [],
              aggregate_skills: [],
            })
            .select("id")
            .single();

          if (retryError || !retryTeam) {
            results.push({
              team_id: match.team_id,
              success: false,
              error: retryError?.message ?? "Failed to create team after retry",
            });
            continue;
          }

          teamId = retryTeam.id;
        } else if (createError || !newTeam) {
          results.push({
            team_id: match.team_id,
            success: false,
            error: createError?.message ?? "Failed to create team",
          });
          continue;
        } else {
          teamId = newTeam.id;
        }
      }

      // Update participants with team assignment
      const { error: assignError } = await supabase
        .from("participants")
        .update({ team_id: teamId })
        .in("id", match.participant_ids);

      if (assignError) {
        results.push({
          team_id: teamId,
          success: false,
          error: assignError.message,
        });
        continue;
      }

      // Lock the team and mark as complete (for existing teams that weren't just created)
      if (!isDraftId) {
        const { error: lockError } = await supabase
          .from("teams")
          .update({
            is_locked: true,
            is_complete: match.participant_ids.length >= 5,
            formation_type: "algorithm_matched",
          })
          .eq("id", teamId);

        if (lockError) {
          results.push({
            team_id: teamId,
            success: false,
            error: lockError.message,
          });
          continue;
        }
      }

      // Aggregate roles and skills for the team
      const { data: teamMembers } = await supabase
        .from("participants")
        .select("primary_role, specific_skills")
        .eq("team_id", teamId);

      if (teamMembers) {
        const aggregateRoles = [
          ...new Set(teamMembers.map((m) => m.primary_role)),
        ];
        const aggregateSkills = [
          ...new Set(teamMembers.flatMap((m) => m.specific_skills)),
        ];

        await supabase
          .from("teams")
          .update({
            aggregate_roles: aggregateRoles,
            aggregate_skills: aggregateSkills,
          })
          .eq("id", teamId);
      }

      results.push({
        team_id: teamId,
        success: true,
        participants_assigned: match.participant_ids.length,
      });
    }

    // Write audit entry for matching confirmation
    const successfulTeamIds = results
      .filter((r) => r.success)
      .map((r) => r.team_id);

    if (successfulTeamIds.length > 0) {
      const { error: auditError } = await supabase
        .from("admin_actions")
        .insert({
          admin_email: admin.email,
          action_type: "confirmed_matching",
          details: {
            teams_confirmed: successfulTeamIds.length,
            team_ids: successfulTeamIds,
          },
        });

      if (auditError) {
        console.error("Audit log write failed:", auditError.message);
      }
    }

    // Clean up empty teams left behind after reassignment
    const { data: allTeams } = await supabase.from("teams").select("id");
    if (allTeams) {
      const { data: assignedParticipants } = await supabase
        .from("participants")
        .select("team_id")
        .not("team_id", "is", null);

      const teamsWithMembers = new Set(
        (assignedParticipants ?? []).map((p) => p.team_id)
      );

      const emptyTeamIds = allTeams
        .map((t) => t.id)
        .filter((id) => !teamsWithMembers.has(id));

      if (emptyTeamIds.length > 0) {
        // Clear FK references before deleting
        await supabase
          .from("admin_actions")
          .update({ team_id: null })
          .in("team_id", emptyTeamIds);
        await supabase
          .from("team_audit_log")
          .delete()
          .in("team_id", emptyTeamIds);
        await supabase
          .from("registration_groups")
          .update({ team_id: null })
          .in("team_id", emptyTeamIds);

        await supabase.from("teams").delete().in("id", emptyTeamIds);
      }
    }

    return NextResponse.json(
      {
        message: "Matches confirmed successfully",
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Matching confirm error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

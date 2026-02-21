import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { z } from "zod";
import { generateInviteCode } from "@/lib/utils";

async function verifyAdmin() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const supabase = createAdminClient();

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", token)
    .single();

  if (error || !admin) {
    return null;
  }

  return admin;
}

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

    const results = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const isDraftId = match.team_id.startsWith("draft-team-");

      let teamId = match.team_id;

      // If this is a draft team ID from the algorithm, create a new team
      if (isDraftId) {
        const teamNumber = i + 1;
        const teamName = `Team ${teamNumber}`;

        const { data: newTeam, error: createError } = await supabase
          .from("teams")
          .insert({
            name: teamName,
            invite_code: generateInviteCode(),
            formation_type: "algorithm_matched",
            is_complete: match.participant_ids.length >= 5,
            is_locked: true,
            aggregate_roles: [],
            aggregate_skills: [],
          })
          .select("id")
          .single();

        if (createError || !newTeam) {
          results.push({
            team_id: match.team_id,
            success: false,
            error: createError?.message ?? "Failed to create team",
          });
          continue;
        }

        teamId = newTeam.id;
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

    // TODO: Send email notifications to matched participants (will be integrated later)

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

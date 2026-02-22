import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullRegistrationSchema } from "@/lib/validations";
import { generateInviteCode } from "@/lib/utils";
import { EVENT_CONFIG } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate request body
    const result = fullRegistrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = createAdminClient();
    const isSpectator = data.team_option === "spectator";

    // 2. Check for duplicate email (registrant)
    const { data: existingParticipant } = await supabase
      .from("participants")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        { error: "A participant with this email is already registered." },
        { status: 400 }
      );
    }

    // --- Spectator branch: no capacity check, no team, no registration_group ---
    if (isSpectator) {
      const { data: spectator, error: spectatorError } = await supabase
        .from("participants")
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          school: data.school,
          school_other: data.school === "Other" ? data.school_other : null,
          year: data.year,
          dietary_restrictions: data.dietary_restrictions || null,
          primary_role: data.primary_role ?? "",
          specific_skills: data.specific_skills ?? [],
          experience_level: data.experience_level ?? "",
          participant_type: "spectator",
          ai_tools: data.ai_tools ?? [],
          is_self_registered: true,
        })
        .select()
        .single();

      if (spectatorError || !spectator) {
        return NextResponse.json(
          { error: "Failed to create registration", details: spectatorError?.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "Spectator registration successful!",
          registrant: {
            id: spectator.id,
            full_name: spectator.full_name,
            email: spectator.email,
          },
        },
        { status: 201 }
      );
    }

    // --- Participant branch (solo, partial_team, full_team) ---

    // 3. Check total participant count against capacity (spectators excluded)
    const { count: participantCount, error: countError } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .neq("participant_type", "spectator");

    if (countError) {
      return NextResponse.json(
        { error: "Failed to check capacity" },
        { status: 500 }
      );
    }

    const incomingGroupSize = 1 + data.teammates.length;
    if ((participantCount ?? 0) + incomingGroupSize > EVENT_CONFIG.capacity) {
      return NextResponse.json(
        { error: "Event is at full capacity. Registration is closed." },
        { status: 400 }
      );
    }

    // Check teammate emails for duplicates
    for (const teammate of data.teammates) {
      const { data: existingTeammate } = await supabase
        .from("participants")
        .select("id")
        .eq("email", teammate.email)
        .single();

      if (existingTeammate) {
        return NextResponse.json(
          {
            error: `A participant with email ${teammate.email} is already registered.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Create participant record for registrant
    const { data: registrant, error: registrantError } = await supabase
      .from("participants")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        school: data.school,
        school_other: data.school === "Other" ? data.school_other : null,
        year: data.year,
        dietary_restrictions: data.dietary_restrictions || null,
        primary_role: data.primary_role ?? "",
        specific_skills: data.specific_skills ?? [],
        experience_level: data.experience_level ?? "",
        participant_type: "participant",
        ai_tools: data.ai_tools ?? [],
        is_self_registered: true,
      })
      .select()
      .single();

    if (registrantError || !registrant) {
      return NextResponse.json(
        { error: "Failed to create registration", details: registrantError?.message },
        { status: 500 }
      );
    }

    // 5. Create participant records for each teammate (placeholder profiles -- they complete their own later)
    const teammateRecords = [];
    for (const teammate of data.teammates) {
      const { data: teammateRecord, error: teammateError } = await supabase
        .from("participants")
        .insert({
          full_name: teammate.full_name,
          email: teammate.email,
          phone: "",
          school: data.school,
          year: data.year,
          primary_role: data.primary_role ?? "",
          specific_skills: [],
          experience_level: data.experience_level ?? "",
          participant_type: "participant",
          is_self_registered: false,
          registered_by: registrant.id,
        })
        .select()
        .single();

      if (teammateError || !teammateRecord) {
        console.error("Failed to create teammate:", teammateError?.message);
        continue;
      }
      teammateRecords.push(teammateRecord);
    }

    // 6. Determine team formation_type and is_complete
    const formationType =
      data.team_option === "full_team" ? "pre_formed" : "algorithm_matched";
    const isComplete = data.team_option === "full_team";

    // 7. Create team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: `${data.full_name}'s Team`,
        invite_code: generateInviteCode(),
        formation_type: formationType,
        is_complete: isComplete,
      })
      .select()
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Failed to create team", details: teamError?.message },
        { status: 500 }
      );
    }

    // 8. Assign team_id to all participants
    const allParticipantIds = [
      registrant.id,
      ...teammateRecords.map((t) => t.id),
    ];

    const { error: assignError } = await supabase
      .from("participants")
      .update({ team_id: team.id })
      .in("id", allParticipantIds);

    if (assignError) {
      console.error("Failed to assign team:", assignError.message);
    }

    // 9. Create registration_group record
    // Compute members_requested: only for partial_team with "yes" answer
    const membersRequested =
      data.team_option === "partial_team" && data.needs_more_members === "yes"
        ? data.members_requested ?? null
        : null;

    const { error: groupError } = await supabase
      .from("registration_groups")
      .insert({
        registrant_id: registrant.id,
        group_size: incomingGroupSize,
        members_requested: membersRequested,
        team_id: team.id,
        tagged_team_skills: data.tagged_team_skills,
      });

    if (groupError) {
      console.error("Failed to create registration group:", groupError.message);
    }

    // 10. Aggregate roles and skills onto the team
    const allParticipants = [registrant, ...teammateRecords];
    const aggregateRoles = [
      ...new Set(allParticipants.map((p) => p.primary_role)),
    ];
    const aggregateSkills = [
      ...new Set(allParticipants.flatMap((p) => p.specific_skills)),
    ];

    const { error: aggregateError } = await supabase
      .from("teams")
      .update({
        aggregate_roles: aggregateRoles,
        aggregate_skills: aggregateSkills,
      })
      .eq("id", team.id);

    if (aggregateError) {
      console.error("Failed to aggregate team data:", aggregateError.message);
    }

    // TODO: Send confirmation email to registrant and notification emails to teammates (will be integrated later)

    return NextResponse.json(
      {
        message: "Registration successful!",
        team: {
          id: team.id,
          name: team.name,
          invite_code: team.invite_code,
          is_complete: team.is_complete,
        },
        registrant: {
          id: registrant.id,
          full_name: registrant.full_name,
          email: registrant.email,
        },
        teammates: teammateRecords.map((t) => ({
          id: t.id,
          full_name: t.full_name,
          email: t.email,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

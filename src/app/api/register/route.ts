import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullRegistrationSchema } from "@/lib/validations";
import { EVENT_CONFIG } from "@/lib/constants";
import { sendEmail } from "@/lib/email/send";
import RegistrationConfirmation from "@/lib/email/templates/RegistrationConfirmation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate request body
    const result = fullRegistrationSchema.safeParse(body);
    if (!result.success) {
      console.error("Registration validation failed:", JSON.stringify(result.error.flatten(), null, 2));
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
          ai_tools_used: data.ai_tools_used ?? [],
          is_self_registered: true,
          linkedin_url: data.linkedin_url || null,
          portfolio_url: data.portfolio_url || null,
          bio: data.bio || null,
          photo_url: data.photo_url || null,
          profile_visible: data.profile_visible ?? false,
        })
        .select()
        .single();

      if (spectatorError || !spectator) {
        return NextResponse.json(
          { error: "Failed to create registration", details: spectatorError?.message },
          { status: 500 }
        );
      }

      // Send confirmation email (fire-and-forget)
      sendEmail({
        to: spectator.email,
        subject: `You're registered for ${EVENT_CONFIG.shortName}!`,
        react: createElement(RegistrationConfirmation, {
          participantName: spectator.full_name,
          teamOption: "spectator" as const,
          groupSize: 0,
          isRegisteredByOther: false,
        }),
      }).catch((err) => console.error("Spectator confirmation email failed:", err));

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

    // --- Participant branch (solo, partial_team) ---

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
        ai_tools_used: data.ai_tools_used ?? [],
        is_self_registered: true,
        linkedin_url: data.linkedin_url || null,
        portfolio_url: data.portfolio_url || null,
        bio: data.bio || null,
        photo_url: data.photo_url || null,
        profile_visible: true,
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

    // 6. Create registration_group record (no team yet — teams are created by matching)
    const { error: groupError } = await supabase
      .from("registration_groups")
      .insert({
        registrant_id: registrant.id,
        group_size: incomingGroupSize,
        members_requested: null,
        team_id: null,
        tagged_team_skills: data.tagged_team_skills,
      });

    if (groupError) {
      console.error("Failed to create registration group:", groupError.message);
    }

    // Send confirmation email to registrant
    sendEmail({
      to: registrant.email,
      subject: `You're registered for ${EVENT_CONFIG.shortName}!`,
      react: createElement(RegistrationConfirmation, {
        participantName: registrant.full_name,
        teamOption: data.team_option,
        groupSize: incomingGroupSize,
        isRegisteredByOther: false,
      }),
    }).catch((err) => console.error("Registration confirmation email failed:", err));

    // Send notification emails to teammates registered by this person
    for (const teammate of teammateRecords) {
      sendEmail({
        to: teammate.email,
        subject: `You're registered for ${EVENT_CONFIG.shortName}!`,
        react: createElement(RegistrationConfirmation, {
          participantName: teammate.full_name,
          teamOption: data.team_option,
          groupSize: incomingGroupSize,
          isRegisteredByOther: true,
          registeredByName: registrant.full_name,
        }),
      }).catch((err) => console.error("Teammate confirmation email failed:", err));
    }

    return NextResponse.json(
      {
        message: "Registration successful!",
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

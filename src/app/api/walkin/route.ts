import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { walkinSchema } from "@/lib/validations-walkin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate request body
    const result = walkinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = createAdminClient();

    // 2. Check for duplicate email -- return existing record if found
    const { data: existingParticipant } = await supabase
      .from("participants")
      .select("id, full_name, email, checked_in, checked_in_at")
      .eq("email", data.email)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        {
          message: "Participant already registered.",
          existing: true,
          participant: {
            id: existingParticipant.id,
            full_name: existingParticipant.full_name,
            email: existingParticipant.email,
            checked_in: existingParticipant.checked_in,
            checked_in_at: existingParticipant.checked_in_at,
          },
        },
        { status: 200 }
      );
    }

    // 3. Create walk-in participant (auto checked in)
    const { data: participant, error: insertError } = await supabase
      .from("participants")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        school: data.school,
        school_other: data.school === "Other" ? data.school_other : null,
        year: data.year,
        participant_type: "walk_in",
        primary_role: "",
        specific_skills: [],
        experience_level: "",
        ai_tools: [],
        is_self_registered: true,
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !participant) {
      return NextResponse.json(
        { error: "Failed to create walk-in participant", details: insertError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Walk-in registered and checked in!",
        existing: false,
        participant: {
          id: participant.id,
          full_name: participant.full_name,
          email: participant.email,
          checked_in: participant.checked_in,
          checked_in_at: participant.checked_in_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Walk-in registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { walkinSchema } from "@/lib/validations-walkin";

const WALKIN_PARTICIPANT_SELECT = "id, full_name, email, checked_in, checked_in_at";

type WalkinParticipant = {
  id: string;
  full_name: string;
  email: string;
  checked_in: boolean;
  checked_in_at: string | null;
};

function existingParticipantResponse(participant: WalkinParticipant) {
  return NextResponse.json(
    {
      message: "Participant already registered.",
      existing: true,
      participant,
    },
    { status: 200 }
  );
}

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
    const normalizedEmail = data.email.trim().toLowerCase();
    const trimmedPhone = data.phone.trim();

    const findExistingParticipant = async (): Promise<WalkinParticipant | null> => {
      const { data: existingParticipant, error: lookupError } = await supabase
        .from("participants")
        .select(WALKIN_PARTICIPANT_SELECT)
        .ilike("email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (lookupError) {
        throw lookupError;
      }

      return existingParticipant;
    };

    // 2. Check for duplicate email -- return existing record if found
    const existingParticipant = await findExistingParticipant();

    if (existingParticipant) {
      return existingParticipantResponse(existingParticipant);
    }

    // 3. Create walk-in participant (auto checked in)
    const { data: participant, error: insertError } = await supabase
      .from("participants")
      .insert({
        full_name: data.full_name,
        email: normalizedEmail,
        phone: trimmedPhone,
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

    if (insertError) {
      if (insertError.code === "23505") {
        const duplicateParticipant = await findExistingParticipant();
        if (duplicateParticipant) {
          return existingParticipantResponse(duplicateParticipant);
        }
      }

      return NextResponse.json(
        {
          error: "Failed to create walk-in participant",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { error: "Failed to create walk-in participant" },
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

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "Please provide an email or phone number." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();
    const supabase = createAdminClient();

    const { data: participant, error: lookupError } = await supabase
      .from("participants")
      .select("id, full_name, email, school, school_other, team_id, checked_in, checked_in_at")
      .or(`email.eq.${trimmedIdentifier},phone.eq.${trimmedIdentifier}`)
      .single();

    if (lookupError || !participant) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    // If they have a team, fetch the team name
    let teamName: string | null = null;
    if (participant.team_id) {
      const { data: team } = await supabase
        .from("teams")
        .select("name")
        .eq("id", participant.team_id)
        .single();
      teamName = team?.name ?? null;
    }

    return NextResponse.json({
      participant: {
        id: participant.id,
        full_name: participant.full_name,
        email: participant.email,
        school: participant.school_other || participant.school,
        team_name: teamName,
        checked_in: participant.checked_in,
        checked_in_at: participant.checked_in_at,
      },
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .select("id, full_name, team_id")
      .ilike("email", parsed.data.email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }
    if (!participant) {
      return NextResponse.json(
        { error: "No registration found for that email." },
        { status: 404 }
      );
    }
    if (!participant.team_id) {
      return NextResponse.json(
        { error: "You're not currently assigned to a team. Please find an organizer." },
        { status: 404 }
      );
    }

    // Try the full select (with deck columns); if the migration adding deck
    // columns hasn't been applied yet, fall back to a select without them so
    // the track declaration still works.
    let team: {
      id: string;
      name: string;
      team_number: number | null;
      track: string | null;
      deck_filename?: string | null;
      deck_uploaded_at?: string | null;
    } | null = null;

    const withDeck = await supabase
      .from("teams")
      .select("id, name, team_number, track, deck_filename, deck_uploaded_at")
      .eq("id", participant.team_id)
      .single();

    if (!withDeck.error && withDeck.data) {
      team = withDeck.data;
    } else {
      const basic = await supabase
        .from("teams")
        .select("id, name, team_number, track")
        .eq("id", participant.team_id)
        .single();
      if (basic.error || !basic.data) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      team = basic.data;
    }

    return NextResponse.json({
      team_id: team.id,
      team_number: team.team_number,
      team_name: team.name,
      current_track: team.track ?? null,
      current_deck_filename: team.deck_filename ?? null,
      current_deck_uploaded_at: team.deck_uploaded_at ?? null,
      member_full_name: participant.full_name,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

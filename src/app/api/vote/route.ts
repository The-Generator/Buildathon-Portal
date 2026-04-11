import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { CROWD_VOTING_OPEN, FINALISTS } from "@/lib/constants";

const TRACK_VALUES = [
  "athletic_performance",
  "accessibility_solutions",
  "entrepreneurial_ai",
] as const;

// Single ballot: email + exactly one team (identified by track + team_number).
const schema = z.object({
  email: z.string().email(),
  track: z.enum(TRACK_VALUES),
  team_number: z.number().int(),
});

export async function POST(request: NextRequest) {
  try {
    if (!CROWD_VOTING_OPEN) {
      return NextResponse.json({ error: "Voting is closed." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { track, team_number } = parsed.data;

    // Validate pick is an actual finalist for that track
    const allowed = FINALISTS[track].teams.map((t) => t.team_number);
    if (!allowed.includes(team_number)) {
      return NextResponse.json(
        { error: `Team #${team_number} isn't a finalist in ${FINALISTS[track].label}.` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Resolve team_number to team_id
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("team_number", team_number)
      .single();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // One vote per email total — clear any previous vote this email cast.
    await supabase.from("crowd_votes").delete().eq("voter_email", email);

    // Insert the new vote
    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from("crowd_votes").insert({
      voter_email: email,
      track,
      team_id: team.id,
      team_number,
      updated_at: now,
    });
    if (insertError) {
      return NextResponse.json(
        { error: "Could not record vote", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

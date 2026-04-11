import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { CROWD_VOTING_OPEN, FINALISTS } from "@/lib/constants";

const TRACK_VALUES = [
  "athletic_performance",
  "accessibility_solutions",
  "entrepreneurial_ai",
] as const;

// A single ballot: email + 0-3 picks (one per track). Optional per-track so
// voters don't have to pick every track if they missed a category.
const schema = z.object({
  email: z.string().email(),
  picks: z.object({
    athletic_performance: z.number().int().optional(),
    accessibility_solutions: z.number().int().optional(),
    entrepreneurial_ai: z.number().int().optional(),
  }),
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
    const picks = parsed.data.picks;

    // Validate each pick is actually a finalist for its track
    for (const track of TRACK_VALUES) {
      const picked = picks[track];
      if (picked == null) continue;
      const allowed = FINALISTS[track].teams.map((t) => t.team_number);
      if (!allowed.includes(picked)) {
        return NextResponse.json(
          { error: `Team #${picked} isn't a finalist in ${FINALISTS[track].label}.` },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // Resolve each picked team_number to a team_id
    const pickedNumbers = TRACK_VALUES.map((t) => picks[t]).filter(
      (n): n is number => typeof n === "number"
    );
    if (pickedNumbers.length === 0) {
      return NextResponse.json(
        { error: "Pick at least one team to vote." },
        { status: 400 }
      );
    }

    const { data: teamRows } = await supabase
      .from("teams")
      .select("id, team_number")
      .in("team_number", pickedNumbers);
    const teamIdByNumber = new Map<number, string>();
    for (const t of teamRows ?? []) {
      if (t.team_number != null) teamIdByNumber.set(t.team_number, t.id);
    }

    // Build the rows to upsert (one per track the voter picked)
    const rows: Array<{
      voter_email: string;
      track: (typeof TRACK_VALUES)[number];
      team_id: string;
      team_number: number;
      updated_at: string;
    }> = [];
    const now = new Date().toISOString();
    for (const track of TRACK_VALUES) {
      const num = picks[track];
      if (num == null) continue;
      const teamId = teamIdByNumber.get(num);
      if (!teamId) continue;
      rows.push({
        voter_email: email,
        track,
        team_id: teamId,
        team_number: num,
        updated_at: now,
      });
    }

    // Upsert each row individually so we don't clobber other tracks the voter
    // already voted on.
    for (const row of rows) {
      const { error } = await supabase
        .from("crowd_votes")
        .upsert(row, { onConflict: "voter_email,track" });
      if (error) {
        return NextResponse.json(
          { error: "Could not record vote", details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, recorded: rows.length });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

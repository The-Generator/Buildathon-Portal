import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getJudgeFromCookie } from "@/lib/judge-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const halfPoint = z
  .number()
  .min(1)
  .max(5)
  .refine((v) => v * 2 === Math.floor(v * 2), {
    message: "Must be a half-point value (1, 1.5, 2, ..., 5)",
  });

const schema = z.object({
  team_id: z.string().uuid(),
  team_number: z.number().int(),
  business_strength: halfPoint,
  track_focus: halfPoint,
  innovation: halfPoint,
  execution: halfPoint,
  presentation: halfPoint,
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const judge = await getJudgeFromCookie();
    if (!judge) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify team exists and that its declared track matches the judge's track
    const { data: team } = await supabase
      .from("teams")
      .select("id, track")
      .eq("id", parsed.data.team_id)
      .single();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    if (team.track && team.track !== judge.track) {
      return NextResponse.json(
        { error: "This team is competing in a different track." },
        { status: 403 }
      );
    }

    // Write-once: reject if a score already exists
    const { data: existing } = await supabase
      .from("judge_scores")
      .select("id")
      .eq("judge_name", judge.judge_name)
      .eq("team_id", parsed.data.team_id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "You've already scored this team." },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase.from("judge_scores").insert({
      judge_name: judge.judge_name,
      track: judge.track,
      team_id: parsed.data.team_id,
      team_number: parsed.data.team_number,
      business_strength: parsed.data.business_strength,
      track_focus: parsed.data.track_focus,
      innovation: parsed.data.innovation,
      execution: parsed.data.execution,
      presentation: parsed.data.presentation,
      notes: parsed.data.notes ?? null,
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Could not save score", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

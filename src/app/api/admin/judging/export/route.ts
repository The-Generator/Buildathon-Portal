import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = createAdminClient();

  const { data: scores, error } = await supabase
    .from("judge_scores")
    .select("judge_name, track, team_number, business_strength, track_focus, innovation, execution, presentation, total_score, notes, created_at")
    .order("track", { ascending: true })
    .order("team_number", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "judge_name",
    "track",
    "team_number",
    "business_strength",
    "track_focus",
    "innovation",
    "execution",
    "presentation",
    "total_score",
    "notes",
    "created_at",
  ].join(",");

  const lines = [header];
  for (const s of scores ?? []) {
    lines.push(
      [
        csvEscape(s.judge_name),
        csvEscape(s.track),
        csvEscape(s.team_number),
        csvEscape(s.business_strength),
        csvEscape(s.track_focus),
        csvEscape(s.innovation),
        csvEscape(s.execution),
        csvEscape(s.presentation),
        csvEscape(s.total_score),
        csvEscape(s.notes),
        csvEscape(s.created_at),
      ].join(",")
    );
  }

  const csv = lines.join("\n") + "\n";
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="judge-scores-${Date.now()}.csv"`,
    },
  });
}

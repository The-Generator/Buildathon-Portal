import { createAdminClient } from "@/lib/supabase/admin";
import { TRACKS, type TrackId } from "@/lib/constants";
import { JudgingExportButton } from "./export-button";

export const dynamic = "force-dynamic";

interface ScoreRow {
  id: string;
  judge_name: string;
  track: TrackId;
  team_id: string;
  team_number: number;
  business_strength: number;
  track_focus: number;
  innovation: number;
  execution: number;
  presentation: number;
  notes: string | null;
  total_score: number;
}

interface Aggregated {
  team_id: string;
  team_number: number;
  team_name: string;
  judges: number;
  business_strength: number;
  track_focus: number;
  innovation: number;
  execution: number;
  presentation: number;
  total: number;
}

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

async function getData() {
  const supabase = createAdminClient();

  const { data: scores } = await supabase
    .from("judge_scores")
    .select("*");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, team_number, track");

  return {
    scores: (scores ?? []) as ScoreRow[],
    teams: teams ?? [],
  };
}

function aggregateByTrack(scores: ScoreRow[], teams: Array<{ id: string; name: string; team_number: number | null }>): Record<TrackId, Aggregated[]> {
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const result: Record<TrackId, Aggregated[]> = {
    athletic_performance: [],
    accessibility_solutions: [],
    entrepreneurial_ai: [],
  };

  // Group scores by track + team
  const buckets = new Map<string, ScoreRow[]>();
  for (const s of scores) {
    const key = `${s.track}::${s.team_id}`;
    const arr = buckets.get(key) ?? [];
    arr.push(s);
    buckets.set(key, arr);
  }

  for (const [key, group] of buckets) {
    const [track, teamId] = key.split("::") as [TrackId, string];
    const team = teamById.get(teamId);
    if (!team) continue;
    const agg: Aggregated = {
      team_id: teamId,
      team_number: team.team_number ?? group[0].team_number,
      team_name: team.name,
      judges: group.length,
      business_strength: round1(avg(group.map((g) => Number(g.business_strength)))),
      track_focus: round1(avg(group.map((g) => Number(g.track_focus)))),
      innovation: round1(avg(group.map((g) => Number(g.innovation)))),
      execution: round1(avg(group.map((g) => Number(g.execution)))),
      presentation: round1(avg(group.map((g) => Number(g.presentation)))),
      total: 0,
    };
    agg.total = round1(
      agg.business_strength + agg.track_focus + agg.innovation + agg.execution + agg.presentation
    );
    result[track].push(agg);
  }

  // Sort each track with tiebreaker logic
  for (const trackInfo of TRACKS) {
    const arr = result[trackInfo.id];
    arr.sort((a, b) => {
      if (a.total !== b.total) return b.total - a.total;
      const tieValue = (x: Aggregated) =>
        trackInfo.tiebreaker === "track_focus" ? x.track_focus : x.business_strength;
      return tieValue(b) - tieValue(a);
    });
  }

  return result;
}

const MEDAL_BG = ["bg-yellow-50", "bg-gray-50", "bg-orange-50"];
const MEDAL_BORDER = ["border-yellow-300", "border-gray-300", "border-orange-300"];
const MEDAL_LABEL = ["🥇", "🥈", "🥉"];

export default async function AdminJudgingPage() {
  const { scores, teams } = await getData();
  const byTrack = aggregateByTrack(scores, teams);

  const totalSubmissions = scores.length;
  const teamsScored = new Set(scores.map((s) => `${s.track}::${s.team_id}`)).size;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Judging Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalSubmissions} score submissions across {teamsScored} team×track combos
          </p>
        </div>
        <JudgingExportButton />
      </div>

      {TRACKS.map((trackInfo) => {
        const rows = byTrack[trackInfo.id];
        return (
          <section key={trackInfo.id} className="mb-10">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">{trackInfo.title}</h2>
              <p className="text-sm italic text-gray-500">
                {trackInfo.subtitle} · Tiebreaker:{" "}
                {trackInfo.tiebreaker === "track_focus" ? "Track Focus" : "Business Strength"}
              </p>
            </div>

            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                No scores yet for this track.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Rank</th>
                      <th className="px-3 py-2 text-left">Team</th>
                      <th className="px-3 py-2 text-right">Business</th>
                      <th className="px-3 py-2 text-right">Track Focus</th>
                      <th className="px-3 py-2 text-right">Innovation</th>
                      <th className="px-3 py-2 text-right">Execution</th>
                      <th className="px-3 py-2 text-right">Presentation</th>
                      <th className="px-3 py-2 text-right font-bold">Total</th>
                      <th className="px-3 py-2 text-right">Judges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => {
                      const medal = i < 3 ? MEDAL_BG[i] : "";
                      const border = i < 3 ? MEDAL_BORDER[i] : "";
                      return (
                        <tr key={row.team_id} className={`${medal} ${i < 3 ? `border-l-4 ${border}` : ""}`}>
                          <td className="px-3 py-2 font-bold text-gray-900">
                            {i < 3 ? MEDAL_LABEL[i] : i + 1}
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-semibold text-gray-900">
                              <span className="text-emerald-700">#{row.team_number}</span> {row.team_name}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">{row.business_strength}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{row.track_focus}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{row.innovation}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{row.execution}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{row.presentation}</td>
                          <td className="px-3 py-2 text-right text-base font-bold text-gray-900">
                            {row.total}/25
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">{row.judges}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

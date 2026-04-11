import { createAdminClient } from "@/lib/supabase/admin";
import { FINALISTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type TrackId = keyof typeof FINALISTS;
const TRACK_ORDER: TrackId[] = [
  "athletic_performance",
  "accessibility_solutions",
  "entrepreneurial_ai",
];

async function getTallies() {
  const supabase = createAdminClient();

  // Try to query. If the table doesn't exist yet (migration 013 not applied),
  // return empty tallies with a flag.
  const { data, error } = await supabase
    .from("crowd_votes")
    .select("track, team_number, voter_email");

  if (error) {
    return { tallies: null as null | Map<string, Map<number, number>>, totalVoters: 0, missing: true };
  }

  const byTrack = new Map<string, Map<number, number>>();
  const voters = new Set<string>();
  for (const row of data ?? []) {
    voters.add(row.voter_email);
    const trackMap = byTrack.get(row.track) ?? new Map<number, number>();
    trackMap.set(row.team_number, (trackMap.get(row.team_number) ?? 0) + 1);
    byTrack.set(row.track, trackMap);
  }
  return { tallies: byTrack, totalVoters: voters.size, missing: false };
}

export default async function AdminVotePage() {
  const { tallies, totalVoters, missing } = await getTallies();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crowd Vote</h1>
          <p className="mt-1 text-sm text-gray-500">
            Live tally of finalist votes. Public voting page: <code>/vote</code>
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Unique Voters</p>
          <p className="text-2xl font-bold text-emerald-700">{totalVoters}</p>
        </div>
      </div>

      {missing && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Migration 013 not applied yet.</p>
          <p className="mt-1">
            Apply <code>supabase/migrations/013_crowd_votes.sql</code> in the Supabase SQL editor to start collecting votes.
          </p>
        </div>
      )}

      {TRACK_ORDER.map((trackId) => {
        const track = FINALISTS[trackId];
        const trackTally = tallies?.get(trackId) ?? new Map<number, number>();
        const trackTotal = [...trackTally.values()].reduce((a, b) => a + b, 0);

        // Sort finalists by vote count desc
        const rows = track.teams
          .map((t) => ({
            team_number: t.team_number,
            display_name: t.display_name,
            votes: trackTally.get(t.team_number) ?? 0,
          }))
          .sort((a, b) => b.votes - a.votes);

        const winner = rows[0];

        return (
          <section key={trackId} className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{track.label}</h2>
              <span className="text-xs font-medium text-gray-500">
                {trackTotal} vote{trackTotal === 1 ? "" : "s"}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {rows.map((r, i) => {
                const pct = trackTotal > 0 ? (r.votes / trackTotal) * 100 : 0;
                const isLead = i === 0 && r.votes > 0 && r.votes === winner.votes;
                return (
                  <div
                    key={r.team_number}
                    className={`border-b border-gray-100 last:border-b-0 p-4 ${
                      isLead ? "bg-yellow-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {isLead && <span className="text-xl">🥇</span>}
                        <p className="font-semibold text-gray-900">
                          <span className="text-emerald-700">Team #{r.team_number}</span>
                          {r.display_name && <span className="text-gray-700"> — {r.display_name}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{r.votes}</p>
                        <p className="text-xs text-gray-500">{pct.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full transition-all ${isLead ? "bg-yellow-400" : "bg-emerald-600"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

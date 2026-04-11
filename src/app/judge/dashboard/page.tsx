import { redirect } from "next/navigation";
import Link from "next/link";
import { getJudgeFromCookie } from "@/lib/judge-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRACKS, EVENT_CONFIG, WORKROOMS } from "@/lib/constants";
import { JudgeLogoutButton } from "./logout-button";

export const metadata = {
  title: `Judge Dashboard | ${EVENT_CONFIG.shortName}`,
};

export const dynamic = "force-dynamic";

export default async function JudgeDashboardPage() {
  const judge = await getJudgeFromCookie();
  if (!judge) redirect("/judge");

  const trackInfo = TRACKS.find((t) => t.id === judge.track);
  const supabase = createAdminClient();

  // Fetch teams declared in this track
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, team_number, room_number")
    .eq("track", judge.track)
    .order("team_number", { ascending: true, nullsFirst: false });

  // Fetch this judge's existing scores so we can mark which teams they've already done
  const { data: existingScores } = await supabase
    .from("judge_scores")
    .select("team_id")
    .eq("judge_name", judge.judge_name)
    .eq("track", judge.track);

  const scoredIds = new Set((existingScores ?? []).map((s) => s.team_id));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {trackInfo?.title}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Hi, {judge.judge_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {scoredIds.size} of {teams?.length ?? 0} teams scored
            </p>
          </div>
          <JudgeLogoutButton />
        </div>

        {/* Teams list */}
        {!teams || teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-gray-500">
              No teams have declared this track yet. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => {
              const scored = scoredIds.has(team.id);
              const room =
                team.room_number != null
                  ? WORKROOMS[team.room_number - 1] ?? `Room ${team.room_number}`
                  : null;
              return (
                <Link
                  key={team.id}
                  href={`/judge/score/${team.team_number ?? team.id}`}
                  className={`block rounded-xl border p-4 transition-colors ${
                    scored
                      ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        {team.team_number != null && (
                          <span className="text-emerald-700">#{team.team_number} </span>
                        )}
                        {team.name}
                      </p>
                      {room && (
                        <p className="mt-0.5 text-sm text-gray-500">{room}</p>
                      )}
                    </div>
                    {scored ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        Scored
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                        Score
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getJudgeFromCookie } from "@/lib/judge-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRACKS, RUBRIC, EVENT_CONFIG, WORKROOMS } from "@/lib/constants";
import { ScoreForm } from "./score-form";

export const metadata = {
  title: `Score Team | ${EVENT_CONFIG.shortName}`,
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ teamNumber: string }>;
}

export default async function ScoreTeamPage({ params }: PageProps) {
  const judge = await getJudgeFromCookie();
  if (!judge) redirect("/judge");

  const { teamNumber } = await params;
  const numericTeamNumber = parseInt(teamNumber, 10);
  if (isNaN(numericTeamNumber)) notFound();

  const supabase = createAdminClient();
  const { data: team } = await supabase
    .from("teams")
    .select("id, name, team_number, room_number, track")
    .eq("team_number", numericTeamNumber)
    .single();

  if (!team) notFound();

  // Block scoring if the team's declared track doesn't match the judge's track.
  // We allow it if the team has not declared yet — fail closed otherwise.
  const trackMismatch = team.track && team.track !== judge.track;

  // Check if this judge has already scored this team (write-once enforcement)
  const { data: existingScore } = await supabase
    .from("judge_scores")
    .select("id, business_strength, track_focus, innovation, execution, presentation, notes, total_score")
    .eq("judge_name", judge.judge_name)
    .eq("team_id", team.id)
    .maybeSingle();

  const trackInfo = TRACKS.find((t) => t.id === judge.track);
  const rubric = RUBRIC[judge.track];
  const room =
    team.room_number != null ? WORKROOMS[team.room_number - 1] ?? `Room ${team.room_number}` : null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/judge/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All teams
        </Link>

        {/* Team header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            {trackInfo?.title}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {team.team_number != null && (
              <span className="text-emerald-700">#{team.team_number} </span>
            )}
            {team.name}
          </h1>
          {room && <p className="mt-1 text-sm text-gray-500">{room}</p>}
          <p className="mt-3 text-xs italic text-gray-500">{rubric.tiebreakerNote}</p>
        </div>

        {trackMismatch && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Wrong track</p>
            <p className="mt-1">
              This team declared a different track than the one you&apos;re judging.
              Return to the dashboard.
            </p>
          </div>
        )}

        {existingScore && !trackMismatch && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">You&apos;ve already scored this team.</p>
            <p className="mt-1">
              Total: {existingScore.total_score}/25 (Business {existingScore.business_strength},
              Track {existingScore.track_focus}, Innovation {existingScore.innovation},
              Execution {existingScore.execution}, Presentation {existingScore.presentation})
            </p>
            {existingScore.notes && (
              <p className="mt-2">
                Notes: <span className="italic">{existingScore.notes}</span>
              </p>
            )}
          </div>
        )}

        {!existingScore && !trackMismatch && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <ScoreForm teamId={team.id} teamNumber={team.team_number ?? 0} />
          </div>
        )}
      </div>
    </div>
  );
}

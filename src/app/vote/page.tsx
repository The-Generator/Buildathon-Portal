import { CROWD_VOTING_OPEN, EVENT_CONFIG } from "@/lib/constants";
import { VoteForm } from "./vote-form";

export const metadata = {
  title: `Crowd Vote | ${EVENT_CONFIG.shortName}`,
};

export const dynamic = "force-dynamic";

export default function VotePage() {
  if (!CROWD_VOTING_OPEN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Voting is closed
          </h1>
          <p className="text-gray-600">
            Thanks for voting! The crowd vote has ended.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Build-a-thon 2026 · Finalists
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Crowd Vote
          </h1>
          <p className="mt-3 text-gray-600">
            Pick your favorite team in each track. You can update your vote
            later by re-submitting with the same email.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <VoteForm />
        </div>
      </div>
    </div>
  );
}

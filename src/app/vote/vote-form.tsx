"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FINALISTS } from "@/lib/constants";

type TrackId = keyof typeof FINALISTS;

const TRACK_ORDER: TrackId[] = [
  "athletic_performance",
  "accessibility_solutions",
  "entrepreneurial_ai",
];

interface Pick {
  track: TrackId;
  team_number: number;
}

export function VoteForm() {
  const [email, setEmail] = useState("");
  const [pick, setPick] = useState<Pick | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pick) {
      setError("Pick one team to vote for.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          track: pick.track,
          team_number: pick.team_number,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Vote failed");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Vote submitted!</h2>
        <p className="mt-2 text-gray-600">Thanks for voting.</p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setEmail("");
            setPick(null);
          }}
          className="mt-5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Submit another vote
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoFocus
      />
      <p className="mt-1 text-xs text-gray-400">
        We use your email only to prevent duplicate votes.
      </p>

      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Pick ONE favorite team out of all finalists:
        </p>

        <div className="space-y-6">
          {TRACK_ORDER.map((trackId) => {
            const track = FINALISTS[trackId];
            return (
              <div key={trackId}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  {track.label}
                </h3>
                <div className="space-y-2">
                  {track.teams.map((t) => {
                    const selected =
                      pick?.track === trackId && pick?.team_number === t.team_number;
                    return (
                      <button
                        type="button"
                        key={t.team_number}
                        onClick={() =>
                          setPick(
                            selected
                              ? null
                              : { track: trackId, team_number: t.team_number }
                          )
                        }
                        className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                          selected
                            ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-emerald-600 bg-emerald-600"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selected && (
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              <span className="text-emerald-700">Team #{t.team_number}</span>
                              {t.display_name && <span> — {t.display_name}</span>}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <Button
        type="submit"
        disabled={submitting || !email || !pick}
        className="mt-6 w-full"
      >
        {submitting ? "Submitting..." : "Submit Vote"}
      </Button>
    </form>
  );
}

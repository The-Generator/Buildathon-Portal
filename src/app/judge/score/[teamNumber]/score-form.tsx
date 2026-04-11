"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RUBRIC, SCORE_VALUES, type TrackId } from "@/lib/constants";
import { useEffect } from "react";

interface ScoreFormProps {
  teamId: string;
  teamNumber: number;
}

type CriterionKey = "business_strength" | "track_focus" | "innovation" | "execution" | "presentation";

export function ScoreForm({ teamId, teamNumber }: ScoreFormProps) {
  // We need the judge's track to render the right rubric. The track lives in
  // the judge cookie which is httpOnly — fetch it from a tiny endpoint.
  const [track, setTrack] = useState<TrackId | null>(null);
  const [scores, setScores] = useState<Record<CriterionKey, number | null>>({
    business_strength: null,
    track_focus: null,
    innovation: null,
    execution: null,
    presentation: null,
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/judge/me")
      .then((r) => r.json())
      .then((d) => setTrack(d.track ?? null));
  }, []);

  if (!track) {
    return <p className="text-sm text-gray-500">Loading rubric...</p>;
  }

  const rubric = RUBRIC[track];
  const total =
    (scores.business_strength ?? 0) +
    (scores.track_focus ?? 0) +
    (scores.innovation ?? 0) +
    (scores.execution ?? 0) +
    (scores.presentation ?? 0);

  const allFilled = Object.values(scores).every((v) => v !== null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allFilled) {
      setError("Please score all 5 criteria.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/judge/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          team_number: teamNumber,
          ...scores,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        return;
      }
      router.push("/judge/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-emerald-50 p-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Total Score
        </p>
        <p className="mt-1 text-3xl font-bold text-emerald-700">
          {total}/25
        </p>
      </div>

      {rubric.criteria.map((criterion) => (
        <div key={criterion.key} className="border-t border-gray-100 pt-5">
          <div className="mb-2">
            <p className="font-semibold text-gray-900">
              {criterion.label}
              {criterion.isTiebreaker && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Tiebreaker
                </span>
              )}
            </p>
            <p className="mt-0.5 text-sm italic text-gray-500">
              {criterion.whatToEvaluate}
            </p>
          </div>

          {/* Rubric levels */}
          <details className="mb-3 text-xs text-gray-600">
            <summary className="cursor-pointer font-medium text-emerald-700">
              Show rubric levels
            </summary>
            <ul className="mt-2 space-y-1 pl-1">
              {(Object.entries(criterion.levels) as Array<[string, string]>).map(([level, desc]) => (
                <li key={level}>
                  <span className="font-semibold text-gray-700">{level}:</span> {desc}
                </li>
              ))}
            </ul>
          </details>

          {/* Score buttons */}
          <div className="grid grid-cols-9 gap-1.5">
            {SCORE_VALUES.map((v) => {
              const selected = scores[criterion.key] === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setScores((prev) => ({ ...prev, [criterion.key]: v }))
                  }
                  className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-gray-100 pt-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes / Standout Features (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241] focus:border-[#006241]"
          placeholder="What stood out about this team?"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" disabled={submitting || !allFilled} className="w-full">
        {submitting ? "Submitting..." : `Submit Score (${total}/25)`}
      </Button>
    </form>
  );
}

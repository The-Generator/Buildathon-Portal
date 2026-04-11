"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRACKS, type TrackId } from "@/lib/constants";

interface LookupResult {
  team_id: string;
  team_number: number | null;
  team_name: string;
  current_track: TrackId | null;
  member_full_name: string;
}

export function DeclareTrackForm() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"lookup" | "pick" | "done">("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<LookupResult | null>(null);
  const [pickedTrack, setPickedTrack] = useState<TrackId | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/declare-track/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lookup failed");
        return;
      }
      setTeam(data);
      setPickedTrack(data.current_track ?? null);
      setStep("pick");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!team || !pickedTrack) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/declare-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: team.team_id, track: pickedTrack, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        return;
      }
      setStep("done");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    const trackInfo = TRACKS.find((t) => t.id === pickedTrack);
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Track saved!</h2>
        <p className="mt-2 text-gray-600">
          {team?.team_name} is competing in:
        </p>
        <p className="mt-1 text-lg font-semibold text-emerald-700">
          {trackInfo?.title}
        </p>
        <p className="mt-1 text-sm italic text-gray-500">{trackInfo?.subtitle}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setStep("lookup");
            setEmail("");
            setTeam(null);
            setPickedTrack(null);
          }}
        >
          Declare for another team
        </Button>
      </div>
    );
  }

  if (step === "pick" && team) {
    return (
      <div>
        <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Hi, {team.member_full_name} —</p>
          <p className="mt-1 text-base font-semibold text-gray-900">
            {team.team_number != null && (
              <span className="text-emerald-700">#{team.team_number} </span>
            )}
            {team.team_name}
          </p>
          {team.current_track && (
            <p className="mt-1 text-sm text-gray-600">
              Currently declared:{" "}
              <span className="font-medium">
                {TRACKS.find((t) => t.id === team.current_track)?.title}
              </span>
            </p>
          )}
        </div>

        <p className="mb-3 text-sm font-medium text-gray-700">
          Pick your track:
        </p>
        <div className="space-y-3">
          {TRACKS.map((t) => {
            const selected = pickedTrack === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPickedTrack(t.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-900">{t.title}</p>
                <p className="text-sm italic text-gray-500">{t.subtitle}</p>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setStep("lookup");
              setError(null);
            }}
            disabled={loading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !pickedTrack}
            className="flex-1"
          >
            {loading ? "Saving..." : "Confirm Track"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleLookup}>
      <Input
        label="Your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoFocus
      />
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      <Button type="submit" disabled={loading || !email} className="mt-5 w-full">
        {loading ? "Looking up..." : "Find My Team"}
      </Button>
    </form>
  );
}

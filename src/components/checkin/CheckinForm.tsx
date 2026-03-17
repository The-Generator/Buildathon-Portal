"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

type CheckinState =
  | "idle"
  | "loading"
  | "found_not_checked_in"
  | "found_checked_in"
  | "not_found"
  | "checking_in"
  | "checked_in_success";

interface ParticipantInfo {
  id: string;
  full_name: string;
  email: string;
  school: string;
  team_name: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
}

export function CheckinForm() {
  const [state, setState] = useState<CheckinState>("idle");
  const [identifier, setIdentifier] = useState("");
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const isStationMode = searchParams.get("mode") === "station";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setIdentifier("");
    setParticipant(null);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleLookup = async () => {
    if (!identifier.trim()) return;

    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/checkin/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      if (res.status === 404) {
        setState("not_found");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setState("idle");
        return;
      }

      const data = await res.json();
      setParticipant(data.participant);

      if (data.participant.checked_in) {
        setState("found_checked_in");
      } else {
        setState("found_not_checked_in");
      }
    } catch {
      setError("Network error. Please try again.");
      setState("idle");
    }
  };

  const handleCheckin = async () => {
    if (!participant) return;

    setState("checking_in");

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: participant.email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Check-in failed");
        setState("found_not_checked_in");
        return;
      }

      setState("checked_in_success");

      // Only auto-reset in station mode (organizer kiosk)
      if (isStationMode) {
        setTimeout(reset, 3000);
      }
    } catch {
      setError("Network error. Please try again.");
      setState("found_not_checked_in");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  // Success state
  if (state === "checked_in_success") {
    return (
      <div className="text-center py-8 animate-in fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6">
          <svg
            className="w-12 h-12 text-emerald-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-800 mb-2">
          You&apos;re checked in!
        </h3>
        <p className="text-lg text-gray-900 font-medium mb-1">
          {participant?.full_name}
        </p>
        {!isStationMode && (
          <>
            <p className="text-sm text-gray-500 mt-4">
              Show this screen at the door to skip the line
            </p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center justify-center rounded-xl font-semibold text-sm px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </>
        )}
        {isStationMode && (
          <p className="text-gray-500 text-sm mt-2">
            Welcome, {participant?.full_name}
          </p>
        )}
      </div>
    );
  }

  // Already checked in state
  if (state === "found_checked_in" && participant) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6">
          <svg
            className="w-12 h-12 text-emerald-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Already checked in
        </h3>
        <p className="text-lg text-gray-900 font-medium">{participant.full_name}</p>
        <p className="text-xs text-gray-400 mt-1">
          Checked in at{" "}
          {participant.checked_in_at
            ? new Date(participant.checked_in_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "earlier"}
        </p>
        {!isStationMode && (
          <p className="text-sm text-gray-500 mt-4">
            Show this screen at the door to skip the line
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-xl font-medium text-sm px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {isStationMode ? "Check in someone else" : "Done"}
        </button>
      </div>
    );
  }

  // Not found state
  if (state === "not_found") {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-3">
          <svg
            className="w-7 h-7 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-600 mb-1">
          Not found
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          No registration found for &quot;{identifier}&quot;.
          <br />
          Walk-in arrivals can use the fast intake form.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/walkin"
            className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-6 py-3 bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
          >
            Open walk-in intake
          </Link>
        </div>
      </div>
    );
  }

  // Found, ready to check in
  if ((state === "found_not_checked_in" || state === "checking_in") && participant) {
    return (
      <div className="py-2">
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-lg font-semibold text-gray-900">
            {participant.full_name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{participant.school}</p>
          {participant.team_name && (
            <p className="text-sm text-gray-500">
              Team: {participant.team_name}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
        )}

        <button
          onClick={handleCheckin}
          disabled={state === "checking_in"}
          className="w-full rounded-xl font-semibold text-lg px-6 py-4 bg-emerald-800 text-white hover:bg-emerald-900 transition-colors disabled:opacity-50"
        >
          {state === "checking_in" ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Checking in...
            </span>
          ) : (
            "Check In"
          )}
        </button>

        <button
          onClick={reset}
          className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Default: idle / loading state with search input
  return (
    <div>
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          inputMode="email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Email or phone number"
          disabled={state === "loading"}
          className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 disabled:opacity-50 placeholder:text-gray-400"
          autoComplete="email"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
      )}

      <button
        onClick={handleLookup}
        disabled={!identifier.trim() || state === "loading"}
        className="w-full rounded-xl font-semibold text-lg px-6 py-4 bg-emerald-800 text-white hover:bg-emerald-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Looking up...
          </span>
        ) : (
          "Look Up"
        )}
      </button>
    </div>
  );
}

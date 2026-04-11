"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, X } from "lucide-react";

interface SearchResult {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  school: string;
  team_id: string | null;
  team_number: number | null;
  room_number: number | null;
  checked_in: boolean;
  checked_in_at: string | null;
  participant_type: string;
}

const WORKROOMS = [
  "Malloy 102",
  "Malloy 201",
  "Malloy 202",
  "Olin 101",
  "Olin 102",
  "Olin 120",
  "Olin 202",
  "Olin 225",
  "Knight Auditorium",
  "FME Workshop",
];

export function CheckinSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: "success" | "error"; message: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();

      // Search participants by name OR email (case-insensitive)
      const { data: participants } = await supabase
        .from("participants")
        .select(
          "id, full_name, email, phone, school, team_id, checked_in, checked_in_at, participant_type"
        )
        .or(`full_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
        .order("full_name", { ascending: true })
        .limit(25);

      if (!participants) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Fetch team info for each result with a team
      const teamIds = Array.from(
        new Set(participants.map((p) => p.team_id).filter((id): id is string => !!id))
      );
      const teamsById = new Map<string, { team_number: number | null; room_number: number | null }>();
      if (teamIds.length > 0) {
        const { data: teams } = await supabase
          .from("teams")
          .select("id, team_number, room_number")
          .in("id", teamIds);
        for (const t of teams ?? []) teamsById.set(t.id, t);
      }

      const enriched: SearchResult[] = participants.map((p) => {
        const t = p.team_id ? teamsById.get(p.team_id) : null;
        return {
          ...p,
          team_number: t?.team_number ?? null,
          room_number: t?.room_number ?? null,
        };
      });

      setResults(enriched);
      setLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleCheckIn(participant: SearchResult) {
    setCheckingInId(participant.id);
    setFeedback(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: participant.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ id: participant.id, type: "error", message: data.error || "Failed" });
        return;
      }
      // Optimistically update the row so the UI reflects the new state
      setResults((prev) =>
        prev.map((r) =>
          r.id === participant.id
            ? { ...r, checked_in: true, checked_in_at: new Date().toISOString() }
            : r
        )
      );
      setFeedback({ id: participant.id, type: "success", message: "Checked in!" });
    } catch {
      setFeedback({ id: participant.id, type: "error", message: "Network error" });
    } finally {
      setCheckingInId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Search Participants</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Search by name or email to see who&apos;s checked in
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type at least 2 characters…"
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mt-4">
          {query.trim().length > 0 && query.trim().length < 2 && (
            <p className="text-sm text-gray-400">Type at least 2 characters…</p>
          )}
          {query.trim().length >= 2 && loading && (
            <p className="text-sm text-gray-400">Searching…</p>
          )}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="text-sm text-gray-400">No matches.</p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {results.map((p) => {
                const room =
                  p.room_number != null ? WORKROOMS[p.room_number - 1] ?? `Room ${p.room_number}` : null;
                const showFeedback = feedback?.id === p.id;
                return (
                  <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{p.full_name}</p>
                        {p.checked_in ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                            <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                            Checked in
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                            Not yet
                          </span>
                        )}
                        {p.participant_type === "spectator" && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-800">
                            Spectator
                          </span>
                        )}
                        {p.participant_type === "walk_in" && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-800">
                            Walk-in
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {p.email}
                        {" · "}
                        {p.school}
                        {p.team_number != null && (
                          <>
                            {" · "}
                            <span className="font-medium text-emerald-700">Team #{p.team_number}</span>
                          </>
                        )}
                        {room && <> · {room}</>}
                      </p>
                      {p.checked_in && p.checked_in_at && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {new Date(p.checked_in_at).toLocaleTimeString()}
                        </p>
                      )}
                      {showFeedback && (
                        <p
                          className={`mt-1 text-xs ${
                            feedback.type === "success" ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {feedback.message}
                        </p>
                      )}
                    </div>
                    {!p.checked_in && (
                      <button
                        onClick={() => handleCheckIn(p)}
                        disabled={checkingInId === p.id}
                        className="shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {checkingInId === p.id ? "Checking in…" : "Check In"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

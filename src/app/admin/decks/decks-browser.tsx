"use client";

import { useMemo, useState } from "react";
import { Search, X, Download, FileText } from "lucide-react";
import { WORKROOMS } from "@/lib/constants";

export interface TeamWithDeck {
  id: string;
  team_number: number | null;
  name: string;
  room_number: number | null;
  track: string | null;
  deck_filename: string | null;
  deck_uploaded_at: string | null;
  members: Array<{ id: string; full_name: string; email: string }>;
}

type Filter = "all" | "with_deck" | "without_deck";

const TRACK_LABEL: Record<string, string> = {
  athletic_performance: "Athletic",
  accessibility_solutions: "Accessibility",
  entrepreneurial_ai: "Entrepreneurial",
};

function getAdminToken() {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("admin_token="))
      ?.split("=")[1] ?? null
  );
}

export function DecksBrowser({ teams }: { teams: TeamWithDeck[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const trimmed = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      // Filter by deck status
      if (filter === "with_deck" && !t.deck_filename) return false;
      if (filter === "without_deck" && t.deck_filename) return false;

      if (!trimmed) return true;

      // Search by team number
      if (t.team_number != null && String(t.team_number).includes(trimmed)) return true;

      // Search by team name
      if (t.name.toLowerCase().includes(trimmed)) return true;

      // Search by deck filename
      if (t.deck_filename && t.deck_filename.toLowerCase().includes(trimmed)) return true;

      // Search by member name or email
      if (
        t.members.some(
          (m) =>
            m.full_name.toLowerCase().includes(trimmed) ||
            m.email.toLowerCase().includes(trimmed)
        )
      )
        return true;

      return false;
    });
  }, [teams, filter, trimmed]);

  const totalWithDeck = teams.filter((t) => t.deck_filename).length;
  const totalWithoutDeck = teams.length - totalWithDeck;

  async function handleDownload(teamId: string) {
    const token = getAdminToken();
    if (!token) {
      setDownloadError("Admin token missing. Re-login.");
      return;
    }
    setDownloadingId(teamId);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/deck`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        setDownloadError(err.error || "Download failed");
        return;
      }
      const data = await res.json();
      window.open(data.url, "_blank");
    } catch {
      setDownloadError("Network error");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      {/* Summary + filters */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">{totalWithDeck}</span>
              <span className="text-gray-500"> of </span>
              <span className="font-bold text-gray-900">{teams.length}</span>
              <span className="text-gray-500"> teams have uploaded a deck</span>
            </p>
          </div>
          <div className="flex gap-2">
            {(
              [
                ["all", "All"],
                ["with_deck", `Submitted (${totalWithDeck})`],
                ["without_deck", `Missing (${totalWithoutDeck})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === value
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by team number, team name, member name, or filename…"
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241] focus:border-[#006241]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {downloadError && (
        <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{downloadError}</p>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No matches.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((team) => {
            const room =
              team.room_number != null
                ? WORKROOMS[team.room_number - 1] ?? `Room ${team.room_number}`
                : null;
            const hasDeck = !!team.deck_filename;
            return (
              <div
                key={team.id}
                className={`rounded-xl border p-4 ${
                  hasDeck ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {team.team_number != null && (
                          <span className="text-emerald-700">#{team.team_number} </span>
                        )}
                        {team.name}
                      </h3>
                      {room && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                          {room}
                        </span>
                      )}
                      {team.track && TRACK_LABEL[team.track] && (
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-700">
                          {TRACK_LABEL[team.track]}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {team.members.length === 0
                        ? "No members"
                        : team.members.map((m) => m.full_name).join(", ")}
                    </p>

                    {hasDeck ? (
                      <div className="mt-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-700" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {team.deck_filename}
                          </p>
                          {team.deck_uploaded_at && (
                            <p className="text-xs text-gray-400">
                              Uploaded {new Date(team.deck_uploaded_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs italic text-gray-400">No deck uploaded yet</p>
                    )}
                  </div>

                  {hasDeck && (
                    <button
                      onClick={() => handleDownload(team.id)}
                      disabled={downloadingId === team.id}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {downloadingId === team.id ? "…" : "Download"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

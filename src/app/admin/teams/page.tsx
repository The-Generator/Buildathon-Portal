"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchingPreview } from "@/components/admin/MatchingPreview";
import { TeamActions } from "@/components/admin/TeamActions";
import { UnassignedQueue } from "@/components/admin/UnassignedQueue";
import { CreateTeamModal } from "@/components/admin/CreateTeamModal";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { EVENT_CONFIG, WORKROOMS } from "@/lib/constants";
import type { Team, Participant } from "@/types";

type TeamWithMembers = Team & { members: Participant[] };

type FilterOption = "all" | "complete" | "incomplete" | "locked";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return (
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("admin_token="))
        ?.split("=")[1] ?? null
    );
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const actionToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (): Promise<{ teams: TeamWithMembers[]; unassignedCount: number } | null> => {
    const supabase = createClient();

    const { data: teamData, error: tError } = await supabase
      .from("teams")
      .select("*")
      .order("team_number", { ascending: true, nullsFirst: false });

    if (tError) {
      console.error("Failed to fetch teams:", tError);
      return null;
    }

    const { data: pData } = await supabase
      .from("participants")
      .select("*");

    const participantsByTeam = new Map<string, Participant[]>();
    let unassigned = 0;
    for (const p of pData ?? []) {
      if (p.team_id) {
        const existing = participantsByTeam.get(p.team_id) ?? [];
        existing.push(p);
        participantsByTeam.set(p.team_id, existing);
      } else {
        unassigned++;
      }
    }

    return {
      teams: (teamData ?? []).map((t) => ({
        ...t,
        members: participantsByTeam.get(t.id) ?? [],
      })),
      unassignedCount: unassigned,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await fetchData();
      if (cancelled) return;
      if (result) {
        setTeams(result.teams);
        setUnassignedCount(result.unassignedCount);
      }
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  // Realtime subscription: teams + participants changes trigger debounced refetch
  useEffect(() => {
    const supabase = createClient();

    const debouncedRefetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSyncing(true);
        const result = await fetchData();
        if (result) {
          setTeams(result.teams);
          setUnassignedCount(result.unassignedCount);
        }
        setSyncing(false);
      }, 500);
    };

    const channel = supabase
      .channel("admin-teams-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        debouncedRefetch
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "participants" },
        (payload) => {
          const previousTeamId = (payload.old as { team_id?: string | null })
            ?.team_id;
          const nextTeamId = (payload.new as { team_id?: string | null })
            ?.team_id;
          if (previousTeamId === nextTeamId) return;
          debouncedRefetch();
        }
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const [unlockingAll, setUnlockingAll] = useState(false);
  const [dissolvingAll, setDissolvingAll] = useState(false);
  const [confirmDissolveAll, setConfirmDissolveAll] = useState(false);
  const [notifyingAll, setNotifyingAll] = useState(false);
  const [confirmNotifyAll, setConfirmNotifyAll] = useState(false);

  const hasIncompleteTeams = teams.some((t) => !t.is_complete);
  const hasLockedTeams = teams.some((t) => t.is_locked);
  const hasUnmatchedPotential = hasIncompleteTeams || teams.length === 0 || unassignedCount > 0;

  const showActionToast = useCallback((message: string) => {
    setActionToast(message);
    if (actionToastTimeout.current) clearTimeout(actionToastTimeout.current);
    actionToastTimeout.current = setTimeout(() => setActionToast(null), 3000);
  }, []);

  const unlockAll = useCallback(async () => {
    if (!adminToken) return;
    setUnlockingAll(true);
    const lockedTeams = teams.filter((t) => t.is_locked);
    await Promise.all(
      lockedTeams.map((t) =>
        fetch(`/api/teams/${t.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ is_locked: false }),
        })
      )
    );
    const data = await fetchData();
    if (data) { setTeams(data.teams); setUnassignedCount(data.unassignedCount); }
    setUnlockingAll(false);
    showActionToast(`Unlocked ${lockedTeams.length} teams`);
  }, [adminToken, teams, fetchData, showActionToast]);

  const dissolveAll = useCallback(async () => {
    if (!adminToken) return;
    setDissolvingAll(true);
    // Unlock all locked teams first
    const lockedTeams = teams.filter((t) => t.is_locked);
    if (lockedTeams.length > 0) {
      await Promise.all(
        lockedTeams.map((t) =>
          fetch(`/api/teams/${t.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ is_locked: false }),
          })
        )
      );
    }
    // Now dissolve all teams
    const count = teams.length;
    for (const t of teams) {
      await fetch(`/api/teams/${t.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
    const data = await fetchData();
    if (data) { setTeams(data.teams); setUnassignedCount(data.unassignedCount); }
    setDissolvingAll(false);
    setConfirmDissolveAll(false);
    showActionToast(`Dissolved ${count} teams`);
  }, [adminToken, teams, fetchData, showActionToast]);

  const notifyAllLocked = useCallback(async () => {
    if (!adminToken) return;
    setNotifyingAll(true);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ all_locked: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        showActionToast(`Notify failed: ${data.error}`);
        return;
      }

      const data = await res.json();
      showActionToast(
        `Sent ${data.sent} email${data.sent !== 1 ? "s" : ""}${data.failed > 0 ? `, ${data.failed} failed` : ""}`
      );
    } catch (err) {
      console.error("Notify all error:", err);
      showActionToast("Failed to send notifications");
    } finally {
      setNotifyingAll(false);
      setConfirmNotifyAll(false);
    }
  }, [adminToken, showActionToast]);

  const handleMatchingConfirmed = useCallback((toastMessage?: string) => {
    const refresh = async () => {
      setLoading(true);
      const data = await fetchData();
      if (data) {
        setTeams(data.teams);
        setUnassignedCount(data.unassignedCount);
      }
      setLoading(false);
      if (toastMessage) {
        showActionToast(toastMessage);
      }
    };

    void refresh();
  }, [fetchData, showActionToast]);

  const handleCreateTeamCreated = useCallback(() => {
    handleMatchingConfirmed("Team created");
  }, [handleMatchingConfirmed]);

  useEffect(() => {
    return () => {
      if (actionToastTimeout.current) clearTimeout(actionToastTimeout.current);
    };
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filtered = teams.filter((t) => {
    if (filter === "complete" && !t.is_complete) return false;
    if (filter === "incomplete" && t.is_complete) return false;
    if (filter === "locked" && !t.is_locked) return false;

    if (trimmedQuery) {
      const inTeamName = t.name?.toLowerCase().includes(trimmedQuery);
      const inTeamNumber = t.team_number != null && String(t.team_number).includes(trimmedQuery);
      const inMember = t.members.some(
        (m) =>
          m.full_name.toLowerCase().includes(trimmedQuery) ||
          m.email.toLowerCase().includes(trimmedQuery)
      );
      if (!inTeamName && !inTeamNumber && !inMember) return false;
    }

    return true;
  });

  const formationLabel = (type: string) => {
    const labels: Record<string, string> = {
      algorithm_matched: "Matched",
      admin_assigned: "Admin Assigned",
    };
    return labels[type] || type;
  };

  const formationColor = (type: string): "blue" | "purple" | "yellow" => {
    const colors: Record<string, "blue" | "purple" | "yellow"> = {
      algorithm_matched: "purple",
      admin_assigned: "yellow",
    };
    return colors[type] || "blue";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading teams...</div>
      </div>
    );
  }

  return (
    <div>
      {actionToast && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {actionToast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            {teams.length} total teams
            {syncing && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Syncing…
              </span>
            )}
          </p>
        </div>
        {adminToken && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {hasLockedTeams && (
              <Button
                size="sm"
                variant="outline"
                onClick={unlockAll}
                disabled={unlockingAll}
              >
                <Unlock className="h-4 w-4 mr-1.5" />
                {unlockingAll ? "Unlocking..." : "Unlock All"}
              </Button>
            )}
            {teams.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setConfirmDissolveAll(true)}
                disabled={dissolvingAll}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {dissolvingAll ? "Dissolving..." : "Dissolve All"}
              </Button>
            )}
            {hasLockedTeams && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmNotifyAll(true)}
                disabled={notifyingAll}
              >
                <Mail className="h-4 w-4 mr-1.5" />
                {notifyingAll ? "Sending..." : "Notify All"}
              </Button>
            )}
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Team
            </Button>
          </div>
        )}

        {/* Dissolve all confirmation */}
        {confirmDissolveAll && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Dissolve all {teams.length} teams?
            </p>
            <p className="text-xs text-red-600 mt-1">
              All participants will be moved to the unassigned queue. You can re-run matching afterward.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="destructive"
                onClick={dissolveAll}
                disabled={dissolvingAll}
              >
                {dissolvingAll ? "Dissolving..." : "Confirm Dissolve All"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDissolveAll(false)}
                disabled={dissolvingAll}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notify all confirmation */}
      {confirmNotifyAll && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">
            Notify all locked teams?
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This will send team assignment emails to{" "}
            {teams
              .filter((t) => t.is_locked)
              .reduce((sum, t) => sum + t.members.length, 0)}{" "}
            participants across{" "}
            {teams.filter((t) => t.is_locked).length} locked teams.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={notifyAllLocked}
              disabled={notifyingAll}
            >
              {notifyingAll ? "Sending..." : "Send Emails"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmNotifyAll(false)}
              disabled={notifyingAll}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Matching section - shown when there are incomplete teams or potential unmatched participants */}
      {adminToken && hasUnmatchedPotential && (
        <MatchingPreview
          adminToken={adminToken}
          hasLockedTeams={hasLockedTeams}
          onConfirmed={handleMatchingConfirmed}
        />
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, team name, or team number…"
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241] focus:border-[#006241]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(
          [
            ["all", "All"],
            ["complete", "Complete"],
            ["incomplete", "Incomplete"],
            ["locked", "Locked"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? "bg-emerald-700 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Team cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">
          No teams found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((team) => {
            const isExpanded = trimmedQuery !== "" || expandedId === team.id;

            return (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : team.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {team.team_number != null && (
                          <span className="text-emerald-700 mr-1.5">#{team.team_number}</span>
                        )}
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {team.members.length} member
                          {team.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-wrap justify-end">
                      {team.room_number != null && (
                        <Badge color="blue">{WORKROOMS[team.room_number - 1] ?? `Room ${team.room_number}`}</Badge>
                      )}
                      <Badge color={formationColor(team.formation_type)}>
                        {formationLabel(team.formation_type)}
                      </Badge>
                      <Badge color={team.is_complete ? "green" : "yellow"}>
                        {team.is_complete ? "Complete" : "Incomplete"}
                      </Badge>
                      {team.is_locked && (
                        <Badge color="red">Locked</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    {team.members.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No members yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {team.members.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {m.full_name}
                              </span>
                              <span className="text-gray-400 ml-2">
                                {m.email}
                              </span>
                            </div>
                            <Badge color="gray">{m.primary_role}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                    {team.project_name && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-medium">
                          Project
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {team.project_name}
                        </p>
                        {team.project_description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {team.project_description}
                          </p>
                        )}
                      </div>
                    )}
                    {adminToken && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <label className="text-xs text-gray-400 uppercase font-medium">
                          Room Assignment
                        </label>
                        <select
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
                          value={team.room_number ?? ""}
                          disabled={syncing}
                          onChange={async (e) => {
                            const val = e.target.value;
                            const room_number = val === "" ? null : Number(val);
                            const res = await fetch(`/api/teams/${team.id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${adminToken}`,
                              },
                              body: JSON.stringify({ room_number }),
                            });
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({ error: "Request failed" }));
                              showActionToast(`Failed: ${err.error}`);
                              const data = await fetchData();
                              if (data) { setTeams(data.teams); setUnassignedCount(data.unassignedCount); }
                              return;
                            }
                            const data = await fetchData();
                            if (data) { setTeams(data.teams); setUnassignedCount(data.unassignedCount); }
                            showActionToast(
                              room_number
                                ? `${team.name} → ${WORKROOMS[room_number - 1] ?? `Room ${room_number}`}`
                                : `${team.name} room cleared`
                            );
                          }}
                        >
                          <option value="">No room</option>
                          {WORKROOMS.map((name, i) => (
                            <option key={i + 1} value={i + 1}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {adminToken && (
                      <TeamActions
                        teamId={team.id}
                        teamName={team.name}
                        isLocked={team.is_locked}
                        isComplete={team.is_complete}
                        lockedBy={team.locked_by}
                        lockedAt={team.locked_at}
                        adminToken={adminToken}
                        members={team.members}
                        onUpdated={handleMatchingConfirmed}
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Unassigned participants queue */}
      {adminToken && (
        <UnassignedQueue
          adminToken={adminToken}
          onAssigned={handleMatchingConfirmed}
        />
      )}

      {/* Create team modal */}
      {adminToken && (
        <CreateTeamModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleCreateTeamCreated}
          adminToken={adminToken}
        />
      )}
    </div>
  );
}

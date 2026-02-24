"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Users, UserPlus } from "lucide-react";
import type { Participant, Team } from "@/types";

interface UnassignedQueueProps {
  adminToken: string;
  onAssigned: () => void;
}

export function UnassignedQueue({ adminToken, onAssigned }: UnassignedQueueProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<(Team & { member_count: number })[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: pData } = await supabase
      .from("participants")
      .select("*")
      .is("team_id", null)
      .neq("participant_type", "spectator")
      .order("full_name", { ascending: true });

    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true });

    const { data: allParticipants } = await supabase
      .from("participants")
      .select("id, team_id");

    const memberCounts = new Map<string, number>();
    for (const p of allParticipants ?? []) {
      if (p.team_id) {
        memberCounts.set(p.team_id, (memberCounts.get(p.team_id) ?? 0) + 1);
      }
    }

    const teamsWithCounts = (teamData ?? []).map((t) => ({
      ...t,
      member_count: memberCounts.get(t.id) ?? 0,
    }));

    setParticipants(pData ?? []);
    setTeams(teamsWithCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAssign = async (participantId: string, teamId: string) => {
    setAssigningId(participantId);
    setError(null);

    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ participant_ids: [participantId] }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to assign participant");
        return;
      }

      // Remove from local list and update team counts
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, member_count: t.member_count + 1 } : t
        )
      );
      setOpenDropdownId(null);
      onAssigned();
    } catch {
      setError("Network error — please try again");
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 animate-pulse text-sm text-gray-400">
        Loading unassigned participants...
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <Users className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Unassigned Queue
        </h3>
        <Badge color={participants.length > 0 ? "yellow" : "green"}>
          {participants.length}
        </Badge>
        <span className="ml-auto">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="mt-3">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 mb-3">
              {error}
            </div>
          )}

          {participants.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">
              All participants are assigned to teams.
            </p>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
              {participants.map((p) => {
                const isOpen = openDropdownId === p.id;
                const isAssigning = assigningId === p.id;

                return (
                  <div key={p.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {p.full_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">
                              {p.school}
                            </span>
                            <Badge color="gray">{p.primary_role}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          disabled={isAssigning}
                          onClick={() =>
                            setOpenDropdownId(isOpen ? null : p.id)
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isOpen
                              ? "bg-emerald-700 text-white"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          } disabled:opacity-50`}
                        >
                          {isAssigning ? (
                            <span className="animate-pulse">Assigning...</span>
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5" />
                              Assign
                            </>
                          )}
                        </button>

                        {/* Inline team dropdown */}
                        {isOpen && !isAssigning && (
                          <div className="absolute right-0 top-full mt-1 z-10 w-64 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {teams.filter((t) => t.member_count < 5 && !t.is_locked).length === 0 ? (
                              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                                No available teams
                              </div>
                            ) : (
                              teams.map((team) => {
                                const isFull = team.member_count >= 5;
                                const isLocked = team.is_locked;
                                const disabled = isFull || isLocked;

                                return (
                                  <button
                                    key={team.id}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleAssign(p.id, team.id)}
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                      disabled
                                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                                        : "hover:bg-emerald-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 truncate">
                                        {team.name}
                                      </span>
                                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {team.member_count}/5
                                        </span>
                                        {isLocked && (
                                          <Badge color="red">Locked</Badge>
                                        )}
                                        {isFull && !isLocked && (
                                          <Badge color="yellow">Full</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

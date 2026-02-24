"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Users, Zap } from "lucide-react";
import { QuickAssign } from "@/components/admin/QuickAssign";
import type { Participant, Team } from "@/types";

interface UnassignedQueueProps {
  adminToken: string;
  onAssigned: () => void;
}

export function UnassignedQueue({ adminToken, onAssigned }: UnassignedQueueProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<(Team & { member_count: number; members: Participant[] })[]>([]);
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
      .select("*");

    const membersByTeam = new Map<string, Participant[]>();
    for (const p of (allParticipants ?? []) as Participant[]) {
      if (p.team_id) {
        const existing = membersByTeam.get(p.team_id) ?? [];
        existing.push(p);
        membersByTeam.set(p.team_id, existing);
      }
    }

    const teamsWithCounts = (teamData ?? []).map((t) => ({
      ...t,
      member_count: membersByTeam.get(t.id)?.length ?? 0,
      members: membersByTeam.get(t.id) ?? [],
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

      // Remove from local list and update team counts + members
      const assigned = participants.find((p) => p.id === participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? {
                ...t,
                member_count: t.member_count + 1,
                members: assigned ? [...t.members, assigned] : t.members,
              }
            : t
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
                              <Zap className="h-3.5 w-3.5" />
                              Quick Assign
                            </>
                          )}
                        </button>

                        {/* Ranked team dropdown */}
                        {isOpen && !isAssigning && (
                          <div className="absolute right-0 top-full mt-1 z-10 w-72 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            <QuickAssign
                              participant={p}
                              teams={teams}
                              onAssigned={handleAssign}
                              disabled={isAssigning}
                            />
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

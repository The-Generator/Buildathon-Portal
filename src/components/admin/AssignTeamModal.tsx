"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { Users, Star } from "lucide-react";
import type { Participant, Team } from "@/types";

interface AssignTeamModalProps {
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
  participant: Participant;
  adminToken: string;
}

type TeamWithCount = Team & { member_count: number; members: Participant[] };

function scoreTeamForParticipant(participant: Participant, team: TeamWithCount) {
  let role = 0;
  let skills = 0;
  let school = 0;

  const teamRoles = new Set(team.members.map((m) => m.primary_role));
  if (!teamRoles.has(participant.primary_role)) role = 3;

  const teamSkills = new Set(team.members.flatMap((m) => m.specific_skills));
  for (const skill of participant.specific_skills) {
    if (teamSkills.has(skill)) skills += 1;
  }

  const teamSchools = new Set(team.members.map((m) => m.school));
  if (team.members.length > 0 && !teamSchools.has(participant.school)) school = 1;

  return { score: role + skills + school, breakdown: { role, skills, school } };
}

export function AssignTeamModal({
  open,
  onClose,
  onAssigned,
  participant,
  adminToken,
}: AssignTeamModalProps) {
  const [teams, setTeams] = useState<(TeamWithCount & { score: number; breakdown: { role: number; skills: number; school: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

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

    const teamsWithData = (teamData ?? [])
      .map((t) => {
        const members = membersByTeam.get(t.id) ?? [];
        const team = { ...t, member_count: members.length, members };
        const { score, breakdown } = scoreTeamForParticipant(participant, team as TeamWithCount);
        return { ...team, score, breakdown };
      })
      .filter((t) => !t.is_locked && t.member_count < 5)
      .sort((a, b) => b.score - a.score);

    setTeams(teamsWithData);
    setLoading(false);
  }, [participant]);

  useEffect(() => {
    if (open) {
      void fetchTeams();
      setError(null);
    }
  }, [open, fetchTeams]);

  const handleAssign = async (teamId: string) => {
    setAssigning(true);
    setError(null);

    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ participant_ids: [participant.id] }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to assign");
        setAssigning(false);
        return;
      }

      onAssigned();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Assign ${participant.full_name} to Team`}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400 animate-pulse">
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No available teams (all full or locked).
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-200">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              disabled={assigning}
              onClick={() => void handleAssign(team.id)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-gray-900 truncate">
                    {team.name}
                  </span>
                  {team.score > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3" />
                      {team.score}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                  <Users className="h-3 w-3" />
                  {team.member_count}/5
                </span>
              </div>
              {team.score > 0 && (
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  {team.breakdown.role > 0 && (
                    <span className="text-emerald-600">+{team.breakdown.role} role</span>
                  )}
                  {team.breakdown.skills > 0 && (
                    <span className="text-blue-600">+{team.breakdown.skills} skill{team.breakdown.skills !== 1 ? "s" : ""}</span>
                  )}
                  {team.breakdown.school > 0 && (
                    <span className="text-purple-600">+{team.breakdown.school} school</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

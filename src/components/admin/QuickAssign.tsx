"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";
import type { Participant } from "@/types";

interface TeamWithCount {
  id: string;
  name: string;
  is_locked: boolean;
  member_count: number;
  members: Participant[];
}

interface QuickAssignProps {
  participant: Participant;
  teams: TeamWithCount[];
  adminToken: string;
  onAssigned: (participantId: string, teamId: string) => void;
  disabled?: boolean;
}

interface RankedTeam extends TeamWithCount {
  score: number;
  breakdown: { role: number; skills: number; school: number };
}

function scoreTeamForParticipant(
  participant: Participant,
  team: TeamWithCount
): { score: number; breakdown: { role: number; skills: number; school: number } } {
  let role = 0;
  let skills = 0;
  let school = 0;

  // +3 if no one on the team has the same primary_role
  const teamRoles = new Set(team.members.map((m) => m.primary_role));
  if (!teamRoles.has(participant.primary_role)) {
    role = 3;
  }

  // +1 per overlapping skill between participant and team aggregate
  const teamSkills = new Set(team.members.flatMap((m) => m.specific_skills));
  for (const skill of participant.specific_skills) {
    if (teamSkills.has(skill)) {
      skills += 1;
    }
  }

  // +1 if different school from all current members
  const teamSchools = new Set(team.members.map((m) => m.school));
  if (team.members.length > 0 && !teamSchools.has(participant.school)) {
    school = 1;
  }

  return { score: role + skills + school, breakdown: { role, skills, school } };
}

function rankTeams(
  participant: Participant,
  teams: TeamWithCount[]
): RankedTeam[] {
  return teams
    .map((team) => {
      const { score, breakdown } = scoreTeamForParticipant(participant, team);
      return { ...team, score, breakdown };
    })
    .sort((a, b) => {
      // Available teams first, then by score descending
      const aDisabled = a.member_count >= 5 || a.is_locked;
      const bDisabled = b.member_count >= 5 || b.is_locked;
      if (aDisabled !== bDisabled) return aDisabled ? 1 : -1;
      return b.score - a.score;
    });
}

export function QuickAssign({
  participant,
  teams,
  onAssigned,
  disabled,
}: QuickAssignProps) {
  const [assigning, setAssigning] = useState(false);

  const ranked = rankTeams(participant, teams);

  if (ranked.length === 0) {
    return (
      <div className="px-3 py-4 text-sm text-gray-400 text-center">
        No teams available
      </div>
    );
  }

  const handleClick = async (teamId: string) => {
    if (assigning || disabled) return;
    setAssigning(true);
    try {
      onAssigned(participant.id, teamId);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {ranked.map((team) => {
        const isFull = team.member_count >= 5;
        const isLocked = team.is_locked;
        const isDisabled = isFull || isLocked || assigning || disabled;

        return (
          <button
            key={team.id}
            type="button"
            disabled={isDisabled}
            onClick={() => void handleClick(team.id)}
            className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
              isDisabled
                ? "opacity-40 cursor-not-allowed bg-gray-50"
                : "hover:bg-emerald-50"
            }`}
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {team.member_count}/5
                </span>
                {isLocked && <Badge color="red">Locked</Badge>}
                {isFull && !isLocked && <Badge color="yellow">Full</Badge>}
              </div>
            </div>
            {/* Score breakdown for available teams with non-zero score */}
            {!isFull && !isLocked && team.score > 0 && (
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
        );
      })}
    </div>
  );
}

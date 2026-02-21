"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Users } from "lucide-react";
import type { SerializedDraftTeam } from "@/lib/matching/types";

interface TeamCardProps {
  team: SerializedDraftTeam;
  index: number;
}

function scoreColor(score: number): "green" | "yellow" | "red" {
  if (score > 70) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

export function TeamCard({ team, index }: TeamCardProps) {
  const isIncomplete = team.members.length < 5;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              Team {index + 1}
            </h3>
            {isIncomplete && (
              <Badge color="yellow">
                {team.members.length}/5
              </Badge>
            )}
          </div>
          <Badge color={scoreColor(team.score)}>
            {team.score.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {team.members.map((member) => {
            const isGroupMember =
              member.registrationGroupId !== null && member.groupSize > 1;

            return (
              <li
                key={member.participantId}
                className="flex items-start justify-between text-sm gap-2"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {isGroupMember && (
                    <Link className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  )}
                  <span className="font-medium text-gray-900 truncate">
                    {member.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge color="gray" className="text-[10px] px-1.5">
                    {member.school}
                  </Badge>
                  <Badge color="blue" className="text-[10px] px-1.5">
                    {member.primaryRole}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Skill tags */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {Array.from(
              new Set(team.members.flatMap((m) => m.specificSkills))
            )
              .slice(0, 8)
              .map((skill) => (
                <span
                  key={skill}
                  className="inline-block rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600 border border-gray-200"
                >
                  {skill}
                </span>
              ))}
            {(() => {
              const totalSkills = new Set(
                team.members.flatMap((m) => m.specificSkills)
              ).size;
              return totalSkills > 8 ? (
                <span className="inline-block rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">
                  +{totalSkills - 8} more
                </span>
              ) : null;
            })()}
          </div>
        </div>

        {/* Group vs solo indicator */}
        {team.groupIds.length > 0 && (
          <div className="mt-2 text-[10px] text-gray-400">
            <Link className="h-3 w-3 inline mr-1" />
            {team.groupIds.length} registration group
            {team.groupIds.length !== 1 ? "s" : ""} kept together
          </div>
        )}
      </CardContent>
    </Card>
  );
}

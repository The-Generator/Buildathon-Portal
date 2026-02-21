"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Participant } from "@/types";

interface ParticipantRowProps {
  participant: Participant & { team_name?: string };
}

export function ParticipantRow({ participant }: ParticipantRowProps) {
  const [expanded, setExpanded] = useState(false);

  const schoolDisplay =
    participant.school === "Other"
      ? participant.school_other || "Other"
      : participant.school;

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="text-gray-400">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-900">
              {participant.full_name}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {participant.email}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{schoolDisplay}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {participant.primary_role}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {participant.team_name || (
            <span className="text-gray-400">Unassigned</span>
          )}
        </td>
        <td className="px-4 py-3">
          <Badge color={participant.checked_in ? "green" : "gray"}>
            {participant.checked_in ? "Checked In" : "Not Checked In"}
          </Badge>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(participant.created_at).toLocaleDateString()}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={7} className="px-4 py-4">
            <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                  Phone
                </p>
                <p className="text-gray-700">{participant.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                  Year
                </p>
                <p className="text-gray-700">{participant.year}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                  Experience Level
                </p>
                <p className="text-gray-700">{participant.experience_level}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {participant.specific_skills?.length > 0 ? (
                    participant.specific_skills.map((skill) => (
                      <Badge key={skill} color="blue">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">None listed</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                  Dietary Restrictions
                </p>
                <p className="text-gray-700">
                  {participant.dietary_restrictions || "None"}
                </p>
              </div>
              {participant.checked_in_at && (
                <div>
                  <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                    Checked In At
                  </p>
                  <p className="text-gray-700">
                    {new Date(participant.checked_in_at).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">
                  Registration Type
                </p>
                <p className="text-gray-700">
                  {participant.is_self_registered
                    ? "Self-registered"
                    : "Registered by team lead"}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

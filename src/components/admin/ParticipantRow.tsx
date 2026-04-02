"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Pencil, Users, Trash2, Mail } from "lucide-react";
import type { Participant, Team } from "@/types";

interface ParticipantRowProps {
  participant: Participant & { team_name?: string };
  onEdit?: (participant: Participant) => void;
  onQuickAssign?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
  onResendConfirmation?: (participant: Participant) => void;
  teams?: (Team & { member_count: number })[];
}

const typeConfig: Record<string, { label: string; color: "green" | "gray" | "orange" }> = {
  participant: { label: "Participant", color: "green" },
  spectator: { label: "Spectator", color: "gray" },
  walk_in: { label: "Walk-in", color: "orange" },
};

export function ParticipantRow({ participant, onEdit, onQuickAssign, onDelete, onResendConfirmation }: ParticipantRowProps) {
  const [expanded, setExpanded] = useState(false);

  const schoolDisplay =
    participant.school === "Other"
      ? participant.school_other || "Other"
      : participant.school;

  const pType = typeConfig[participant.participant_type] ?? {
    label: participant.participant_type,
    color: "gray" as const,
  };

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
            <Badge color={pType.color}>{pType.label}</Badge>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {participant.email}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{schoolDisplay}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {participant.primary_role || <span className="text-gray-400">—</span>}
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
                <p className="text-gray-700">
                  {participant.experience_level || <span className="text-gray-400">Not set</span>}
                </p>
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

            {/* Action buttons */}
            {(onEdit || onQuickAssign || onDelete || onResendConfirmation) && (
              <div className="ml-8 mt-4 pt-3 border-t border-gray-200 flex gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(participant);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
                {onResendConfirmation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResendConfirmation(participant);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Resend Confirmation
                  </button>
                )}
                {onQuickAssign && !participant.team_id && participant.participant_type !== "spectator" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAssign(participant);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Assign to Team
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(participant);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Pencil, Users, Trash2, Mail, Link2, X, Plus, Search } from "lucide-react";
import type { Participant, Team } from "@/types";

export interface GroupMember {
  id: string;
  full_name: string;
  email: string;
  isRegistrant: boolean;
}

interface ParticipantRowProps {
  participant: Participant & { team_name?: string };
  groupMembers?: GroupMember[];
  allParticipants?: Participant[];
  onEdit?: (participant: Participant) => void;
  onQuickAssign?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
  onResendConfirmation?: (participant: Participant) => void;
  onGroupChange?: () => void;
  adminToken?: string | null;
  teams?: (Team & { member_count: number })[];
}

const typeConfig: Record<string, { label: string; color: "green" | "gray" | "orange" }> = {
  participant: { label: "Participant", color: "green" },
  spectator: { label: "Spectator", color: "gray" },
  walk_in: { label: "Walk-in", color: "orange" },
};

export function ParticipantRow({
  participant,
  groupMembers,
  allParticipants,
  onEdit,
  onQuickAssign,
  onDelete,
  onResendConfirmation,
  onGroupChange,
  adminToken,
}: ParticipantRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [addingToGroup, setAddingToGroup] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);

  const schoolDisplay =
    participant.school === "Other"
      ? participant.school_other || "Other"
      : participant.school;

  const pType = typeConfig[participant.participant_type] ?? {
    label: participant.participant_type,
    color: "gray" as const,
  };

  // Determine the registrant ID for this participant's group
  const registrantId = participant.is_self_registered
    ? participant.id
    : participant.registered_by ?? null;

  const hasGroup = groupMembers && groupMembers.length > 1;

  const handleRemoveFromGroup = async (memberId: string) => {
    if (!adminToken || groupLoading) return;
    setGroupLoading(true);
    try {
      const res = await fetch("/api/admin/participants/group", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ participant_id: memberId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to remove from group");
      } else {
        onGroupChange?.();
      }
    } catch {
      alert("Network error");
    } finally {
      setGroupLoading(false);
    }
  };

  const handleAddToGroup = async (memberId: string) => {
    if (!adminToken || !registrantId || groupLoading) return;
    setGroupLoading(true);
    try {
      const res = await fetch("/api/admin/participants/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          participant_id: memberId,
          registrant_id: registrantId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to add to group");
      } else {
        setAddingToGroup(false);
        setGroupSearch("");
        onGroupChange?.();
      }
    } catch {
      alert("Network error");
    } finally {
      setGroupLoading(false);
    }
  };

  // Build list of eligible participants to add (not already in any group, not spectator)
  const groupMemberIds = new Set(groupMembers?.map((m) => m.id) ?? []);
  const addCandidates = addingToGroup && allParticipants
    ? allParticipants.filter((p) => {
        if (groupMemberIds.has(p.id)) return false;
        if (p.registered_by) return false; // already in a group
        if (p.participant_type === "spectator") return false;
        if (!groupSearch.trim()) return false;
        const q = groupSearch.toLowerCase();
        return (
          p.full_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
        );
      })
    : [];

  const canAddMore = (groupMembers?.length ?? 1) < 3;

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
            {hasGroup && (
              <span className="inline-flex items-center gap-0.5 text-xs text-blue-600">
                <Link2 className="h-3 w-3" />
                Group of {groupMembers.length}
              </span>
            )}
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

            {/* Registration Group */}
            {groupMembers && participant.participant_type !== "spectator" && (
              <div className="ml-8 mt-4 pt-3 border-t border-gray-200">
                <p className="text-gray-400 text-xs uppercase font-medium mb-2 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Registration Group
                </p>
                {groupMembers.length <= 1 && !addingToGroup ? (
                  <p className="text-sm text-gray-400">Solo registration — not paired with anyone.</p>
                ) : (
                  <div className="space-y-1.5">
                    {groupMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {m.full_name}
                          </span>
                          <span className="text-xs text-gray-400 truncate">
                            {m.email}
                          </span>
                          {m.isRegistrant && (
                            <Badge color="blue">Lead</Badge>
                          )}
                        </div>
                        {adminToken && !m.isRegistrant && (
                          <button
                            type="button"
                            disabled={groupLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromGroup(m.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Remove from group"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add to group */}
                {adminToken && canAddMore && participant.is_self_registered && (
                  <div className="mt-2">
                    {addingToGroup ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            autoFocus
                            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        {addCandidates.length > 0 && (
                          <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                            {addCandidates.slice(0, 10).map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                disabled={groupLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToGroup(c.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex justify-between items-center disabled:opacity-50"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">{c.full_name}</span>
                                  <span className="text-gray-400 ml-2 text-xs">{c.email}</span>
                                </div>
                                <Plus className="h-4 w-4 text-blue-600" />
                              </button>
                            ))}
                          </div>
                        )}
                        {groupSearch.trim() && addCandidates.length === 0 && (
                          <p className="text-xs text-gray-400 px-1">No eligible participants found.</p>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingToGroup(false);
                            setGroupSearch("");
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingToGroup(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Plus className="h-3 w-3" />
                        Add to group
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

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

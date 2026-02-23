"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight } from "lucide-react";
import type { Participant, Team } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface MoveParticipantModalProps {
  open: boolean;
  onClose: () => void;
  participant: Participant;
  sourceTeamId: string;
  sourceTeamName: string;
  adminToken: string;
  onMoved: () => void;
}

export function MoveParticipantModal({
  open,
  onClose,
  participant,
  sourceTeamId,
  sourceTeamName,
  adminToken,
  onMoved,
}: MoveParticipantModalProps) {
  const [teams, setTeams] = useState<(Team & { members: { id: string }[] })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true });

    const { data: pData } = await supabase
      .from("participants")
      .select("id, team_id");

    const memberCounts = new Map<string, { id: string }[]>();
    for (const p of pData ?? []) {
      if (p.team_id) {
        const existing = memberCounts.get(p.team_id) ?? [];
        existing.push({ id: p.id });
        memberCounts.set(p.team_id, existing);
      }
    }

    const teamsWithMembers = (teamData ?? [])
      .filter((t) => t.id !== sourceTeamId)
      .map((t) => ({
        ...t,
        members: memberCounts.get(t.id) ?? [],
      }));

    setTeams(teamsWithMembers);
    setLoading(false);
  }, [sourceTeamId]);

  useEffect(() => {
    if (open) {
      setSelectedTeamId(null);
      setError(null);
      void fetchTeams();
    }
  }, [open, fetchTeams]);

  const handleMove = async () => {
    if (!selectedTeamId) return;

    setMoving(true);
    setError(null);

    try {
      const res = await fetch(`/api/teams/${sourceTeamId}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          participant_id: participant.id,
          target_team_id: selectedTeamId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to move participant");
        return;
      }

      onMoved();
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setMoving(false);
    }
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <Modal open={open} onClose={onClose} title="Move Participant">
      <div className="space-y-4">
        {/* Participant info */}
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-900">
            {participant.full_name}
          </p>
          <p className="text-xs text-gray-500">{participant.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge color="gray">{participant.primary_role}</Badge>
            <span className="text-xs text-gray-400">
              from <span className="font-medium">{sourceTeamName}</span>
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center justify-center text-gray-300">
          <ArrowRight className="h-5 w-5 rotate-90" />
        </div>

        {/* Target team selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select target team
          </label>

          {loading ? (
            <div className="text-sm text-gray-400 animate-pulse py-4 text-center">
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              No other teams available.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-gray-200 p-1">
              {teams.map((team) => {
                const memberCount = team.members.length;
                const isFull = memberCount >= 5;
                const isLocked = team.is_locked;
                const disabled = isFull || isLocked;
                const isSelected = selectedTeamId === team.id;

                return (
                  <button
                    key={team.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-emerald-50 border border-emerald-300"
                        : disabled
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {team.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {memberCount}/5
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
              })}
            </div>
          )}
        </div>

        {/* Confirmation summary */}
        {selectedTeam && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            Move <span className="font-medium">{participant.full_name}</span>{" "}
            from <span className="font-medium">{sourceTeamName}</span> to{" "}
            <span className="font-medium">{selectedTeam.name}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedTeamId || moving}
            onClick={handleMove}
          >
            {moving ? (
              <span className="animate-pulse">Moving...</span>
            ) : (
              "Confirm Move"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

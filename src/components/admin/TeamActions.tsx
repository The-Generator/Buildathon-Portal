"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckCircle, XCircle, ArrowRightLeft, Trash2 } from "lucide-react";
import { MoveParticipantModal } from "@/components/admin/MoveParticipantModal";
import type { Participant } from "@/types";

interface TeamActionsProps {
  teamId: string;
  teamName: string;
  isLocked: boolean;
  isComplete: boolean;
  adminToken: string;
  members: Participant[];
  onUpdated: (toastMessage?: string) => void;
}

export function TeamActions({
  teamId,
  teamName,
  isLocked,
  isComplete,
  adminToken,
  members,
  onUpdated,
}: TeamActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [moveParticipant, setMoveParticipant] = useState<Participant | null>(
    null
  );
  const [confirmDissolve, setConfirmDissolve] = useState(false);

  const patchTeam = async (field: string, value: boolean) => {
    setLoading(field);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Team update failed:", err);
        return;
      }

      onUpdated();
    } catch (err) {
      console.error("Team update error:", err);
    } finally {
      setLoading(null);
    }
  };

  const dissolveTeam = async () => {
    setLoading("dissolve");
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Team dissolve failed:", err);
        return;
      }

      setConfirmDissolve(false);
      onUpdated("Team dissolved");
    } catch (err) {
      console.error("Team dissolve error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        <Button
          variant={isLocked ? "outline" : "secondary"}
          size="sm"
          disabled={loading !== null}
          onClick={() => patchTeam("is_locked", !isLocked)}
        >
          {loading === "is_locked" ? (
            <span className="animate-pulse">...</span>
          ) : isLocked ? (
            <>
              <Unlock className="h-3.5 w-3.5 mr-1.5" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Lock
            </>
          )}
        </Button>

        <Button
          variant={isComplete ? "outline" : "secondary"}
          size="sm"
          disabled={loading !== null}
          onClick={() => patchTeam("is_complete", !isComplete)}
        >
          {loading === "is_complete" ? (
            <span className="animate-pulse">...</span>
          ) : isComplete ? (
            <>
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Mark Incomplete
            </>
          ) : (
            <>
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Mark Complete
            </>
          )}
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            disabled={loading !== null || isLocked}
            onClick={() => setConfirmDissolve(true)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            title={isLocked ? "Unlock first" : undefined}
          >
            {loading === "dissolve" ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Dissolve
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dissolve confirmation */}
      {confirmDissolve && (
        <div className="mt-2 p-3 rounded-lg border border-red-200 bg-red-50">
          <p className="text-sm text-red-800 font-medium">
            Dissolve {teamName}?
          </p>
          <p className="text-xs text-red-600 mt-1">
            This frees {members.length} member{members.length !== 1 ? "s" : ""} to the unassigned queue.
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={loading !== null}
              onClick={dissolveTeam}
            >
              {loading === "dissolve" ? "Dissolving..." : "Confirm"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={loading !== null}
              onClick={() => setConfirmDissolve(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Per-member move buttons */}
      {members.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">
            Move Member
          </p>
          <div className="space-y-1">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMoveParticipant(m)}
                className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-gray-700 truncate">{m.full_name}</span>
                <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Move modal */}
      {moveParticipant && (
        <MoveParticipantModal
          open={!!moveParticipant}
          onClose={() => setMoveParticipant(null)}
          participant={moveParticipant}
          sourceTeamId={teamId}
          sourceTeamName={teamName}
          adminToken={adminToken}
          onMoved={() => {
            setMoveParticipant(null);
            onUpdated();
          }}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckCircle, XCircle, ArrowRightLeft } from "lucide-react";
import { MoveParticipantModal } from "@/components/admin/MoveParticipantModal";
import type { Participant } from "@/types";

interface TeamActionsProps {
  teamId: string;
  teamName: string;
  isLocked: boolean;
  isComplete: boolean;
  adminToken: string;
  members: Participant[];
  onUpdated: () => void;
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
      </div>

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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckCircle, XCircle, ArrowRightLeft, Trash2, UserMinus, Mail } from "lucide-react";
import { MoveParticipantModal } from "@/components/admin/MoveParticipantModal";
import type { Participant } from "@/types";

interface TeamActionsProps {
  teamId: string;
  teamName: string;
  isLocked: boolean;
  isComplete: boolean;
  lockedBy?: string | null;
  lockedAt?: string | null;
  adminToken: string;
  members: Participant[];
  onUpdated: (toastMessage?: string) => void;
}

export function TeamActions({
  teamId,
  teamName,
  isLocked,
  isComplete,
  lockedBy,
  lockedAt,
  adminToken,
  members,
  onUpdated,
}: TeamActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [moveParticipant, setMoveParticipant] = useState<Participant | null>(
    null
  );
  const [confirmDissolve, setConfirmDissolve] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [showPostEditNotifyPrompt, setShowPostEditNotifyPrompt] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{ sent: number; failed: number } | null>(null);

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

      setShowPostEditNotifyPrompt(true);
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

  const removeMember = async (participantId: string) => {
    setRemovingMemberId(participantId);
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ participant_id: participantId }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Remove member failed:", err);
        return;
      }

      onUpdated("Member removed to unassigned queue");
    } catch (err) {
      console.error("Remove member error:", err);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const notifyTeam = async () => {
    setNotifying(true);
    setNotifyResult(null);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ team_ids: [teamId] }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Notify failed:", err);
        onUpdated("Failed to send notifications");
        return;
      }

      const data = await res.json();
      setNotifyResult({ sent: data.sent, failed: data.failed });
      setShowPostEditNotifyPrompt(false);
      onUpdated(`Notified ${data.sent} member${data.sent !== 1 ? "s" : ""}`);
    } catch (err) {
      console.error("Notify error:", err);
      onUpdated("Failed to send notifications");
    } finally {
      setNotifying(false);
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

        <Button
          variant="outline"
          size="sm"
          disabled={loading !== null || notifying || members.length === 0}
          onClick={notifyTeam}
          title={members.length === 0 ? "No members to notify" : undefined}
        >
          {notifying ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            <>
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Notify Team
            </>
          )}
        </Button>
      </div>

      {/* Locked-by info */}
      {isLocked && lockedBy && (
        <p className="text-xs text-gray-500 mt-1.5">
          Locked by {lockedBy}
          {lockedAt &&
            ` at ${new Date(lockedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
        </p>
      )}

      {/* Notify result */}
      {notifyResult && (
        <p className="text-xs text-gray-500 mt-1.5">
          Emails sent: {notifyResult.sent}
          {notifyResult.failed > 0 && (
            <span className="text-red-500 ml-1">({notifyResult.failed} failed)</span>
          )}
        </p>
      )}

      {/* Post-edit notify confirmation */}
      {showPostEditNotifyPrompt && members.length > 0 && (
        <div className="mt-2 p-3 rounded-lg border border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-800 font-medium">
            Send notification email to team members?
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              disabled={notifying}
              onClick={notifyTeam}
            >
              {notifying ? "Sending..." : "Yes, send"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={notifying}
              onClick={() => setShowPostEditNotifyPrompt(false)}
            >
              No
            </Button>
          </div>
        </div>
      )}

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

      {/* Per-member actions */}
      {members.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">
            Manage Members
          </p>
          <div className="space-y-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 truncate flex-1">{m.full_name}</span>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setMoveParticipant(m)}
                    disabled={loading !== null || removingMemberId !== null}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Move to another team"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMember(m.id)}
                    disabled={loading !== null || removingMemberId !== null}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Remove from team"
                  >
                    {removingMemberId === m.id ? (
                      <span className="block h-3.5 w-3.5 animate-pulse text-center text-xs">...</span>
                    ) : (
                      <UserMinus className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
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
            setShowPostEditNotifyPrompt(true);
            onUpdated();
          }}
        />
      )}
    </>
  );
}

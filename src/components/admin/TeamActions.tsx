"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckCircle, XCircle } from "lucide-react";

interface TeamActionsProps {
  teamId: string;
  isLocked: boolean;
  isComplete: boolean;
  adminToken: string;
  onUpdated: () => void;
}

export function TeamActions({
  teamId,
  isLocked,
  isComplete,
  adminToken,
  onUpdated,
}: TeamActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

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
  );
}

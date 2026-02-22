"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Loader2, Radio, Lock } from "lucide-react";

export function TrackReleaseToggle() {
  const [trackReleased, setTrackReleased] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.user.email) throw new Error("Not authenticated");
    return `Bearer ${session.user.email}`;
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const auth = await getAuthHeader();
      const res = await fetch("/api/admin/tracks", {
        headers: { Authorization: auth },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTrackReleased(data.track_released);
      setUpdatedAt(data.updated_at);
      setError(null);
    } catch {
      setError("Failed to load track release state");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleToggle = async () => {
    setConfirmOpen(false);
    setToggling(true);
    setError(null);

    try {
      const auth = await getAuthHeader();
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { Authorization: auth },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to toggle");
      }

      const data = await res.json();
      setTrackReleased(data.track_released);
      setUpdatedAt(data.updated_at);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Loading track state...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          {trackReleased ? (
            <Radio className="h-5 w-5 text-emerald-700" />
          ) : (
            <Lock className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="text-sm font-semibold text-gray-900">
            Track / Theme Release
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {trackReleased ? "Released" : "Locked"}
            </p>
            {updatedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Updated{" "}
                {new Date(updatedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <button
            type="button"
            role="switch"
            aria-label="Toggle track and theme visibility"
            aria-checked={trackReleased}
            disabled={toggling}
            onClick={() => setConfirmOpen(true)}
            className={`relative inline-flex h-11 w-20 shrink-0 items-center cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              trackReleased ? "bg-emerald-700" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-9 w-9 rounded-full bg-white shadow transform transition-transform duration-200 ${
                trackReleased ? "translate-x-10" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={trackReleased ? "Lock Tracks?" : "Release Tracks?"}
      >
        <p className="text-sm text-gray-600 mb-6">
          {trackReleased
            ? "Locking tracks will hide the track and theme from participants. Are you sure?"
            : "Releasing tracks will make the track and theme visible to all participants. This is a significant action. Are you sure?"}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={trackReleased ? "destructive" : "primary"}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling
              ? "Updating..."
              : trackReleased
                ? "Lock Tracks"
                : "Release Tracks"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckinMetrics, type CheckinMetricsData } from "./CheckinMetrics";
import { CheckinLiveFeed } from "./CheckinLiveFeed";

export function CheckinDashboard() {
  const [metrics, setMetrics] = useState<CheckinMetricsData>({
    totalRegistered: 0,
    totalCheckedIn: 0,
    typeBreakdown: {},
    schoolBreakdown: {},
    unassignedWalkIns: 0,
  });
  const [manualEmail, setManualEmail] = useState("");
  const [manualStatus, setManualStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient();

    const { data: participants } = await supabase
      .from("participants")
      .select(
        "id, school, school_other, checked_in, participant_type, team_id"
      );

    if (!participants) return null;

    const total = participants.length;
    const checkedIn = participants.filter((p) => p.checked_in).length;

    const schoolBreakdown: Record<
      string,
      { total: number; checkedIn: number }
    > = {};
    const typeBreakdown: Record<
      string,
      { total: number; checkedIn: number }
    > = {};

    for (const p of participants) {
      const schoolKey = getParticipantSchoolLabel(p.school, p.school_other);
      if (!schoolBreakdown[schoolKey]) {
        schoolBreakdown[schoolKey] = { total: 0, checkedIn: 0 };
      }
      schoolBreakdown[schoolKey].total++;
      if (p.checked_in) schoolBreakdown[schoolKey].checkedIn++;

      const pType = p.participant_type || "participant";
      if (!typeBreakdown[pType]) {
        typeBreakdown[pType] = { total: 0, checkedIn: 0 };
      }
      typeBreakdown[pType].total++;
      if (p.checked_in) typeBreakdown[pType].checkedIn++;
    }

    const unassignedWalkIns = participants.filter(
      (p) => p.participant_type === "walk_in" && !p.team_id
    ).length;

    return {
      totalRegistered: total,
      totalCheckedIn: checkedIn,
      typeBreakdown,
      schoolBreakdown,
      unassignedWalkIns,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await fetchMetrics();
      if (!result || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }
      setMetrics(result);
      setLoading(false);
    };

    void load();

    // Realtime subscription for metrics refresh
    const supabase = createClient();
    const channel = supabase
      .channel("checkin-metrics-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "participants",
          filter: "checked_in=eq.true",
        },
        () => {
          void (async () => {
            const result = await fetchMetrics();
            if (!result || cancelled) return;
            setMetrics(result);
          })();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  const handleManualCheckin = async () => {
    if (!manualEmail.trim()) return;

    setManualLoading(true);
    setManualStatus(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: manualEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setManualStatus({ type: "error", message: data.error });
      } else if (
        data.participant?.checked_in &&
        data.message === "Already checked in"
      ) {
        setManualStatus({
          type: "success",
          message: `${data.participant.full_name} is already checked in.`,
        });
      } else {
        setManualStatus({
          type: "success",
          message: `${data.participant.full_name} checked in successfully!`,
        });
        setManualEmail("");
      }
    } catch {
      setManualStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    }

    setManualLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">
          Loading check-in data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics section */}
      <CheckinMetrics data={metrics} />

      {/* Live feed (self-contained realtime) */}
      <CheckinLiveFeed />

      {/* Manual Check-In */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Manual Check-In</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Check in a participant directly by email or phone number
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="flex gap-3 max-w-lg">
            <input
              type="text"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualCheckin()}
              placeholder="Email or phone number"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
            <button
              onClick={handleManualCheckin}
              disabled={!manualEmail.trim() || manualLoading}
              className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {manualLoading ? "Checking..." : "Check In"}
            </button>
          </div>
          {manualStatus && (
            <p
              className={`mt-2 text-sm ${
                manualStatus.type === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {manualStatus.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getParticipantSchoolLabel(
  school: string,
  schoolOther?: string | null
): string {
  if (school.trim().toLowerCase() === "other") {
    const other = schoolOther?.trim();
    return other && other.length > 0 ? other : "Other";
  }
  return school.trim() || "Other";
}

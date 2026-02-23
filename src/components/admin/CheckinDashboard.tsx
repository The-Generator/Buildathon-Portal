"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";
import { CheckinMetrics, type CheckinMetricsData } from "./CheckinMetrics";

interface RecentCheckin {
  id: string;
  full_name: string;
  school: string;
  checked_in_at: string;
}

export function CheckinDashboard() {
  const [metrics, setMetrics] = useState<CheckinMetricsData>({
    totalRegistered: 0,
    totalCheckedIn: 0,
    typeBreakdown: {},
    schoolBreakdown: {},
    unassignedWalkIns: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [manualStatus, setManualStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((name: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(name);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchStats = useCallback(async () => {
    const supabase = createClient();

    const { data: participants } = await supabase
      .from("participants")
      .select(
        "id, full_name, school, school_other, checked_in, checked_in_at, participant_type, team_id"
      );

    if (!participants) return null;

    const total = participants.length;
    const checkedIn = participants.filter((p) => p.checked_in).length;

    // School breakdown (with check-in counts)
    const schoolBreakdown: Record<
      string,
      { total: number; checkedIn: number }
    > = {};
    // Type breakdown (with check-in counts)
    const typeBreakdown: Record<
      string,
      { total: number; checkedIn: number }
    > = {};

    for (const p of participants) {
      // School
      const schoolKey = normalizeSchool(p.school);
      if (!schoolBreakdown[schoolKey]) {
        schoolBreakdown[schoolKey] = { total: 0, checkedIn: 0 };
      }
      schoolBreakdown[schoolKey].total++;
      if (p.checked_in) schoolBreakdown[schoolKey].checkedIn++;

      // Participant type
      const pType = p.participant_type || "participant";
      if (!typeBreakdown[pType]) {
        typeBreakdown[pType] = { total: 0, checkedIn: 0 };
      }
      typeBreakdown[pType].total++;
      if (p.checked_in) typeBreakdown[pType].checkedIn++;
    }

    // Unassigned walk-ins: walk_in type with no team_id
    const unassignedWalkIns = participants.filter(
      (p) => p.participant_type === "walk_in" && !p.team_id
    ).length;

    // Recent check-ins (last 20)
    const recent = participants
      .filter((p) => p.checked_in && p.checked_in_at)
      .sort(
        (a, b) =>
          new Date(b.checked_in_at!).getTime() -
          new Date(a.checked_in_at!).getTime()
      )
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        full_name: p.full_name,
        school: p.school_other || p.school,
        checked_in_at: p.checked_in_at!,
      }));

    return {
      metrics: {
        totalRegistered: total,
        totalCheckedIn: checkedIn,
        typeBreakdown,
        schoolBreakdown,
        unassignedWalkIns,
      },
      recentCheckins: recent,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await fetchStats();
      if (!result || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      setMetrics(result.metrics);
      setRecentCheckins(result.recentCheckins);
      setLoading(false);
    };

    void load();

    // Subscribe to realtime changes on participants table
    const supabase = createClient();
    const channel = supabase
      .channel("checkin-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "participants",
          filter: "checked_in=eq.true",
        },
        (payload) => {
          const updated = payload.new as {
            id: string;
            full_name: string;
            school: string;
            school_other?: string;
            checked_in: boolean;
            checked_in_at: string;
            participant_type?: string;
          };

          if (updated.checked_in) {
            setMetrics((prev) => {
              const schoolKey = normalizeSchool(updated.school);
              const pType = updated.participant_type || "participant";

              const nextSchool = { ...prev.schoolBreakdown };
              if (nextSchool[schoolKey]) {
                nextSchool[schoolKey] = {
                  ...nextSchool[schoolKey],
                  checkedIn: nextSchool[schoolKey].checkedIn + 1,
                };
              }

              const nextType = { ...prev.typeBreakdown };
              if (nextType[pType]) {
                nextType[pType] = {
                  ...nextType[pType],
                  checkedIn: nextType[pType].checkedIn + 1,
                };
              }

              return {
                ...prev,
                totalCheckedIn: prev.totalCheckedIn + 1,
                schoolBreakdown: nextSchool,
                typeBreakdown: nextType,
              };
            });

            // Prepend to recent check-ins
            const newCheckin: RecentCheckin = {
              id: updated.id,
              full_name: updated.full_name,
              school: updated.school_other || updated.school,
              checked_in_at: updated.checked_in_at,
            };
            setRecentCheckins((prev) => [newCheckin, ...prev].slice(0, 20));

            showToast(updated.full_name);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [fetchStats, showToast]);

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
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right fade-in bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          <span className="mr-2">&#10003;</span>
          {toast} just checked in
        </div>
      )}

      {/* Metrics section */}
      <CheckinMetrics data={metrics} />

      {/* Recent Check-ins Feed */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-gray-400" />
            Recent Check-ins
            <Badge color="green" className="ml-auto">
              Live
            </Badge>
          </h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {recentCheckins.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No check-ins yet
            </div>
          ) : (
            recentCheckins.map((checkin) => (
              <div
                key={checkin.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {checkin.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{checkin.school}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(checkin.checked_in_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

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

function normalizeSchool(school: string): string {
  const lower = school.toLowerCase();
  if (lower.includes("babson")) return "babson";
  if (lower.includes("bentley")) return "bentley";
  if (lower.includes("bryant")) return "bryant";
  return "other";
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Users, School, TrendingUp } from "lucide-react";

interface RecentCheckin {
  id: string;
  full_name: string;
  school: string;
  checked_in_at: string;
}

interface SchoolBreakdown {
  [school: string]: { total: number; checkedIn: number };
}

interface CheckinStats {
  totalRegistered: number;
  totalCheckedIn: number;
  schoolBreakdown: SchoolBreakdown;
  recentCheckins: RecentCheckin[];
}

const SCHOOL_LABELS: Record<string, string> = {
  babson: "Babson",
  bentley: "Bentley",
  bryant: "Bryant",
  other: "Other",
};

const SCHOOL_ORDER = ["babson", "bentley", "bryant", "other"];

export function CheckinDashboard() {
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);
  const [schoolBreakdown, setSchoolBreakdown] = useState<SchoolBreakdown>({});
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

  const fetchStats = useCallback(async (): Promise<CheckinStats | null> => {
    const supabase = createClient();

    // Fetch all participants with relevant fields
    const { data: participants } = await supabase
      .from("participants")
      .select("id, full_name, school, school_other, checked_in, checked_in_at");

    if (!participants) return null;

    const total = participants.length;
    const checkedIn = participants.filter((p) => p.checked_in).length;

    // School breakdown
    const breakdown: SchoolBreakdown = {};
    for (const p of participants) {
      const schoolKey = normalizeSchool(p.school);
      if (!breakdown[schoolKey]) {
        breakdown[schoolKey] = { total: 0, checkedIn: 0 };
      }
      breakdown[schoolKey].total++;
      if (p.checked_in) breakdown[schoolKey].checkedIn++;
    }

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
      totalRegistered: total,
      totalCheckedIn: checkedIn,
      schoolBreakdown: breakdown,
      recentCheckins: recent,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const stats = await fetchStats();
      if (!stats || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      setTotalRegistered(stats.totalRegistered);
      setTotalCheckedIn(stats.totalCheckedIn);
      setSchoolBreakdown(stats.schoolBreakdown);
      setRecentCheckins(stats.recentCheckins);
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
          };

          if (updated.checked_in) {
            // Increment checked-in counter
            setTotalCheckedIn((prev) => prev + 1);

            // Update school breakdown
            const schoolKey = normalizeSchool(updated.school);
            setSchoolBreakdown((prev) => {
              const next = { ...prev };
              if (next[schoolKey]) {
                next[schoolKey] = {
                  ...next[schoolKey],
                  checkedIn: next[schoolKey].checkedIn + 1,
                };
              }
              return next;
            });

            // Prepend to recent check-ins
            const newCheckin: RecentCheckin = {
              id: updated.id,
              full_name: updated.full_name,
              school: updated.school_other || updated.school,
              checked_in_at: updated.checked_in_at,
            };
            setRecentCheckins((prev) => [newCheckin, ...prev].slice(0, 20));

            // Show toast
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
      } else if (data.participant?.checked_in && data.message === "Already checked in") {
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
      setManualStatus({ type: "error", message: "Network error. Please try again." });
    }

    setManualLoading(false);
  };

  const percentage =
    totalRegistered > 0
      ? Math.round((totalCheckedIn / totalRegistered) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading check-in data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right fade-in bg-[#006241] text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          <span className="mr-2">&#10003;</span>
          {toast} just checked in
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Checked In"
          value={totalCheckedIn}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={`${percentage}% of registered`}
        />
        <StatCard
          label="Total Registered"
          value={totalRegistered}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Remaining"
          value={totalRegistered - totalCheckedIn}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="still expected"
        />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-[#006241] h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <School className="h-4 w-4 text-gray-400" />
              By School
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            {SCHOOL_ORDER.map((key) => {
              const data = schoolBreakdown[key];
              if (!data) return null;
              const pct =
                data.total > 0
                  ? Math.round((data.checkedIn / data.total) * 100)
                  : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {SCHOOL_LABELS[key] || key}
                    </span>
                    <span className="text-gray-500">
                      {data.checkedIn}/{data.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#006241] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Check-ins Feed */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
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
                    {new Date(checkin.checked_in_at).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
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
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241] focus:border-[#006241]"
            />
            <button
              onClick={handleManualCheckin}
              disabled={!manualEmail.trim() || manualLoading}
              className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-4 py-2 bg-[#006241] text-white hover:bg-[#004d33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {manualLoading ? "Checking..." : "Check In"}
            </button>
          </div>
          {manualStatus && (
            <p
              className={`mt-2 text-sm ${
                manualStatus.type === "success"
                  ? "text-[#006241]"
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

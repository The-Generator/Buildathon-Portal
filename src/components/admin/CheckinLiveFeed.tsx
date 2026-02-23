"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";

interface CheckinEntry {
  id: string;
  full_name: string;
  school: string;
  checked_in_at: string;
}

const MAX_FEED_SIZE = 20;

export function CheckinLiveFeed() {
  const [entries, setEntries] = useState<CheckinEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((name: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(name);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const fetchRecent = async () => {
      const { data } = await supabase
        .from("participants")
        .select("id, full_name, school, school_other, checked_in_at")
        .eq("checked_in", true)
        .not("checked_in_at", "is", null)
        .order("checked_in_at", { ascending: false })
        .limit(MAX_FEED_SIZE);

      if (cancelled || !data) {
        if (!cancelled) setLoading(false);
        return;
      }

      const mapped = data.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        school: resolveSchool(p.school, p.school_other),
        checked_in_at: p.checked_in_at!,
      }));

      seenIdsRef.current = new Set(data.map((p) => p.id));
      setEntries(mapped);
      setLoading(false);
    };

    void fetchRecent();

    const channel = supabase
      .channel("checkin-live-feed")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "participants",
          filter: "checked_in=eq.true",
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            full_name: string;
            school: string;
            school_other?: string | null;
            checked_in: boolean;
            checked_in_at?: string | null;
          };

          if (!row.checked_in || !row.checked_in_at) return;
          if (seenIdsRef.current.has(row.id)) return;

          seenIdsRef.current.add(row.id);

          const entry: CheckinEntry = {
            id: row.id,
            full_name: row.full_name,
            school: resolveSchool(row.school, row.school_other),
            checked_in_at: row.checked_in_at,
          };

          setEntries((prev) => [entry, ...prev].slice(0, MAX_FEED_SIZE));
          showToast(row.full_name);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [showToast]);

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right fade-in bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          <span className="mr-2">&#10003;</span>
          {toast} just checked in
        </div>
      )}

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
          {loading ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400 animate-pulse">
              Loading feed...
            </div>
          ) : entries.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No check-ins yet
            </div>
          ) : (
            entries.map((checkin) => (
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
    </>
  );
}

function resolveSchool(school: string, schoolOther?: string | null): string {
  if (school.trim().toLowerCase() === "other") {
    const other = schoolOther?.trim();
    return other && other.length > 0 ? other : "Other";
  }
  return school.trim() || "Other";
}

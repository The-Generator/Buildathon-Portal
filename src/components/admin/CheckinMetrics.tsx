"use client";

import { StatCard } from "@/components/ui/stat-card";
import {
  ClipboardCheck,
  Users,
  UserCheck,
  School,
  AlertCircle,
} from "lucide-react";

interface TypeBreakdown {
  [type: string]: { total: number; checkedIn: number };
}

interface SchoolBreakdown {
  [school: string]: { total: number; checkedIn: number };
}

export interface CheckinMetricsData {
  totalRegistered: number;
  totalCheckedIn: number;
  typeBreakdown: TypeBreakdown;
  schoolBreakdown: SchoolBreakdown;
  unassignedWalkIns: number;
}

const TYPE_LABELS: Record<string, string> = {
  participant: "Participant",
  spectator: "Spectator",
  walk_in: "Walk-in",
};

const TYPE_COLORS: Record<string, string> = {
  participant: "bg-green-500",
  spectator: "bg-gray-400",
  walk_in: "bg-orange-500",
};

const TYPE_ORDER = ["participant", "spectator", "walk_in"];

const SCHOOL_LABELS: Record<string, string> = {
  babson: "Babson",
  bentley: "Bentley",
  bryant: "Bryant",
  other: "Other",
};

const SCHOOL_ORDER = ["babson", "bentley", "bryant", "other"];

export function CheckinMetrics({ data }: { data: CheckinMetricsData }) {
  const percentage =
    data.totalRegistered > 0
      ? Math.round((data.totalCheckedIn / data.totalRegistered) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Primary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Checked In"
          value={data.totalCheckedIn}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={`${percentage}% of registered`}
        />
        <StatCard
          label="Total Registered"
          value={data.totalRegistered}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Remaining"
          value={data.totalRegistered - data.totalCheckedIn}
          icon={<UserCheck className="h-5 w-5" />}
          trend="still expected"
        />
        <StatCard
          label="Walk-in Queue"
          value={data.unassignedWalkIns}
          icon={<AlertCircle className="h-5 w-5" />}
          trend="unassigned"
        />
      </div>

      {/* Check-in progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Check-in Progress</p>
          <p className="text-sm font-semibold text-gray-900">
            {data.totalCheckedIn} / {data.totalRegistered}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-emerald-700 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Participant type breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              By Participant Type
            </h3>
          </div>
          <div className="space-y-3">
            {TYPE_ORDER.map((type) => {
              const entry = data.typeBreakdown[type];
              if (!entry) return null;
              const pct =
                entry.total > 0
                  ? Math.round((entry.checkedIn / entry.total) * 100)
                  : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {TYPE_LABELS[type] || type}
                    </span>
                    <span className="font-medium text-gray-900">
                      {entry.checkedIn}/{entry.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${TYPE_COLORS[type] || "bg-gray-400"} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* School breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <School className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">By School</h3>
          </div>
          <div className="space-y-3">
            {SCHOOL_ORDER.map((key) => {
              const entry = data.schoolBreakdown[key];
              if (!entry) return null;
              const pct =
                entry.total > 0
                  ? Math.round((entry.checkedIn / entry.total) * 100)
                  : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {SCHOOL_LABELS[key] || key}
                    </span>
                    <span className="font-medium text-gray-900">
                      {entry.checkedIn}/{entry.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

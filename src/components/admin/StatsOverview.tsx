import { StatCard } from "@/components/ui/stat-card";
import {
  Users,
  UsersRound,
  ClipboardCheck,
  School,
  Puzzle,
  CheckCircle,
  UserCheck,
} from "lucide-react";

interface StatsData {
  totalParticipants: number;
  typeBreakdown: Record<string, number>;
  schoolBreakdown: Record<string, number>;
  formationBreakdown: Record<string, number>;
  totalTeams: number;
  completeTeams: number;
  incompleteTeams: number;
  totalCheckedIn: number;
  capacity: number;
}

export function StatsOverview({ stats }: { stats: StatsData }) {
  const capacityPercent = Math.min(
    100,
    Math.round((stats.totalParticipants / stats.capacity) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered"
          value={stats.totalParticipants}
          icon={<Users className="h-5 w-5" />}
          trend={`${capacityPercent}% of capacity`}
        />
        <StatCard
          label="Total Teams"
          value={stats.totalTeams}
          icon={<UsersRound className="h-5 w-5" />}
          trend={`${stats.completeTeams} complete`}
        />
        <StatCard
          label="Checked In"
          value={stats.totalCheckedIn}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={`${stats.totalParticipants > 0 ? Math.round((stats.totalCheckedIn / stats.totalParticipants) * 100) : 0}% of registered`}
        />
        <StatCard
          label="Incomplete Teams"
          value={stats.incompleteTeams}
          icon={<Puzzle className="h-5 w-5" />}
          trend="Need attention"
        />
      </div>

      {/* Capacity bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            Registration Capacity
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {stats.totalParticipants} / {stats.capacity}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-emerald-700 h-3 rounded-full transition-all duration-500"
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      {/* Participant type breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">
            By Participant Type
          </h3>
        </div>
        <div className="space-y-3">
          {Object.entries(stats.typeBreakdown).map(([type, count]) => {
            const labels: Record<string, string> = {
              participant: "Participant",
              spectator: "Spectator",
              walk_in: "Walk-in",
            };
            const colors: Record<string, string> = {
              participant: "bg-green-500",
              spectator: "bg-gray-400",
              walk_in: "bg-orange-500",
            };
            return (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {labels[type] || type}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[type] || "bg-gray-400"} h-2 rounded-full`}
                      style={{
                        width: `${stats.totalParticipants > 0 ? Math.round((count / stats.totalParticipants) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* School breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <School className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">By School</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.schoolBreakdown).map(([school, count]) => (
              <div key={school} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{school}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-700 h-2 rounded-full"
                      style={{
                        width: `${stats.totalParticipants > 0 ? Math.round((count / stats.totalParticipants) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formation type breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              By Registration Type
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.formationBreakdown).map(([type, count]) => {
              const labels: Record<string, string> = {
                pre_formed: "Pre-formed",
                algorithm_matched: "Algorithm Matched",
                admin_assigned: "Admin Assigned",
              };
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {labels[type] || type}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-700 h-2 rounded-full"
                        style={{
                          width: `${stats.totalTeams > 0 ? Math.round((count / stats.totalTeams) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
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

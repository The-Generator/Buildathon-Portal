"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchingPreview } from "@/components/admin/MatchingPreview";
import {
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import type { Team, Participant } from "@/types";

type TeamWithMembers = Team & { members: Participant[] };

type FilterOption = "all" | "complete" | "incomplete" | "locked";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: teamData, error: tError } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (tError) {
      console.error("Failed to fetch teams:", tError);
      setLoading(false);
      return;
    }

    const { data: pData } = await supabase
      .from("participants")
      .select("*");

    const participantsByTeam = new Map<string, Participant[]>();
    for (const p of pData ?? []) {
      if (p.team_id) {
        const existing = participantsByTeam.get(p.team_id) ?? [];
        existing.push(p);
        participantsByTeam.set(p.team_id, existing);
      }
    }

    const teamsWithMembers: TeamWithMembers[] = (teamData ?? []).map((t) => ({
      ...t,
      members: participantsByTeam.get(t.id) ?? [],
    }));

    setTeams(teamsWithMembers);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Get admin token from session storage (set by admin login)
    const token = sessionStorage.getItem("admin_token");
    setAdminToken(token);
  }, [fetchData]);

  const hasIncompleteTeams = teams.some((t) => !t.is_complete);
  const hasUnmatchedPotential = hasIncompleteTeams || teams.length === 0;

  const handleMatchingConfirmed = useCallback(() => {
    // Refresh team data after matching is confirmed
    fetchData();
  }, [fetchData]);

  const filtered = teams.filter((t) => {
    if (filter === "complete") return t.is_complete;
    if (filter === "incomplete") return !t.is_complete;
    if (filter === "locked") return t.is_locked;
    return true;
  });

  const formationLabel = (type: string) => {
    const labels: Record<string, string> = {
      pre_formed: "Pre-formed",
      algorithm_matched: "Matched",
      admin_assigned: "Admin Assigned",
    };
    return labels[type] || type;
  };

  const formationColor = (type: string): "blue" | "purple" | "yellow" => {
    const colors: Record<string, "blue" | "purple" | "yellow"> = {
      pre_formed: "blue",
      algorithm_matched: "purple",
      admin_assigned: "yellow",
    };
    return colors[type] || "blue";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading teams...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-sm text-gray-500 mt-1">
            {teams.length} total teams
          </p>
        </div>
      </div>

      {/* Matching section - shown when there are incomplete teams or potential unmatched participants */}
      {adminToken && hasUnmatchedPotential && (
        <MatchingPreview
          adminToken={adminToken}
          onConfirmed={handleMatchingConfirmed}
        />
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(
          [
            ["all", "All"],
            ["complete", "Complete"],
            ["incomplete", "Incomplete"],
            ["locked", "Locked"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? "bg-[#006241] text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Team cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">
          No teams found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((team) => {
            const isExpanded = expandedId === team.id;

            return (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : team.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {team.members.length} member
                          {team.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge color={formationColor(team.formation_type)}>
                        {formationLabel(team.formation_type)}
                      </Badge>
                      <Badge color={team.is_complete ? "green" : "yellow"}>
                        {team.is_complete ? "Complete" : "Incomplete"}
                      </Badge>
                      {team.is_locked && (
                        <Badge color="red">Locked</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    {team.members.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No members yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {team.members.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {m.full_name}
                              </span>
                              <span className="text-gray-400 ml-2">
                                {m.email}
                              </span>
                            </div>
                            <Badge color="gray">{m.primary_role}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                    {team.project_name && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-medium">
                          Project
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {team.project_name}
                        </p>
                        {team.project_description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {team.project_description}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

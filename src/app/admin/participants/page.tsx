"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ParticipantRow } from "@/components/admin/ParticipantRow";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Participant } from "@/types";

type ParticipantWithTeam = Participant & { team_name?: string };

const PAGE_SIZE = 25;

const SCHOOL_OPTIONS = ["All", "Babson", "Bentley", "Bryant", "Other"];
const ROLE_OPTIONS = ["All", "Developer", "Designer", "Business", "Other"];
const TEAM_STATUS_OPTIONS = ["All", "Has Team", "No Team"];
const PARTICIPANT_TYPE_OPTIONS = ["All", "participant", "spectator", "walk_in"];

type SortField = "full_name" | "school" | "created_at";
type SortDir = "asc" | "desc";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [teamStatusFilter, setTeamStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch participants
      const { data: pData, error: pError } = await supabase
        .from("participants")
        .select("*")
        .order("created_at", { ascending: false });

      if (pError) {
        console.error("Failed to fetch participants:", pError);
        setLoading(false);
        return;
      }

      // Fetch teams for name lookup
      const { data: tData } = await supabase
        .from("teams")
        .select("id, name");

      const teamMap = new Map(
        (tData ?? []).map((t) => [t.id, t.name])
      );

      const withTeams: ParticipantWithTeam[] = (pData ?? []).map((p) => ({
        ...p,
        team_name: p.team_id ? teamMap.get(p.team_id) ?? undefined : undefined,
      }));

      setParticipants(withTeams);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...participants];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }

    // School filter
    if (schoolFilter !== "All") {
      result = result.filter((p) => {
        if (schoolFilter === "Other") {
          return !["Babson", "Bentley", "Bryant"].includes(p.school);
        }
        return p.school === schoolFilter;
      });
    }

    // Role filter
    if (roleFilter !== "All") {
      result = result.filter((p) => p.primary_role === roleFilter);
    }

    // Team status filter
    if (teamStatusFilter !== "All") {
      if (teamStatusFilter === "Has Team") {
        result = result.filter((p) => p.team_id);
      } else {
        result = result.filter((p) => !p.team_id);
      }
    }

    // Participant type filter
    if (typeFilter !== "All") {
      result = result.filter((p) => p.participant_type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "full_name") {
        cmp = a.full_name.localeCompare(b.full_name);
      } else if (sortField === "school") {
        cmp = a.school.localeCompare(b.school);
      } else {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [participants, search, schoolFilter, roleFilter, teamStatusFilter, typeFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">
          Loading participants...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Participants</h2>
        <p className="text-sm text-gray-500 mt-1">
          {participants.length} total registered participants
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241] focus:border-[#006241]"
            />
          </div>
          <select
            value={schoolFilter}
            onChange={(e) => {
              setSchoolFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241]"
          >
            {SCHOOL_OPTIONS.map((s) => (
              <option key={s} value={s}>
                School: {s}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241]"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                Role: {r}
              </option>
            ))}
          </select>
          <select
            value={teamStatusFilter}
            onChange={(e) => {
              setTeamStatusFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241]"
          >
            {TEAM_STATUS_OPTIONS.map((t) => (
              <option key={t} value={t}>
                Team: {t}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241]"
          >
            {PARTICIPANT_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                Type: {t === "All" ? "All" : t === "walk_in" ? "Walk-in" : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("full_name")}
                >
                  Name{sortIndicator("full_name")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("school")}
                >
                  School{sortIndicator("school")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("created_at")}
                >
                  Registered{sortIndicator("created_at")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No participants found.
                  </td>
                </tr>
              ) : (
                paged.map((p) => (
                  <ParticipantRow key={p.id} participant={p} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

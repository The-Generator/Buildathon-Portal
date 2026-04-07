"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SCHOOLS, PRIMARY_ROLES } from "@/lib/constants";
import { Search, ArrowLeft, ArrowUpDown } from "lucide-react";
import { ParticipantCard } from "@/components/participants/ParticipantCard";
import type { Participant } from "@/types";

type DirectoryParticipant = Pick<
  Participant,
  | "id"
  | "full_name"
  | "school"
  | "school_other"
  | "year"
  | "primary_role"
  | "specific_skills"
  | "bio"
  | "linkedin_url"
  | "portfolio_url"
  | "photo_url"
>;

type SortOption = "featured" | "az" | "za" | "shuffle";

/** Score how "filled out" a profile is — more complete profiles rank higher */
function profileScore(p: DirectoryParticipant): number {
  let score = 0;
  score += (p.specific_skills?.length ?? 0) * 2; // skills are worth the most
  if (p.bio && p.bio.length > 20) score += 5;
  if (p.photo_url) score += 4;
  if (p.linkedin_url) score += 3;
  if (p.portfolio_url) score += 3;
  return score;
}

interface Props {
  participants: DirectoryParticipant[];
}

export function ParticipantDirectory({ participants }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [school, setSchool] = useState(searchParams.get("school") ?? "all");
  const [role, setRole] = useState(searchParams.get("role") ?? "all");
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "featured"
  );
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.random());

  // Sync filters to URL search params for shareable state
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const result = participants.filter((p) => {
      if (school !== "all") {
        const displaySchool = p.school === "Other" && p.school_other ? p.school_other : p.school;
        if (p.school !== school && displaySchool !== school) return false;
      }
      if (role !== "all" && p.primary_role !== role) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = p.full_name.toLowerCase().includes(q);
        const skillMatch = p.specific_skills?.some((s) =>
          s.toLowerCase().includes(q)
        );
        const bioMatch = p.bio?.toLowerCase().includes(q);
        if (!nameMatch && !skillMatch && !bioMatch) return false;
      }
      return true;
    });

    if (sort === "featured") {
      result.sort((a, b) => profileScore(b) - profileScore(a));
    } else if (sort === "az") {
      result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sort === "za") {
      result.sort((a, b) => b.full_name.localeCompare(a.full_name));
    } else if (sort === "shuffle") {
      // Seeded shuffle so it's stable until user clicks shuffle again
      result.sort((a, b) => {
        const ha = Math.sin(shuffleSeed * 10000 + a.id.charCodeAt(0) * 9301 + 49297) % 1;
        const hb = Math.sin(shuffleSeed * 10000 + b.id.charCodeAt(0) * 9301 + 49297) % 1;
        return ha - hb;
      });
    }

    return result;
  }, [participants, school, role, search, sort, shuffleSeed]);

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,232,123,0.06)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <Link
            href="/"
            className="font-body mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/40 transition-colors hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            Participant Directory
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Meet the Builders
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            {filtered.length} participant{filtered.length !== 1 ? "s" : ""}{" "}
            {filtered.length !== participants.length && (
              <span className="text-white/30">
                of {participants.length} total
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0f0d]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by name, skill, or bio..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateParams("q", e.target.value);
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 font-body text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#00e87b]/40 focus:ring-1 focus:ring-[#00e87b]/20"
              />
            </div>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => {
                const val = e.target.value as SortOption;
                setSort(val);
                updateParams("sort", val === "featured" ? "" : val);
                if (val === "shuffle") setShuffleSeed(Math.random());
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-body text-sm text-white outline-none transition-colors focus:border-[#00e87b]/40 [&>option]:bg-[#0a0f0d] [&>option]:text-white"
            >
              <option value="featured">Featured</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="shuffle">Shuffle</option>
            </select>

            {/* School dropdown */}
            <select
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                updateParams("school", e.target.value);
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-body text-sm text-white outline-none transition-colors focus:border-[#00e87b]/40 [&>option]:bg-[#0a0f0d] [&>option]:text-white"
            >
              <option value="all">All Schools</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Role filter chips */}
            <div className="flex flex-wrap gap-1.5 sm:hidden">
              <button
                onClick={() => {
                  setRole("all");
                  updateParams("role", "all");
                }}
                className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  role === "all"
                    ? "bg-[#00e87b] text-[#0a0f0d]"
                    : "border border-white/10 text-white/50 hover:text-white/80"
                }`}
              >
                All Roles
              </button>
              {PRIMARY_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    updateParams("role", r);
                  }}
                  className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                    role === r
                      ? "bg-[#00e87b] text-[#0a0f0d]"
                      : "border border-white/10 text-white/50 hover:text-white/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop role chips */}
          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            <button
              onClick={() => {
                setRole("all");
                updateParams("role", "all");
              }}
              className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                role === "all"
                  ? "bg-[#00e87b] text-[#0a0f0d]"
                  : "border border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              All Roles
            </button>
            {PRIMARY_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  updateParams("role", r);
                }}
                className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  role === r
                    ? "bg-[#00e87b] text-[#0a0f0d]"
                    : "border border-white/10 text-white/50 hover:text-white/80"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-body text-lg text-white/40">
              No participants match your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSchool("all");
                setRole("all");
                router.replace("/participants", { scroll: false });
              }}
              className="font-body mt-3 text-sm font-medium text-[#00e87b] transition-colors hover:text-[#00ff88]"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


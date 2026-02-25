"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SCHOOLS, PRIMARY_ROLES } from "@/lib/constants";
import { Search, ArrowLeft, ExternalLink } from "lucide-react";
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
>;

interface Props {
  participants: DirectoryParticipant[];
}

export function ParticipantDirectory({ participants }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [school, setSchool] = useState(searchParams.get("school") ?? "all");
  const [role, setRole] = useState(searchParams.get("role") ?? "all");

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
    return participants.filter((p) => {
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
  }, [participants, school, role, search]);

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
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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

function ParticipantCard({ participant: p }: { participant: DirectoryParticipant }) {
  const displaySchool =
    p.school === "Other" && p.school_other ? p.school_other : p.school;

  return (
    <div className="glass-card group rounded-2xl p-5 transition-colors hover:border-[#00e87b]/20">
      {/* Name + school */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-body truncate text-base font-semibold text-white">
            {p.full_name}
          </h3>
          <p className="font-body mt-0.5 text-sm text-white/40">
            {displaySchool} &middot; {p.year}
          </p>
        </div>
        {/* Links */}
        <div className="flex shrink-0 items-center gap-2">
          {p.linkedin_url && (
            <a
              href={p.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-[#00e87b]"
              aria-label={`${p.full_name} LinkedIn`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          )}
          {p.portfolio_url && (
            <a
              href={p.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-[#00e87b]"
              aria-label={`${p.full_name} portfolio`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Role badge */}
      <div className="mt-3">
        <span className="inline-flex rounded-full bg-[#00e87b]/10 px-2.5 py-0.5 font-body text-xs font-medium text-[#00e87b]">
          {p.primary_role}
        </span>
      </div>

      {/* Bio */}
      {p.bio && (
        <p className="font-body mt-3 line-clamp-3 text-sm leading-relaxed text-white/50">
          {p.bio}
        </p>
      )}

      {/* Skills */}
      {p.specific_skills && p.specific_skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.specific_skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/10 px-2 py-0.5 font-body text-[11px] text-white/40"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

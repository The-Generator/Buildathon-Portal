"use client";

import { useState } from "react";
import { Linkedin, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PublicParticipant {
  id: string;
  full_name: string;
  school: string;
  school_other?: string | null;
  year: string;
  primary_role: string;
  specific_skills: string[];
  bio?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
}

function getSafeExternalUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

const MAX_VISIBLE_SKILLS = 4;

export function ParticipantCard({
  participant: p,
}: {
  participant: PublicParticipant;
}) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const displaySchool =
    p.school === "Other" && p.school_other ? p.school_other : p.school;
  const linkedInUrl = getSafeExternalUrl(p.linkedin_url);
  const portfolioUrl = getSafeExternalUrl(p.portfolio_url);

  const skills = p.specific_skills ?? [];
  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflowCount = skills.length - MAX_VISIBLE_SKILLS;

  return (
    <Card className="border-white/10 bg-white/[0.03] shadow-none">
      <CardContent className="border-none p-5">
        {/* Name + school + year */}
        <div className="min-w-0">
          <h3 className="font-body truncate text-base font-semibold text-white">
            {p.full_name}
          </h3>
          <p className="font-body mt-0.5 text-sm text-white/40">
            {displaySchool} &middot; {p.year}
          </p>
        </div>

        {/* Role badge */}
        <div className="mt-3">
          <Badge
            color="green"
            className="bg-[#00e87b]/10 text-[#00e87b] font-body"
          >
            {p.primary_role}
          </Badge>
        </div>

        {/* Bio */}
        {p.bio && (
          <div className="mt-3">
            <p
              className={`font-body text-sm leading-relaxed text-white/50 ${
                !bioExpanded ? "line-clamp-2" : ""
              }`}
            >
              {p.bio}
            </p>
            <button
              type="button"
              onClick={() => setBioExpanded(!bioExpanded)}
              className="font-body mt-1 text-xs font-medium text-[#00e87b]/70"
              aria-expanded={bioExpanded}
            >
              {bioExpanded ? "Show less" : "Read more"}
            </button>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 px-2 py-0.5 font-body text-[11px] text-white/40"
              >
                {skill}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 font-body text-[11px] text-white/30">
                +{overflowCount} more
              </span>
            )}
          </div>
        )}

        {/* Social links */}
        {(linkedInUrl || portfolioUrl) && (
          <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3">
            {linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/30 text-xs font-body"
                aria-label={`${p.full_name} LinkedIn`}
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
            {portfolioUrl && (
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/30 text-xs font-body"
                aria-label={`${p.full_name} portfolio`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Portfolio</span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

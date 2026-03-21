"use client";

import {
  Award,
  Coffee,
  Rocket,
  UtensilsCrossed,
  Upload,
  Scale,
  MapPin,
  Camera,
  Presentation,
  Clock,
} from "lucide-react";
import { SCHEDULE_BLOCKS, type ScheduleBlock } from "@/data/schedule";
import type { LucideIcon } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const TYPE_STYLES: Record<
  ScheduleBlock["type"],
  { dot: string; accent: string }
> = {
  ceremony: {
    dot: "border-emerald-400/50 bg-emerald-400/15",
    accent: "text-emerald-400",
  },
  meal: {
    dot: "border-amber-400/40 bg-amber-400/10",
    accent: "text-amber-400",
  },
  hacking: {
    dot: "border-cyan-400/40 bg-cyan-400/10",
    accent: "text-cyan-400",
  },
  workshop: {
    dot: "border-violet-400/40 bg-violet-400/10",
    accent: "text-violet-400",
  },
  judging: {
    dot: "border-rose-400/40 bg-rose-400/10",
    accent: "text-rose-400",
  },
  social: {
    dot: "border-white/20 bg-white/5",
    accent: "text-white/60",
  },
};

const ICON_MAP: Record<string, LucideIcon> = {
  "Registration & Breakfast": Coffee,
  "Opening Ceremony + All-Hands Photo": Camera,
  "Buildathon Begins": Rocket,
  "Grab-and-Go Lunch": UtensilsCrossed,
  "Project Submissions Open": Upload,
  "Project Submissions Close": Clock,
  "Project Showcases & Judging": Scale,
  "Dinner Break": UtensilsCrossed,
  "Final Round Presentations": Presentation,
  "Awards Ceremony": Award,
};

function BlockRow({ block }: { block: ScheduleBlock }) {
  const style = TYPE_STYLES[block.type];
  const Icon = ICON_MAP[block.title] ?? Rocket;

  return (
    <div className="group relative grid grid-cols-[6rem_1fr] gap-4 sm:grid-cols-[7.5rem_1fr]">
      {/* Time column */}
      <div className="pt-0.5 text-right">
        <span className="font-data text-xs font-semibold uppercase tracking-wider text-white/50 group-hover:text-white/70 sm:text-sm">
          {block.time}
        </span>
      </div>

      {/* Timeline dot + content */}
      <div className="relative pb-8 pl-6 sm:pl-8">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.08]" />

        {/* Dot */}
        <div
          className={`absolute -left-[5px] top-[3px] h-[10px] w-[10px] rounded-full border-2 transition-all ${style.dot} group-hover:scale-125`}
        />

        {/* Content */}
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.accent}`} />
          <div className="min-w-0">
            <h3 className="font-body text-sm font-semibold leading-tight text-white sm:text-base">
              {block.title}
            </h3>
            <p className="font-body mt-1 text-xs leading-relaxed text-white/40 sm:text-sm">
              {block.description}
            </p>
            <p className="font-data mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#5ba4dc] sm:text-xs">
              <MapPin className="h-3 w-3" />
              {block.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Schedule() {
  const { ref, hasEntered } = useInView();

  return (
    <section
      id="schedule"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "linear-gradient(to bottom, #0d1f18, #0f1210)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 via-transparent to-transparent" />

      <div
        ref={ref}
        className={`relative mx-auto max-w-7xl px-6 transition-all duration-700 ease-out ${
          hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-emerald-400">
            Day-of Schedule
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Saturday, April 11
          </h2>
          <p className="font-body mt-4 text-white/50">
            12 hours of building, learning, and competing at Knight Auditorium.
          </p>
        </div>

        {/* Legend */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {(
            [
              ["ceremony", "Ceremony"],
              ["hacking", "Hacking"],
              ["meal", "Meals"],
              ["judging", "Judging"],
            ] as const
          ).map(([type, label]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full border ${TYPE_STYLES[type].dot}`}
              />
              <span className="font-data text-[10px] uppercase tracking-wider text-white/35 sm:text-xs">
                {label}
              </span>
            </span>
          ))}
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-12 max-w-2xl">
          {SCHEDULE_BLOCKS.map((block, i) => (
            <BlockRow key={i} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}

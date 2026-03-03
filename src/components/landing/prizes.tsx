"use client";

import { Crown, Trophy } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const tiers = [
  {
    place: "1st Place",
    description: "Awarded to the top team in each track",
    icon: Crown,
    tint: "text-yellow-400",
  },
  {
    place: "2nd Place",
    description: "Awarded to the runner-up in each track",
    icon: Trophy,
    tint: "text-gray-300",
  },
];

export function Prizes() {
  const { ref, hasEntered } = useInView();

  return (
    <section
      id="prizes"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "linear-gradient(to bottom, #070a09, #0d1f18)" }}
    >
      <div
        ref={ref}
        className={`relative mx-auto max-w-7xl px-6 transition-all duration-700 ease-out ${
          hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            Prizes
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Prizes for Every Track
          </h2>
          <p className="font-body mt-6 text-lg leading-relaxed text-white/60">
            First and second place prizes will be awarded for each of the three
            competition tracks. Details coming soon.
          </p>
        </div>

        {/* Prize rows */}
        <div className="mx-auto mt-14 max-w-3xl">
          {tiers.map((tier, i) => (
            <div
              key={tier.place}
              className={`flex items-center gap-5 py-6 sm:gap-6 ${
                i < tiers.length - 1 ? "border-b border-white/[0.08]" : ""
              }`}
            >
              <div className={`shrink-0 ${tier.tint}`}>
                <tier.icon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div className="min-w-0">
                <h3 className={`font-body text-lg font-bold ${tier.tint}`}>
                  {tier.place}
                </h3>
                <p className="font-body mt-1 text-sm leading-relaxed text-white/50">
                  {tier.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

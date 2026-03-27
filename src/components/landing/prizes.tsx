"use client";

import Image from "next/image";
import { Crown, Trophy } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const tiers = [
  {
    place: "1st Place",
    description: "Awarded to the top team in each track",
    icon: Crown,
    tint: "text-yellow-400",
    borderTint: "border-yellow-400/20",
    prizes: [
      { name: "PS5 Digital Edition", image: "/prizes/ps5.jpg" },
      { name: '27" LG UltraGear Monitor', image: "/prizes/monitor.jpg" },
    ],
  },
  {
    place: "2nd Place",
    description: "Awarded to the runner-up in each track",
    icon: Trophy,
    tint: "text-gray-300",
    borderTint: "border-gray-300/20",
    prizes: [
      { name: "DJI Mic Minis", image: "/prizes/dji-mic.jpg" },
      { name: "Mechanical Keyboard", image: "/prizes/keyboard.jpg" },
      { name: "Raspberry Pi Kit", image: "/prizes/rpi.jpg" },
    ],
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
            First and second place teams across all three tracks win cash and
            physical prizes.
          </p>
        </div>

        {/* Cash prize banner */}
        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-10 text-center">
          <p className="font-display text-5xl font-bold text-[#00e87b] sm:text-6xl">
            $3,000
          </p>
          <p className="font-body mt-2 text-lg text-white/60">in cash prizes</p>
          <p className="font-body mt-1 text-sm text-white/40">
            Distributed across 1st and 2nd place in each track
          </p>
        </div>

        {/* Prize tiers with product images */}
        <div className="mx-auto mt-14 max-w-4xl space-y-12">
          {tiers.map((tier) => (
            <div key={tier.place}>
              {/* Tier header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`shrink-0 ${tier.tint}`}>
                  <tier.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div>
                  <h3 className={`font-body text-xl font-bold ${tier.tint}`}>
                    {tier.place}
                  </h3>
                  <p className="font-body text-sm text-white/50">
                    {tier.description}
                  </p>
                </div>
              </div>

              {/* Prize cards with product images */}
              <div
                className={`grid gap-4 ${
                  tier.prizes.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {tier.prizes.map((prize) => (
                  <div
                    key={prize.name}
                    className={`rounded-xl border ${tier.borderTint} bg-white/[0.03] p-3 text-center`}
                  >
                    <div className="relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-lg bg-white/5">
                      <Image
                        src={prize.image}
                        alt={prize.name}
                        fill
                        className="object-contain p-2"
                        sizes="180px"
                      />
                    </div>
                    <p className="font-body mt-3 text-sm font-medium text-white/70">
                      {prize.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

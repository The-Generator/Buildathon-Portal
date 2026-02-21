"use client";

import { Lock, Sparkles } from "lucide-react";

const placeholderTracks = [
  {
    label: "Track 1",
    hint: "Something big is coming...",
    gradient: "from-[#00e87b]/20 to-[#00e87b]/5",
  },
  {
    label: "Track 2",
    hint: "You won't want to miss this...",
    gradient: "from-[#00d4a0]/20 to-[#00d4a0]/5",
  },
  {
    label: "Track 3",
    hint: "Think outside the box...",
    gradient: "from-[#00c4ff]/20 to-[#00c4ff]/5",
  },
];

export function Tracks() {
  return (
    <section id="tracks" className="relative bg-[#0d1a14] py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,232,123,0.04)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00e87b]">
            Competition Tracks
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Three Tracks. Endless Possibilities.
          </h2>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00e87b]/20 bg-[#00e87b]/10 px-5 py-2.5 text-sm font-semibold text-[#00e87b]">
            <Lock className="h-4 w-4" />
            Tracks revealed April 10th
          </div>
        </div>

        {/* Track cards */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
          {placeholderTracks.map((track, i) => (
            <div
              key={track.label}
              className="animate-float-medium group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center transition-all hover:border-[#00e87b]/20 hover:bg-white/[0.06]"
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              {/* Mystery sparkle */}
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-[#00e87b]/20 transition-colors group-hover:text-[#00e87b]/60" />

              {/* Gradient background accent */}
              <div className={`absolute inset-0 bg-gradient-to-b ${track.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/30 transition-all group-hover:border-[#00e87b]/30 group-hover:text-[#00e87b]">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">{track.label}</h3>
                <p className="mt-2 text-sm italic text-white/40">{track.hint}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-white/40">
          All tracks connect to our theme:{" "}
          <span className="font-semibold text-[#00e87b]">AI x Body &amp; Mind</span>
        </p>
      </div>
    </section>
  );
}

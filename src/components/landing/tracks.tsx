"use client";

import { useInView } from "@/hooks/useInView";

const placeholderTracks = [
  { number: "01", label: "Track 1", hint: "Something big is coming..." },
  { number: "02", label: "Track 2", hint: "You won't want to miss this..." },
  { number: "03", label: "Track 3", hint: "Think outside the box..." },
];

export function Tracks() {
  const { ref, hasEntered } = useInView();

  return (
    <section id="tracks" className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(to bottom, #0a1a14, #070a09)" }}>
      <div
        ref={ref}
        className={`relative mx-auto max-w-7xl px-6 transition-all duration-700 ease-out ${
          hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            Competition Tracks
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Three Tracks. Endless Possibilities.
          </h2>
          <p className="font-data mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#00e87b]/70">
            Tracks revealed April 10th
          </p>
        </div>

        {/* Track columns */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 sm:grid-cols-3">
          {placeholderTracks.map((track, i) => (
            <div
              key={track.number}
              className={`flex flex-col items-center py-10 sm:py-12 ${
                i < placeholderTracks.length - 1
                  ? "border-b border-white/[0.08] sm:border-b-0 sm:border-r"
                  : ""
              }`}
            >
              {/* Big number */}
              <span className="font-data text-6xl font-bold text-white/[0.15] sm:text-7xl lg:text-8xl">
                {track.number}
              </span>
              {/* Track label */}
              <span className="font-data mt-3 text-xs font-medium uppercase tracking-[0.25em] text-white/30">
                Track
              </span>
              {/* Hint — blurred to convey "locked" */}
              <p
                className="font-body mt-4 max-w-[180px] text-center text-sm text-white/25"
                style={{ filter: "blur(2px)" }}
              >
                {track.hint}
              </p>
            </div>
          ))}
        </div>

        <p className="font-body mt-10 text-center text-sm text-white/40">
          All tracks connect to our theme:{" "}
          <span className="font-semibold text-[#00e87b]">AI x Body &amp; Mind</span>
        </p>
      </div>
    </section>
  );
}

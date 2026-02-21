import { HelpCircle, Lock, Sparkles } from "lucide-react";

const placeholderTracks = [
  {
    icon: HelpCircle,
    label: "Track 1",
    hint: "Something big is coming...",
  },
  {
    icon: HelpCircle,
    label: "Track 2",
    hint: "You won't want to miss this...",
  },
  {
    icon: HelpCircle,
    label: "Track 3",
    hint: "Think outside the box...",
  },
];

export function Tracks() {
  return (
    <section id="tracks" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#006241]">
            Competition Tracks
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Three Tracks. Endless Possibilities.
          </h2>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#006241]/10 px-5 py-2.5 text-sm font-semibold text-[#006241]">
            <Lock className="h-4 w-4" />
            Tracks revealed April 10th
          </div>
        </div>

        {/* Placeholder track cards */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
          {placeholderTracks.map((track) => (
            <div
              key={track.label}
              className="group relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center transition-all hover:border-[#006241]/40 hover:shadow-lg"
            >
              {/* Mystery sparkle decoration */}
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-[#006241]/20 transition-colors group-hover:text-[#006241]/50" />

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-[#006241]/10 group-hover:text-[#006241]">
                <track.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{track.label}</h3>
              <p className="mt-2 text-sm italic text-gray-500">{track.hint}</p>

              {/* Animated border glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#006241]/0 to-[#006241]/0 transition-all group-hover:from-[#006241]/[0.02] group-hover:to-[#006241]/[0.05]" />
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          All tracks will connect to our theme:{" "}
          <span className="font-semibold text-[#006241]">AI x Body &amp; Mind</span>
        </p>
      </div>
    </section>
  );
}

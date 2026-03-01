import { Crown, Trophy } from "lucide-react";

const tiers = [
  {
    place: "1st Place",
    description: "Awarded to the top team in each track",
    icon: Crown,
    accent: "text-yellow-400",
    accentBg: "bg-yellow-400/10 group-hover:bg-yellow-400/20",
    borderGlow: "group-hover:border-yellow-400/30",
  },
  {
    place: "2nd Place",
    description: "Awarded to the runner-up in each track",
    icon: Trophy,
    accent: "text-gray-300",
    accentBg: "bg-gray-300/10 group-hover:bg-gray-300/20",
    borderGlow: "group-hover:border-gray-300/30",
  },
];

export function Prizes() {
  return (
    <section
      id="prizes"
      className="relative overflow-hidden bg-[#0a0f0d] py-24 sm:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,232,123,0.04)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
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

        {/* Prize tiers */}
        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.place}
              className={`glass-card glass-card-shimmer group rounded-2xl p-8 text-center ${tier.borderGlow}`}
            >
              <div
                className={`mx-auto mb-5 inline-flex rounded-xl p-3 transition-colors ${tier.accentBg}`}
              >
                <tier.icon className={`h-8 w-8 ${tier.accent}`} />
              </div>
              <h3 className="font-body text-xl font-bold text-white">
                {tier.place}
              </h3>
              <p className="font-body mt-3 text-sm leading-relaxed text-white/50">
                {tier.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

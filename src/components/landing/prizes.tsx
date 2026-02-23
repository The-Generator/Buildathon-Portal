import { Award, Crown, Medal, Star, Trophy } from "lucide-react";

const tiers = [
  {
    place: "1st Place",
    icon: Crown,
    accent: "text-yellow-400",
    accentBg: "bg-yellow-400/10 group-hover:bg-yellow-400/20",
    borderGlow: "group-hover:border-yellow-400/30",
    items: ["3D Printer", "Meta Quest 3S", "iPad"],
  },
  {
    place: "2nd Place",
    icon: Trophy,
    accent: "text-gray-300",
    accentBg: "bg-gray-300/10 group-hover:bg-gray-300/20",
    borderGlow: "group-hover:border-gray-300/30",
    items: ["Meta Ray-Ban Smart Glasses", "Smart Watch"],
  },
  {
    place: "3rd Place",
    icon: Medal,
    accent: "text-amber-600",
    accentBg: "bg-amber-600/10 group-hover:bg-amber-600/20",
    borderGlow: "group-hover:border-amber-600/30",
    items: ["Smart Watch", "Premium Accessories"],
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
            $5,000+ in Prizes
          </h2>
          <p className="font-body mt-6 text-lg leading-relaxed text-white/60">
            Compete for top-tier prizes across all tracks. Every winning team
            member takes home hardware.
          </p>
        </div>

        {/* Prize tiers */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
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
              <ul className="font-body mt-4 space-y-2">
                {tier.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-white/50"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Special award */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="glass-card glass-card-shimmer group rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-3">
              <Star className="h-5 w-5 text-[#00e87b]" />
              <Award className="h-6 w-6 text-[#00e87b]" />
              <Star className="h-5 w-5 text-[#00e87b]" />
            </div>
            <h3 className="font-body text-lg font-bold text-white">
              Creative AI Thinking Award
            </h3>
            <p className="font-body mt-2 text-sm leading-relaxed text-white/50">
              A special recognition for the team that demonstrates the most
              innovative and creative application of AI — regardless of
              technical complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

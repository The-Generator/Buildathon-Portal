const sponsors = [
  { name: "Babson College", tier: "Host" },
  { name: "Bentley University", tier: "Partner" },
  { name: "Bryant University", tier: "Partner" },
  { name: "Microsoft Research", tier: "Sponsor" },
];

/* Decorative DNA helix SVG */
function DNADecorationSVG() {
  return (
    <svg
      className="absolute left-8 top-1/3 h-48 w-12 opacity-[0.06]"
      viewBox="0 0 40 200"
      fill="none"
    >
      <path
        d="M5 0 Q20 25 35 50 Q20 75 5 100 Q20 125 35 150 Q20 175 5 200"
        stroke="#00e87b" strokeWidth="1.5" fill="none"
        className="svg-draw"
      />
      <path
        d="M35 0 Q20 25 5 50 Q20 75 35 100 Q20 125 5 150 Q20 175 35 200"
        stroke="#00e87b" strokeWidth="1.5" fill="none"
        className="svg-draw svg-draw-delay-2"
      />
      {[25, 75, 125, 175].map((y, i) => (
        <line
          key={i}
          x1="12" y1={y} x2="28" y2={y}
          stroke="#00e87b" strokeWidth="1" opacity="0.4"
          className="svg-draw"
          style={{ animationDelay: `${1 + i * 0.2}s` }}
        />
      ))}
    </svg>
  );
}

export function Sponsors() {
  return (
    <section id="sponsors" className="relative bg-[#0d1a14] py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,232,123,0.04)_0%,_transparent_70%)]" />

      <DNADecorationSVG />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            Partners & Sponsors
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Backed by the Best
          </h2>
          <p className="font-body mt-4 text-white/50">
            We&apos;re grateful for the support of our partners and sponsors who
            make this event possible.
          </p>
        </div>

        {/* Sponsor grid */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="glass-card glass-card-shimmer flex flex-col items-center justify-center rounded-2xl p-8"
            >
              <span className="font-body text-center text-lg font-bold tracking-tight text-white sm:text-xl">
                {sponsor.name}
              </span>
              <span className="font-data mt-2 text-xs font-medium uppercase tracking-widest text-[#00e87b]/50">
                {sponsor.tier}
              </span>
            </div>
          ))}
        </div>

        <p className="font-body mt-12 text-center text-sm text-white/40">
          Interested in sponsoring?{" "}
          <a
            href="mailto:generator@babson.edu"
            className="font-medium text-[#00e87b] underline underline-offset-4 transition-colors hover:text-[#00ff88]"
          >
            Get in touch
          </a>
        </p>
      </div>
    </section>
  );
}

const sponsors = [
  { name: "Babson College", tier: "Host" },
  { name: "Bentley University", tier: "Partner" },
  { name: "Bryant University", tier: "Partner" },
  { name: "Microsoft Research", tier: "Sponsor" },
];

export function Sponsors() {
  return (
    <section id="sponsors" className="relative bg-[#0d1a14] py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,232,123,0.04)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00e87b]">
            Partners & Sponsors
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Backed by the Best
          </h2>
          <p className="mt-4 text-white/50">
            We&apos;re grateful for the support of our partners and sponsors who
            make this event possible.
          </p>
        </div>

        {/* Sponsor grid */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:border-[#00e87b]/20 hover:bg-white/[0.06]"
            >
              <span className="text-center text-lg font-bold tracking-tight text-white sm:text-xl">
                {sponsor.name}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-widest text-[#00e87b]/50">
                {sponsor.tier}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-white/40">
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

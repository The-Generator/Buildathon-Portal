const sponsors = [
  { name: "Babson College", tier: "Host" },
  { name: "Bentley University", tier: "Partner" },
  { name: "Bryant University", tier: "Partner" },
  { name: "Microsoft Research", tier: "Sponsor" },
];

export function Sponsors() {
  return (
    <section id="sponsors" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#006241]">
            Partners & Sponsors
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Backed by the Best
          </h2>
          <p className="mt-4 text-gray-600">
            We are grateful for the support of our partners and sponsors who make
            this event possible.
          </p>
        </div>

        {/* Sponsor grid */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 transition-shadow hover:shadow-md"
            >
              <span className="text-center text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                {sponsor.name}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-widest text-gray-400">
                {sponsor.tier}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-gray-500">
          Interested in sponsoring?{" "}
          <a
            href="mailto:generator@babson.edu"
            className="font-medium text-[#006241] underline underline-offset-4 hover:text-[#004d33]"
          >
            Get in touch
          </a>
        </p>
      </div>
    </section>
  );
}

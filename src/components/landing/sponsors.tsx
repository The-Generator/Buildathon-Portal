import Image from "next/image";

const sponsors = [
  { name: "Babson College", tier: "Host", href: "https://www.babson.edu/", logo: "/sponsors/butler-institute.png" },
  {
    name: "Bentley University",
    tier: "Partner",
    href: "https://www.bentley.edu/",
    logo: "/sponsors/bentley-university.png",
  },
  { name: "Bryant University", tier: "Partner", href: "https://www.bryant.edu/", logo: "/sponsors/bryant-university.png" },
  {
    name: "Microsoft Research",
    tier: "Sponsor",
    href: "https://www.microsoft.com/en-us/research/",
    logo: "/sponsors/microsoft-research.png",
  },
];

/* Decorative DNA helix SVG */
function DNADecorationSVG() {
  return (
    <svg
      className="absolute left-8 top-1/3 h-48 w-12 text-emerald-400 opacity-[0.06]"
      viewBox="0 0 40 200"
      fill="none"
    >
      <path
        d="M5 0 Q20 25 35 50 Q20 75 5 100 Q20 125 35 150 Q20 175 5 200"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="svg-draw"
      />
      <path
        d="M35 0 Q20 25 5 50 Q20 75 35 100 Q20 125 5 150 Q20 175 35 200"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="svg-draw svg-draw-delay-2"
      />
      {[25, 75, 125, 175].map((y, i) => (
        <line
          key={i}
          x1="12"
          y1={y}
          x2="28"
          y2={y}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
          className="svg-draw"
          style={{ animationDelay: `${1 + i * 0.2}s` }}
        />
      ))}
    </svg>
  );
}

export function Sponsors() {
  return (
    <section
      id="sponsors"
      className="relative overflow-hidden bg-emerald-950/40 py-24 sm:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgb(16_185_129_/_0.08)_0%,_transparent_70%)]" />

      <DNADecorationSVG />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-emerald-400">
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
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 items-center gap-10 sm:gap-12">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Visit ${sponsor.name}`}
              className="flex items-center justify-center px-4"
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={200}
                height={100}
                className="h-auto max-h-24 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
              />
            </a>
          ))}
        </div>

        <p className="font-body mt-12 text-center text-sm text-white/40">
          Interested in sponsoring?{" "}
          <a
            href="mailto:generator@babson.edu"
            className="font-medium text-emerald-400 underline underline-offset-4 transition-colors hover:text-emerald-300"
          >
            Get in touch
          </a>
        </p>
      </div>
    </section>
  );
}

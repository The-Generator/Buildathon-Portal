"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

const sponsors: Array<{ name: string; tier: string; href: string; logo: string; round?: boolean }> = [
  { name: "Babson College", tier: "Host", href: "https://www.babson.edu/", logo: "/sponsors/babson-college.jpg", round: true },
  { name: "The Generator", tier: "Host", href: "https://www.babson.edu/", logo: "/sponsors/generator-ai-lab.png" },
  { name: "Butler Institute", tier: "Host", href: "https://www.babson.edu/", logo: "/sponsors/butler-institute.png" },
  {
    name: "Bentley University",
    tier: "Partner",
    href: "https://www.bentley.edu/",
    logo: "/sponsors/bentley-university.png",
  },
  {
    name: "Bentley E-Hub",
    tier: "Partner",
    href: "https://www.bentley.edu/",
    logo: "/sponsors/bentley-ehub.png",
  },
  { name: "Bryant University", tier: "Partner", href: "https://www.bryant.edu/", logo: "/sponsors/bryant-university.png" },
];

export function Sponsors() {
  const { ref, hasEntered } = useInView();

  return (
    <section
      id="sponsors"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "linear-gradient(to bottom, #0f1210, #070a09)" }}
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
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 items-center justify-items-center gap-10 sm:grid-cols-3 sm:gap-12">
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
                className={`h-auto max-h-24 w-auto object-contain opacity-80 transition-opacity hover:opacity-100 ${
                  sponsor.round ? "rounded-full" : ""
                }`}
              />
            </a>
          ))}
        </div>

        <p className="font-body mt-12 text-center text-sm text-white/40">
          Interested in sponsoring?{" "}
          <a
            href="mailto:alaraia1@babson.edu"
            className="font-medium text-[#00e87b] underline underline-offset-4 transition-colors hover:text-[#00ff88]"
          >
            Get in touch
          </a>
        </p>
      </div>
    </section>
  );
}

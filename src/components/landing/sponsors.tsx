"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

interface SponsorEntry {
  name: string;
  href: string;
  logo: string;
  invert?: boolean;
  whiten?: boolean;
}

const partners: SponsorEntry[] = [
  { name: "Babson College", href: "https://www.babson.edu/", logo: "/sponsors/babson-college.png", whiten: true },
  { name: "Bentley University", href: "https://www.bentley.edu/", logo: "/sponsors/bentley-university.png" },
  { name: "Bryant University", href: "https://www.bryant.edu/", logo: "/sponsors/bryant-university.png" },
  { name: "The Generator", href: "https://www.babson.edu/thegenerator/", logo: "/sponsors/generator-ai-lab.png" },
  { name: "Butler Institute", href: "https://www.babson.edu/entrepreneurship-center/thought-leadership/butler-institute-for-free-enterprise-through-entrepreneurship/", logo: "/sponsors/butler-institute.png" },
  { name: "Bentley E-Hub", href: "https://www.bentley.edu/", logo: "/sponsors/bentley-ehub.png" },
];

const sponsors: SponsorEntry[] = [
  { name: "ElevenLabs", href: "https://elevenlabs.io/", logo: "/sponsors/eleven-labs.png", invert: true },
  { name: "Tripo AI", href: "https://www.tripo3d.ai/", logo: "/sponsors/tripo-ai.png" },
  { name: "HubSpot", href: "https://www.hubspot.com/", logo: "/sponsors/hubspot.png" },
  { name: "Lovable", href: "https://lovable.dev/", logo: "/sponsors/lovable.png" },
  { name: "Cursor", href: "https://www.cursor.com/", logo: "/sponsors/cursor.png" },
  { name: "OpenAI", href: "https://openai.com/", logo: "/sponsors/openai.png" },
  { name: "Anthropic", href: "https://www.anthropic.com/", logo: "/sponsors/anthropic.svg" },
  { name: "WHOOP", href: "https://www.whoop.com/", logo: "/sponsors/whoop.svg" },
  { name: "Weissman Foundry", href: "https://www.foundry.babson.edu/", logo: "/sponsors/weissman-foundry.png" },
  { name: "Maritime", href: "https://maritime.sh/", logo: "/sponsors/maritime.svg" },
  { name: "Offscript", href: "https://offscriptvc.com/", logo: "/sponsors/offscript-vc.svg" },
  { name: "Mass AI Coalition", href: "https://massaicoalition.com/", logo: "/sponsors/mass-ai-coalition.png" },
];

function logoFilter(item: SponsorEntry): string {
  if (item.whiten) return "brightness-0 invert";
  if (item.invert) return "invert";
  return "";
}

function LogoGrid({ items }: { items: SponsorEntry[] }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 items-center justify-items-center gap-10 sm:grid-cols-3 md:grid-cols-4 sm:gap-12">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit ${item.name}`}
          className="flex items-center justify-center px-4"
        >
          <Image
            src={item.logo}
            alt={item.name}
            width={200}
            height={100}
            className={`h-auto max-h-24 w-auto object-contain opacity-80 transition-opacity hover:opacity-100 ${logoFilter(item)}`}
          />
        </a>
      ))}
    </div>
  );
}

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

        {/* Partners */}
        <div className="mt-16">
          <p className="font-data mb-8 text-center text-xs font-medium uppercase tracking-widest text-white/50">
            Partners
          </p>
          <LogoGrid items={partners} />
        </div>

        {/* Divider */}
        <div className="mx-auto my-14 max-w-md border-t border-white/10" />

        {/* Sponsors */}
        <div>
          <p className="font-data mb-8 text-center text-xs font-medium uppercase tracking-widest text-white/50">
            Sponsors
          </p>
          <LogoGrid items={sponsors} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";

interface TrackSponsor {
  name: string;
  logo: string;
  href?: string;
  /** Apply CSS invert filter (for dark logos on dark bg) */
  invert?: boolean;
  /** Apply brightness-0 invert (turns logo solid white) */
  whiten?: boolean;
}

interface Track {
  number: string;
  title: string;
  subtitle: string;
  sponsor?: TrackSponsor;
  description: string;
  focusAreas: string[];
}

const tracks: Track[] = [
  {
    number: "01",
    title: "AI-Enhanced Athletic Performance",
    subtitle: "Optimizing Human Performance",
    description:
      "Design AI-powered tools that help athletes train smarter, prevent injury, and perform at their best. Solutions can support professional athletes, everyday fitness enthusiasts, or people beginning their wellness journey. Teams should focus on systems that combine data, feedback, and intelligent insights to improve training outcomes, safety, and long-term health.",
    focusAreas: [
      "Wearable AI systems that provide real-time feedback on movement, posture, fatigue, or recovery",
      "Personalized training plans powered by AI that adapt to performance, biometrics, and goals",
      "Injury prediction and prevention using motion tracking, biomechanics analysis, or training load data",
      "AI-assisted coaching tools for technique improvement, performance analysis, or recovery guidance",
    ],
  },
  {
    number: "02",
    title: "AI-Powered Accessibility Solutions",
    subtitle: "Technology for Every Body",
    sponsor: {
      name: "Butler Institute",
      logo: "/sponsors/butler-institute.png",
      href: "https://www.babson.edu/entrepreneurship-center/thought-leadership/butler-institute-for-free-enterprise-through-entrepreneurship/",
    },
    description:
      "Build AI-driven tools that meaningfully improve daily life for people with disabilities, including those with cognitive, neurodiverse, physical, or sensory disabilities. Solutions should prioritize accessibility, dignity, user-centered design, and measurable impact on independence, well-being, and participation in society. Consider how you would co-design this in the real world with people with disabilities.",
    focusAreas: [
      "Assistive AI for cognitive support, attention, memory, and executive function",
      "Tools for neurodiverse communication, learning, and sensory regulation",
      "Physical accessibility and mobility enhancement through AI and sensors",
      "Vision, hearing, and speech assistive technologies",
    ],
  },
  {
    number: "03",
    title: "Entrepreneurial AI for Unseen Markets",
    subtitle: "Innovating in Untapped Spaces",
    sponsor: {
      name: "GitHub Education",
      logo: "/sponsors/github-education.png",
      href: "https://education.github.com/",
      invert: true,
    },
    description:
      "Use AI to identify and build solutions for overlooked or underserved opportunities in the wellness economy. Teams should focus on markets, communities, or problems that traditional health and wellness products ignore. Strong projects will combine entrepreneurship and AI to uncover new customer segments, unmet needs, or entirely new categories of wellness innovation.",
    focusAreas: [
      "AI tools that expand access to mental wellness resources, coaching, or early intervention",
      "Solutions designed for underserved or overlooked communities with limited access to health and wellness services",
      "New AI-powered consumer wellness products that rethink how people care for their body and mind",
      "Platforms that uncover hidden market opportunities using behavioral, social, or health data",
    ],
  },
];

const placeholderTracks = [
  { number: "01", label: "Track 1", hint: "Something big is coming..." },
  { number: "02", label: "Track 2", hint: "You won't want to miss this..." },
  { number: "03", label: "Track 3", hint: "Think outside the box..." },
];

function sponsorLogoClass(s: TrackSponsor): string {
  if (s.whiten) return "brightness-0 invert";
  if (s.invert) return "invert";
  return "";
}

export function Tracks() {
  const { ref, hasEntered } = useInView();
  const [released, setReleased] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tracks")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setReleased(!!data?.released);
      })
      .catch(() => {
        if (!cancelled) setReleased(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="tracks"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0a1a14, #070a09)" }}
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
            Competition Tracks
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {released ? "Three Tracks. One Theme." : "Three Tracks. Endless Possibilities."}
          </h2>
          {!released && (
            <p className="font-data mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#00e87b]/70">
              Tracks revealed April 10th
            </p>
          )}
        </div>

        {released ? (
          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
            {tracks.map((track) => (
              <article
                key={track.number}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-colors hover:border-[#00e87b]/30"
              >
                {/* Number + title */}
                <div>
                  <span className="font-data text-xs font-medium uppercase tracking-[0.25em] text-[#00e87b]">
                    Track {track.number}
                  </span>
                  <h3 className="font-display mt-3 text-2xl font-bold leading-tight text-white">
                    {track.title}
                  </h3>
                  <p className="font-body mt-2 text-sm italic text-white/60">
                    {track.subtitle}
                  </p>
                </div>

                {/* Sponsor */}
                {track.sponsor && (
                  <div className="mt-6 flex flex-col items-start gap-2">
                    <span className="font-data text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
                      Brought to you by
                    </span>
                    {track.sponsor.href ? (
                      <a
                        href={track.sponsor.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={track.sponsor.name}
                        className="block"
                      >
                        <Image
                          src={track.sponsor.logo}
                          alt={track.sponsor.name}
                          width={140}
                          height={40}
                          className={`h-10 w-auto object-contain ${sponsorLogoClass(track.sponsor)}`}
                        />
                      </a>
                    ) : (
                      <Image
                        src={track.sponsor.logo}
                        alt={track.sponsor.name}
                        width={140}
                        height={40}
                        className={`h-10 w-auto object-contain ${sponsorLogoClass(track.sponsor)}`}
                      />
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="font-body mt-6 text-sm leading-relaxed text-white/75">
                  {track.description}
                </p>

                {/* Focus areas */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="font-data text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00e87b]">
                    Suggested Focus Areas
                  </p>
                  <ul className="mt-4 space-y-3">
                    {track.focusAreas.map((area, i) => (
                      <li
                        key={i}
                        className="font-body flex gap-2 text-sm leading-relaxed text-white/70"
                      >
                        <span aria-hidden className="mt-1 text-[#00e87b]">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Locked view */
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
                <span className="font-data text-6xl font-bold text-white/[0.15] sm:text-7xl lg:text-8xl">
                  {track.number}
                </span>
                <span className="font-data mt-3 text-xs font-medium uppercase tracking-[0.25em] text-white/30">
                  Track
                </span>
                <p
                  className="font-body mt-4 max-w-[180px] text-center text-sm text-white/25"
                  style={{ filter: "blur(2px)" }}
                >
                  {track.hint}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="font-body mt-12 text-center text-sm text-white/40">
          All tracks connect to our theme:{" "}
          <span className="font-semibold text-[#00e87b]">AI x Body &amp; Mind</span>
        </p>
      </div>
    </section>
  );
}

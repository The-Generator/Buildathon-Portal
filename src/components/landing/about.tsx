"use client";

import Image from "next/image";
import { Brain, Clock, Users, Zap } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const features = [
  {
    icon: Brain,
    title: "AI x Body & Mind",
    description:
      "Build solutions at the intersection of artificial intelligence and human well-being.",
  },
  {
    icon: Clock,
    title: "12-Hour Sprint",
    description:
      "From concept to prototype in one intense day. Push your limits, learn fast, and ship.",
  },
  {
    icon: Users,
    title: "Teams of 5",
    description:
      "Our matching algorithm builds balanced teams across skills, roles, and experience.",
  },
  {
    icon: Zap,
    title: "Prizes & Mentors",
    description:
      "Compete across multiple tracks with prizes for each. Industry mentors guide you throughout.",
  },
];

export function About() {
  const { ref, hasEntered } = useInView();

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(to bottom, #070a09, #0a1a14)" }}>
      {/* Background photo at slightly higher opacity */}
      <Image
        src="/photos/buildathon-hacking.jpg"
        alt=""
        fill
        className="object-cover object-center opacity-[0.08]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a09]/80 via-transparent to-[#0a1a14]/80" />

      <div
        ref={ref}
        className={`relative mx-auto max-w-6xl px-6 transition-all duration-700 ease-out ${
          hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Two-column editorial layout */}
        <div className="grid gap-16 lg:grid-cols-[55%_1fr]">
          {/* Left column — header + description + watermark */}
          <div className="relative">
            <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
              About the Event
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              What is the Build-a-thon?
            </h2>
            <p className="font-body mt-6 text-lg leading-relaxed text-white/60">
              The Generator Build-a-thon is Babson College&apos;s flagship hackathon —
              a 12-hour sprint where 500 students from across Boston-area universities
              come together to build AI-powered solutions. Whether you&apos;re a seasoned
              developer or picking up code for the first time, this is your chance to
              learn, create, and compete.
            </p>

            {/* Oversized typographic watermark */}
            <div className="pointer-events-none absolute -bottom-8 -left-2 select-none font-data text-7xl font-bold text-white/[0.04] sm:text-8xl lg:text-9xl" aria-hidden="true">
              12 HRS
            </div>
          </div>

          {/* Right column — feature list */}
          <div className="flex flex-col justify-center">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group flex gap-4 py-6 transition-colors ${
                  i < features.length - 1 ? "border-b border-white/[0.08]" : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#00e87b]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-body text-base font-semibold text-white/80 transition-colors group-hover:text-white">
                    {feature.title}
                  </h3>
                  <p className="font-body mt-1 text-sm leading-relaxed text-white/40 transition-colors group-hover:text-white/55">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo video */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-white/8">
            <video
              className="aspect-video w-full bg-black"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src="/buildathon-promo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

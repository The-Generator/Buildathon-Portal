"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EVENT_CONFIG } from "@/lib/constants";

const TARGET_DATE = new Date(EVENT_CONFIG.startTime);

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-bold tabular-nums text-white sm:text-5xl md:text-6xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs font-medium uppercase tracking-widest text-white/50 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

/* Floating decorative SVG elements — neurons, DNA, brain waves */
function FloatingElements() {
  return (
    <>
      {/* Neural network node cluster - top right */}
      <svg
        className="animate-float-slow absolute top-20 right-10 h-32 w-32 opacity-20 sm:h-48 sm:w-48"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="50" r="8" fill="#00e87b" />
        <circle cx="50" cy="120" r="6" fill="#00e87b" />
        <circle cx="150" cy="130" r="7" fill="#00e87b" />
        <circle cx="80" cy="170" r="5" fill="#00e87b" />
        <circle cx="160" cy="60" r="5" fill="#00e87b" />
        <line x1="100" y1="50" x2="50" y2="120" stroke="#00e87b" strokeWidth="1" opacity="0.5" />
        <line x1="100" y1="50" x2="150" y2="130" stroke="#00e87b" strokeWidth="1" opacity="0.5" />
        <line x1="100" y1="50" x2="160" y2="60" stroke="#00e87b" strokeWidth="1" opacity="0.5" />
        <line x1="50" y1="120" x2="80" y2="170" stroke="#00e87b" strokeWidth="1" opacity="0.5" />
        <line x1="150" y1="130" x2="80" y2="170" stroke="#00e87b" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* DNA helix strand - left side */}
      <svg
        className="animate-float-medium absolute top-1/3 left-6 h-40 w-16 opacity-15 sm:left-16 sm:h-56 sm:w-20"
        viewBox="0 0 60 200"
        fill="none"
      >
        <path d="M10 10 Q30 30 50 50 Q30 70 10 90 Q30 110 50 130 Q30 150 10 170" stroke="#00e87b" strokeWidth="2" fill="none" />
        <path d="M50 10 Q30 30 10 50 Q30 70 50 90 Q30 110 10 130 Q30 150 50 170" stroke="#00e87b" strokeWidth="2" fill="none" />
        <line x1="20" y1="30" x2="40" y2="30" stroke="#00e87b" strokeWidth="1" opacity="0.4" />
        <line x1="15" y1="70" x2="45" y2="70" stroke="#00e87b" strokeWidth="1" opacity="0.4" />
        <line x1="20" y1="110" x2="40" y2="110" stroke="#00e87b" strokeWidth="1" opacity="0.4" />
        <line x1="15" y1="150" x2="45" y2="150" stroke="#00e87b" strokeWidth="1" opacity="0.4" />
      </svg>

      {/* Brain wave pulse - bottom right */}
      <svg
        className="animate-pulse-glow absolute bottom-32 right-8 h-16 w-48 opacity-20 sm:right-20 sm:h-20 sm:w-64"
        viewBox="0 0 300 60"
        fill="none"
      >
        <path
          d="M0 30 L30 30 L45 10 L60 50 L75 10 L90 50 L105 30 L150 30 L165 15 L180 45 L195 15 L210 45 L225 30 L300 30"
          stroke="#00e87b"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Floating orbs */}
      <div className="animate-float-fast absolute top-1/4 right-1/4 h-3 w-3 rounded-full bg-[#00e87b] opacity-30 blur-[1px]" />
      <div className="animate-drift absolute bottom-1/3 left-1/4 h-2 w-2 rounded-full bg-[#00e87b] opacity-25 blur-[1px]" />
      <div className="animate-float-medium absolute top-2/3 right-1/3 h-4 w-4 rounded-full bg-[#00e87b] opacity-15 blur-[2px]" />
    </>
  );
}

/* Tilted floating stat cards like TreeHacks */
function StatCard({
  value,
  label,
  rotate,
  delay,
}: {
  value: string;
  label: string;
  rotate: string;
  delay: string;
}) {
  return (
    <div
      className="animate-float-medium rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5"
      style={{ transform: `rotate(${rotate})`, animationDelay: delay }}
    >
      <p className="text-2xl font-bold text-[#00e87b] sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/60 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

export function Hero() {
  const countdown = useCountdown(TARGET_DATE);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0f0d]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d] via-[#0d1a14] to-[#0a0f0d]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,232,123,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,98,65,0.12)_0%,_transparent_50%)]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,232,123,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,123,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <FloatingElements />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center">
        {/* Date badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00e87b]/20 bg-[#00e87b]/10 px-5 py-2 text-sm font-semibold text-[#00e87b]">
          <span className="h-2 w-2 rounded-full bg-[#00e87b] animate-pulse" />
          APRIL 11, 2026
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Generator
          <br />
          <span className="bg-gradient-to-r from-[#00e87b] via-[#00d4a0] to-[#00e87b] bg-clip-text text-transparent animate-gradient">
            Build-a-thon
          </span>
        </h1>

        {/* Theme */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
          A 12-hour hackathon at <span className="text-white/90 font-medium">Babson College</span> exploring
          the intersection of <span className="text-[#00e87b] font-semibold">AI</span>,{" "}
          <span className="text-[#00e87b] font-semibold">Body</span> &{" "}
          <span className="text-[#00e87b] font-semibold">Mind</span>
        </p>

        {/* Countdown */}
        <div className="mt-12 flex justify-center gap-5 sm:gap-8">
          <CountdownUnit value={countdown.days} label="Days" />
          <span className="self-start pt-2 text-3xl font-light text-white/20 sm:text-4xl md:text-5xl">
            :
          </span>
          <CountdownUnit value={countdown.hours} label="Hours" />
          <span className="self-start pt-2 text-3xl font-light text-white/20 sm:text-4xl md:text-5xl">
            :
          </span>
          <CountdownUnit value={countdown.minutes} label="Min" />
          <span className="self-start pt-2 text-3xl font-light text-white/20 sm:text-4xl md:text-5xl">
            :
          </span>
          <CountdownUnit value={countdown.seconds} label="Sec" />
        </div>

        {/* CTA buttons */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-full bg-[#00e87b] px-10 py-4 text-base font-bold text-[#0a0f0d] shadow-lg shadow-[#00e87b]/20 transition-all hover:bg-[#00ff88] hover:shadow-xl hover:shadow-[#00e87b]/30"
          >
            Register Now
          </Link>
          <a
            href="#about"
            className="rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Floating stat cards */}
      <div className="relative z-10 mx-auto mb-20 hidden w-full max-w-4xl justify-center gap-6 px-6 md:flex">
        <StatCard value="500" label="Hackers" rotate="-3deg" delay="0s" />
        <StatCard value="12h" label="of Building" rotate="2deg" delay="0.5s" />
        <StatCard value="3" label="Universities" rotate="-1deg" delay="1s" />
        <StatCard value="5" label="Per Team" rotate="3deg" delay="1.5s" />
      </div>
    </section>
  );
}

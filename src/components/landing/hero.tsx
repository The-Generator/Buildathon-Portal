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
      <span className="text-4xl font-bold tabular-nums sm:text-5xl md:text-6xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs font-medium uppercase tracking-widest text-white/70 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export function Hero() {
  const countdown = useCountdown(TARGET_DATE);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#006241]">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#006241] via-[#004d33] to-[#003322]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,200,120,0.12)_0%,_transparent_60%)]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center text-white">
        {/* Theme badge */}
        <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
          {EVENT_CONFIG.theme}
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Babson Generator
          <br />
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Build-a-thon 2026
          </span>
        </h1>

        {/* Date & location */}
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
          April 11, 2026 &nbsp;|&nbsp; Knight Auditorium, Babson College
        </p>

        {/* Countdown */}
        <div className="mt-10 flex justify-center gap-6 sm:gap-10">
          <CountdownUnit value={countdown.days} label="Days" />
          <span className="self-start pt-3 text-3xl font-light text-white/40 sm:text-4xl md:text-5xl">
            :
          </span>
          <CountdownUnit value={countdown.hours} label="Hours" />
          <span className="self-start pt-3 text-3xl font-light text-white/40 sm:text-4xl md:text-5xl">
            :
          </span>
          <CountdownUnit value={countdown.minutes} label="Min" />
          <span className="self-start pt-3 text-3xl font-light text-white/40 sm:text-4xl md:text-5xl">
            :
          </span>
          <CountdownUnit value={countdown.seconds} label="Sec" />
        </div>

        {/* CTA buttons */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#006241] shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl"
          >
            Register Now
          </Link>
          <a
            href="#about"
            className="rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

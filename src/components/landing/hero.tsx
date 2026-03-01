"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { EVENT_CONFIG } from "@/lib/constants";

const TARGET_DATE = new Date(EVENT_CONFIG.startTime);

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
      <span className="font-data text-3xl font-medium tabular-nums text-white sm:text-5xl md:text-6xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-body mt-1 text-[10px] font-medium uppercase tracking-widest text-white/50 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

/* Animated DNA Double Helix SVG — right side */
function DoubleHelixSVG() {
  const steps = 28;
  const height = 400;
  const width = 120;
  const cx = width / 2;
  const amplitude = 40;

  const strandA: { x: number; y: number }[] = [];
  const strandB: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = t * height;
    const phase = t * Math.PI * 4;
    strandA.push({ x: cx + Math.sin(phase) * amplitude, y });
    strandB.push({ x: cx - Math.sin(phase) * amplitude, y });
  }

  const toPath = (pts: { x: number; y: number }[]) => {
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
    }
    return d;
  };

  const rungIndices = [3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <svg
      className="absolute top-12 right-4 h-64 w-20 opacity-25 sm:right-10 sm:h-80 sm:w-24 lg:right-16 lg:h-[420px] lg:w-28"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path d={toPath(strandA)} stroke="#00e87b" strokeWidth="2.5" fill="none" strokeLinecap="round" className="svg-draw" />
      <path d={toPath(strandB)} stroke="#00e87b" strokeWidth="2.5" fill="none" strokeLinecap="round" className="svg-draw svg-draw-delay-2" />
      {rungIndices.map((idx, i) => (
        <line key={`rung-${i}`} x1={strandA[idx].x} y1={strandA[idx].y} x2={strandB[idx].x} y2={strandB[idx].y}
          stroke="#00e87b" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" className="svg-draw"
          style={{ animationDelay: `${1.2 + i * 0.15}s` }} />
      ))}
      {rungIndices.map((idx, i) => (
        <g key={`nodes-${i}`}>
          <circle cx={strandA[idx].x} cy={strandA[idx].y} r="3" fill="#00e87b" className="svg-node-pulse"
            style={{ animationDelay: `${i * 0.25}s`, transformOrigin: `${strandA[idx].x}px ${strandA[idx].y}px` }} />
          <circle cx={strandB[idx].x} cy={strandB[idx].y} r="3" fill="#00e87b" className="svg-node-pulse"
            style={{ animationDelay: `${i * 0.25 + 0.12}s`, transformOrigin: `${strandB[idx].x}px ${strandB[idx].y}px` }} />
        </g>
      ))}
      <circle r="2.5" fill="#00ff88" opacity="0.8">
        <animateMotion dur="5s" repeatCount="indefinite" path={toPath(strandA)} />
      </circle>
      <circle r="2.5" fill="#00ff88" opacity="0.8">
        <animateMotion dur="5s" repeatCount="indefinite" path={toPath(strandB)} begin="2.5s" />
      </circle>
    </svg>
  );
}

/* Animated DNA Helix SVG — left side */
function DNAHelixSVG() {
  return (
    <svg
      className="absolute top-1/4 left-4 h-56 w-16 opacity-20 sm:left-12 sm:h-72 sm:w-20 lg:left-20"
      viewBox="0 0 60 250"
      fill="none"
    >
      <path d="M10 10 Q30 35 50 60 Q30 85 10 110 Q30 135 50 160 Q30 185 10 210 Q30 235 50 250" stroke="#00e87b" strokeWidth="2" fill="none" className="svg-draw" />
      <path d="M50 10 Q30 35 10 60 Q30 85 50 110 Q30 135 10 160 Q30 185 50 210 Q30 235 10 250" stroke="#00e87b" strokeWidth="2" fill="none" className="svg-draw svg-draw-delay-2" />
      {[35, 85, 135, 185, 235].map((y, i) => (
        <line key={`rung-${i}`} x1="18" y1={y} x2="42" y2={y} stroke="#00e87b" strokeWidth="1" opacity="0.4" className="svg-draw"
          style={{ animationDelay: `${1 + i * 0.2}s` }} />
      ))}
    </svg>
  );
}

/* Animated Brain Wave SVG */
function BrainWaveSVG() {
  return (
    <svg
      className="absolute bottom-28 left-1/2 h-12 w-64 -translate-x-1/2 opacity-15 sm:h-16 sm:w-96"
      viewBox="0 0 400 60"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 L40 30 L55 8 L70 52 L85 8 L100 52 L115 30 L160 30 L175 12 L190 48 L205 12 L220 48 L235 30 L280 30 L295 15 L310 45 L325 15 L340 45 L355 30 L400 30"
        stroke="#00e87b" strokeWidth="2" fill="none" className="animate-brain-wave"
      />
    </svg>
  );
}

/* Stat row — inline, no floating cards */
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-3 sm:px-4">
      <p className="font-data text-xl font-medium text-[#00e87b] sm:text-3xl">{value}</p>
      <p className="font-body mt-1 text-[10px] font-medium uppercase tracking-wider text-white/50 sm:text-sm">{label}</p>
    </div>
  );
}

export function Hero() {
  const countdown = useCountdown(TARGET_DATE);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0f0d]">
      {/* Hero background image — real event photo */}
      <Image
        src="/photos/buildathon-overview.jpg"
        alt="Build-a-thon event overview"
        fill
        priority
        className="object-cover object-center opacity-20"
        sizes="100vw"
      />
      {/* Dark overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d]/70 via-[#0a0f0d]/50 to-[#0a0f0d]/95" />
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

      {/* Animated SVG decorations — hidden on mobile to reduce clutter */}
      <div className="hidden sm:block">
        <DoubleHelixSVG />
        <DNAHelixSVG />
        <BrainWaveSVG />
      </div>

      {/* Floating orbs — hidden on mobile */}
      <div className="hidden sm:block">
        <div className="animate-float-fast absolute top-1/4 right-1/4 h-3 w-3 rounded-full bg-[#00e87b] opacity-30 blur-[1px]" />
        <div className="animate-drift absolute bottom-1/3 left-1/4 h-2 w-2 rounded-full bg-[#00e87b] opacity-25 blur-[1px]" />
        <div className="animate-float-medium absolute top-2/3 right-1/3 h-4 w-4 rounded-full bg-[#00e87b] opacity-15 blur-[2px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-24 text-center sm:px-6 sm:py-32">
        {/* Date badge */}
        <div className="font-data mb-8 inline-flex items-center gap-2 rounded-full border border-[#00e87b]/20 bg-[#00e87b]/10 px-5 py-2 text-sm font-medium text-[#00e87b]">
          <span className="h-2 w-2 rounded-full bg-[#00e87b] animate-pulse" />
          APRIL 11, 2026
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Generator
          <br />
          <span className="bg-gradient-to-r from-[#00e87b] via-[#00d4a0] to-[#00e87b] bg-clip-text text-transparent animate-gradient">
            Build-a-thon
          </span>
        </h1>

        {/* Theme */}
        <p className="font-body mx-auto mt-5 max-w-2xl text-base text-white/60 sm:mt-6 sm:text-xl">
          A 12-hour hackathon at <span className="text-white/90 font-medium">Babson College</span> exploring
          the intersection of <span className="text-[#00e87b] font-semibold">AI</span>,{" "}
          <span className="text-[#00e87b] font-semibold">Body</span> &{" "}
          <span className="text-[#00e87b] font-semibold">Mind</span>
        </p>

        {/* Countdown */}
        <div className="mt-10 flex justify-center gap-3 sm:mt-12 sm:gap-8">
          <CountdownUnit value={countdown.days} label="Days" />
          <span className="font-data self-start pt-1 text-2xl font-light text-white/20 sm:pt-2 sm:text-4xl md:text-5xl">:</span>
          <CountdownUnit value={countdown.hours} label="Hours" />
          <span className="font-data self-start pt-1 text-2xl font-light text-white/20 sm:pt-2 sm:text-4xl md:text-5xl">:</span>
          <CountdownUnit value={countdown.minutes} label="Min" />
          <span className="font-data self-start pt-1 text-2xl font-light text-white/20 sm:pt-2 sm:text-4xl md:text-5xl">:</span>
          <CountdownUnit value={countdown.seconds} label="Sec" />
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/register"
            className="shimmer-border rounded-full bg-[#00e87b] px-10 py-4 text-base font-bold text-[#0a0f0d] shadow-lg shadow-[#00e87b]/20 transition-all hover:bg-[#00ff88] hover:shadow-xl hover:shadow-[#00e87b]/30"
          >
            Register Now
          </Link>
          <a
            href="#about"
            className="glass-card rounded-full px-10 py-4 text-base font-semibold text-white transition-all hover:border-white/40"
          >
            Learn More
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex justify-center divide-x divide-white/10 sm:mt-16">
          <StatItem value="500" label="Hackers" />
          <StatItem value="12h" label="of Building" />
          <StatItem value="3" label="Universities" />
          <StatItem value="5" label="Per Team" />
        </div>

        {/* Promo Video */}
        <div className="mx-auto mt-12 max-w-2xl sm:mt-16">
          <div className="glass-card overflow-hidden rounded-2xl">
            <video
              className="aspect-video w-full bg-black"
              controls
              preload="metadata"
              poster=""
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

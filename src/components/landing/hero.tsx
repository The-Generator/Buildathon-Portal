"use client";

import { useState, useEffect, useRef } from "react";
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
      <span className="font-body mt-1 text-[10px] font-medium uppercase tracking-widest text-white/40 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

/** Per-cycle randomized parameters for realistic EKG variation. */
interface CycleParams {
  rWaveHeight: number;   // 0.30–0.46
  sWaveDepth: number;    // 0.10–0.20
  pWaveHeight: number;   // 0.03–0.09
  tWaveHeight: number;   // 0.05–0.11
  qrsOffset: number;     // timing shift -0.02–0.02
  baselineWander: number; // subtle drift -0.015–0.015
}

function randomCycleParams(): CycleParams {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  return {
    rWaveHeight: rand(0.30, 0.46),
    sWaveDepth: rand(0.10, 0.20),
    pWaveHeight: rand(0.03, 0.09),
    tWaveHeight: rand(0.05, 0.11),
    qrsOffset: rand(-0.02, 0.02),
    baselineWander: rand(-0.015, 0.015),
  };
}

/** Returns y-offset (0–1, where 0.5 is baseline) for a single EKG cycle at position t (0–1). */
function ekgCycle(t: number, params?: CycleParams): number {
  const p_ = params ?? { rWaveHeight: 0.38, sWaveDepth: 0.15, pWaveHeight: 0.06, tWaveHeight: 0.08, qrsOffset: 0, baselineWander: 0 };
  const mid = 0.5 + p_.baselineWander;
  const qrsStart = 0.40 + p_.qrsOffset;

  // Flatline before P-wave
  if (t < 0.30) return mid;
  // P-wave bump
  if (t < 0.35) {
    const p = (t - 0.30) / 0.05;
    return mid - p_.pWaveHeight * Math.sin(p * Math.PI);
  }
  // Return to baseline
  if (t < qrsStart) return mid;
  // QRS complex: sharp R-wave up
  if (t < qrsStart + 0.02) {
    const p = (t - qrsStart) / 0.02;
    return mid - p_.rWaveHeight * p;
  }
  // QRS: sharp S-wave down below baseline
  if (t < qrsStart + 0.04) {
    const p = (t - (qrsStart + 0.02)) / 0.02;
    return mid - p_.rWaveHeight * (1 - p) + p_.sWaveDepth * p;
  }
  // Return to baseline from S-wave
  if (t < qrsStart + 0.08) {
    const p = (t - (qrsStart + 0.04)) / 0.04;
    return mid + p_.sWaveDepth * (1 - p);
  }
  // T-wave gentle bump
  if (t < qrsStart + 0.18) {
    const p = (t - (qrsStart + 0.08)) / 0.10;
    return mid - p_.tWaveHeight * Math.sin(p * Math.PI);
  }
  // Flatline after T-wave
  return mid;
}

function HeartbeatMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    const SWEEP_DURATION = 3000; // ms — one full left-to-right pass
    const CYCLES = 2; // number of heartbeats visible across the width
    const GAP_WIDTH = 0.06; // blank gap ahead of cursor
    const FADE_WIDTH = 0.12; // fade-out zone behind the gap
    const startTime = performance.now();

    // Generate random params for each cycle, re-roll when cursor wraps
    let cycleParamsArr: CycleParams[] = Array.from({ length: CYCLES }, () => randomCycleParams());
    let lastSweepIndex = 0; // track wrap-arounds to regenerate params

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Get the y value at position t (0→1 across full canvas width) using per-cycle params. */
    const getY = (t: number, h: number): number => {
      const cycleIndex = Math.floor(t * CYCLES) % CYCLES;
      const cycleT = (t * CYCLES) % 1;
      return ekgCycle(cycleT, cycleParamsArr[cycleIndex]) * h;
    };

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, w, h);

      const elapsed = performance.now() - startTime;
      const cursor = reducedMotion ? 1 : (elapsed % SWEEP_DURATION) / SWEEP_DURATION;

      // Regenerate random params each time the cursor wraps around
      const sweepIndex = Math.floor(elapsed / SWEEP_DURATION);
      if (sweepIndex !== lastSweepIndex) {
        lastSweepIndex = sweepIndex;
        cycleParamsArr = Array.from({ length: CYCLES }, () => randomCycleParams());
      }

      const steps = Math.max(400, Math.floor(w * 2));

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      if (reducedMotion) {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const y = getY(t, h);
          if (i === 0) ctx.moveTo(t * w, y); else ctx.lineTo(t * w, y);
        }
        ctx.strokeStyle = "rgba(0, 232, 123, 0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();
        frameId = requestAnimationFrame(render);
        return;
      }

      // Draw the EKG trace segment by segment with per-segment alpha.
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const prevT = (i - 1) / steps;
        const x = t * w;
        const prevX = prevT * w;
        const y = getY(t, h);
        const prevY = getY(prevT, h);

        // Calculate distance ahead of cursor (wrapping around)
        let distAhead = t - cursor;
        if (distAhead < 0) distAhead += 1;

        // Gap zone: invisible
        if (distAhead < GAP_WIDTH) continue;

        // Fade zone: fading out (old trace about to be erased)
        let alpha: number;
        if (distAhead < GAP_WIDTH + FADE_WIDTH) {
          // Fades from 0 at gap edge to moderate further away
          alpha = ((distAhead - GAP_WIDTH) / FADE_WIDTH) * 0.25;
        } else {
          // Everything behind cursor that isn't in gap/fade is the "drawn" portion
          // Freshly drawn = bright, older = dimmer
          let distBehind = cursor - t;
          if (distBehind < 0) distBehind += 1;
          // Bright near cursor, fading to base further back
          alpha = Math.max(0.25, 0.9 - distBehind * 1.2);
        }

        // Edge fade at canvas boundaries
        const edgeX = Math.min(x, prevX);
        const edgeMaxX = Math.max(x, prevX);
        if (edgeX < w * 0.05) alpha *= edgeX / (w * 0.05);
        if (edgeMaxX > w * 0.95) alpha *= (w - edgeMaxX) / (w * 0.05);

        // Main trace
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#00e87b";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow for bright segments
        if (alpha > 0.5) {
          ctx.globalAlpha = (alpha - 0.5) * 0.5;
          ctx.lineWidth = 6;
          ctx.stroke();
        }
      }

      // Glowing cursor dot
      const cursorX = cursor * w;
      const cursorY = getY(cursor, h);
      const cursorEdge = cursorX < w * 0.05 ? cursorX / (w * 0.05) : cursorX > w * 0.95 ? (w - cursorX) / (w * 0.05) : 1;

      ctx.globalAlpha = 0.95 * cursorEdge;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#00e87b";
      ctx.fill();

      const glowGrad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 14);
      glowGrad.addColorStop(0, "rgba(0, 232, 123, 0.7)");
      glowGrad.addColorStop(1, "rgba(0, 232, 123, 0)");
      ctx.globalAlpha = 0.9 * cursorEdge;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 14, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-[80%] max-w-3xl h-[48px] sm:h-[60px]"
      />
      <span className="font-data text-[9px] uppercase tracking-[0.25em] text-white/30 sm:text-[10px]">
        Time is counting down
      </span>
    </div>
  );
}

export function Hero() {
  const countdown = useCountdown(TARGET_DATE);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070a09]">
      {/* Background photo at higher opacity */}
      <Image
        src="/photos/buildathon-overview.jpg"
        alt="Build-a-thon event overview"
        fill
        priority
        className="object-cover object-center opacity-25"
        sizes="100vw"
      />
      {/* Bottom-heavy gradient for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a09]/40 via-transparent to-[#070a09]/95" />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-24 text-center sm:px-6 sm:py-32">
        {/* Date label */}
        <p className="font-data mb-6 text-sm font-medium uppercase tracking-[0.3em] text-white/50 sm:text-base">
          APRIL 11, 2026
        </p>

        {/* Headline */}
        <h1 className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-8xl lg:text-9xl">
          Generator
          <br />
          <span className="bg-gradient-to-r from-[#00e87b] via-[#00d4a0] to-[#00e87b] bg-clip-text text-transparent animate-gradient">
            Build-a-thon
          </span>
        </h1>

        {/* Theme */}
        <p className="font-body mx-auto mt-6 max-w-2xl text-base text-white/50 sm:mt-8 sm:text-xl">
          A 12-hour hackathon at <span className="text-white/80 font-medium">Babson College</span> exploring
          the intersection of <span className="text-[#00e87b] font-semibold">AI</span>,{" "}
          <span className="text-[#00e87b] font-semibold">Body</span> &{" "}
          <span className="text-[#00e87b] font-semibold">Mind</span>
        </p>

        {/* Brought to you by */}
        <div className="mt-8 flex flex-col items-center gap-5 sm:mt-10">
          <p className="font-data text-[10px] font-medium uppercase tracking-[0.25em] text-white/40 sm:text-xs">
            Brought to you by
          </p>
          <div className="grid grid-cols-3 items-center gap-4 sm:gap-6">
            <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(0,232,123,0.3)] transition-all duration-300 hover:scale-115 hover:drop-shadow-[0_0_20px_rgba(0,232,123,0.5)]">
              <Image
                src="/sponsors/bentley-university.png"
                alt="Bentley University"
                width={240}
                height={80}
                className="h-12 w-auto object-contain sm:h-16 md:h-20"
              />
            </div>
            <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(0,232,123,0.3)] transition-all duration-300 hover:scale-115 hover:drop-shadow-[0_0_20px_rgba(0,232,123,0.5)]">
              <Image
                src="/sponsors/babson-college-green.png"
                alt="Babson College"
                width={360}
                height={120}
                className="h-[4.5rem] w-auto object-contain sm:h-24 md:h-[7.5rem]"
              />
            </div>
            <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(0,232,123,0.3)] transition-all duration-300 hover:scale-115 hover:drop-shadow-[0_0_20px_rgba(0,232,123,0.5)]">
              <Image
                src="/sponsors/bryant-university.png"
                alt="Bryant University"
                width={240}
                height={80}
                className="h-12 w-auto object-contain sm:h-16 md:h-20"
              />
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-8 flex justify-center gap-3 sm:mt-10 sm:gap-8">
          <CountdownUnit value={countdown.days} label="Days" />
          <span className="font-data self-start pt-1 text-2xl font-light text-white/15 sm:pt-2 sm:text-4xl md:text-5xl">:</span>
          <CountdownUnit value={countdown.hours} label="Hours" />
          <span className="font-data self-start pt-1 text-2xl font-light text-white/15 sm:pt-2 sm:text-4xl md:text-5xl">:</span>
          <CountdownUnit value={countdown.minutes} label="Min" />
          <span className="font-data self-start pt-1 text-2xl font-light text-white/15 sm:pt-2 sm:text-4xl md:text-5xl">:</span>
          <CountdownUnit value={countdown.seconds} label="Sec" />
        </div>

        {/* Live heartbeat monitor */}
        <div className="mt-6 sm:mt-8">
          <HeartbeatMonitor />
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-[#006241] px-10 py-4 text-base font-bold text-white shadow-lg shadow-[#006241]/20 transition-all hover:bg-[#007a52] hover:shadow-xl hover:shadow-[#006241]/30"
          >
            Register Now
          </Link>
          <a
            href="#about"
            className="rounded-xl border border-white/15 px-10 py-4 text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/5"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

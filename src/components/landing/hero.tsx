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

/** Returns y-offset (0–1, where 0.5 is baseline) for a single EKG cycle at position t (0–1). */
function ekgCycle(t: number): number {
  const mid = 0.5;
  // Flatline before P-wave
  if (t < 0.30) return mid;
  // P-wave bump
  if (t < 0.35) {
    const p = (t - 0.30) / 0.05;
    return mid - 0.06 * Math.sin(p * Math.PI);
  }
  // Return to baseline
  if (t < 0.40) return mid;
  // QRS complex: sharp R-wave up
  if (t < 0.42) {
    const p = (t - 0.40) / 0.02;
    return mid - 0.38 * p;
  }
  // QRS: sharp S-wave down below baseline
  if (t < 0.44) {
    const p = (t - 0.42) / 0.02;
    return mid - 0.38 * (1 - p) + 0.15 * p;
  }
  // Return to baseline from S-wave
  if (t < 0.48) {
    const p = (t - 0.44) / 0.04;
    return mid + 0.15 * (1 - p);
  }
  // T-wave gentle bump
  if (t < 0.58) {
    const p = (t - 0.48) / 0.10;
    return mid - 0.08 * Math.sin(p * Math.PI);
  }
  // Flatline after T-wave
  return mid;
}

function HeartbeatMonitor({ tick }: { tick: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    lastTick: tick,
    brightness: 0,
    lastPulseTime: 0,
    reducedMotion: false,
  });

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Trigger pulse on tick change
  useEffect(() => {
    if (tick !== stateRef.current.lastTick) {
      stateRef.current.lastTick = tick;
      stateRef.current.brightness = 1.0;
      stateRef.current.lastPulseTime = performance.now();
    }
  }, [tick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    let frameId: number;
    const CYCLES = 2; // Two heartbeat cycles across the canvas
    const FADE_DECAY = 800; // ms for brightness to decay

    /** Build the EKG path points for given canvas dimensions. */
    function buildPath(w: number, h: number): { x: number; y: number }[] {
      const points: { x: number; y: number }[] = [];
      const steps = Math.max(200, Math.floor(w));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps; // 0→1 across canvas
        const cycleT = (t * CYCLES) % 1; // position within single cycle
        const y = ekgCycle(cycleT) * h;
        points.push({ x: t * w, y });
      }
      return points;
    }

    /** Find the x position of the QRS peak (R-wave top) for glow dot. */
    function findPeakX(w: number): number[] {
      const peaks: number[] = [];
      for (let c = 0; c < CYCLES; c++) {
        // R-wave peak is at t=0.42 within each cycle
        const t = (c + 0.42) / CYCLES;
        peaks.push(t * w);
      }
      return peaks;
    }

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

      const points = buildPath(w, h);

      if (state.reducedMotion) {
        // Static dim EKG path
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          if (i === 0) ctx.moveTo(points[i].x, points[i].y);
          else ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = "rgba(0, 232, 123, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
        frameId = requestAnimationFrame(render);
        return;
      }

      // Calculate current brightness (exponential decay)
      const elapsed = performance.now() - state.lastPulseTime;
      const brightness = state.lastPulseTime > 0
        ? Math.max(0, Math.exp(-elapsed / (FADE_DECAY / 3)))
        : 0;

      // Create edge fade gradient mask
      const edgeFade = ctx.createLinearGradient(0, 0, w, 0);
      edgeFade.addColorStop(0, "rgba(0, 232, 123, 0)");
      edgeFade.addColorStop(0.10, "rgba(0, 232, 123, 1)");
      edgeFade.addColorStop(0.90, "rgba(0, 232, 123, 1)");
      edgeFade.addColorStop(1, "rgba(0, 232, 123, 0)");

      // Draw dim base path
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = edgeFade;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      // Draw bright pulsing path on top
      if (brightness > 0.01) {
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          if (i === 0) ctx.moveTo(points[i].x, points[i].y);
          else ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.globalAlpha = brightness * 0.5;
        ctx.strokeStyle = edgeFade;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow / bloom layer
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          if (i === 0) ctx.moveTo(points[i].x, points[i].y);
          else ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.globalAlpha = brightness * 0.2;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Glow dots at QRS peaks
        const peaks = findPeakX(w);
        for (const peakX of peaks) {
          const peakT = peakX / w;
          const cycleT = (peakT * CYCLES) % 1;
          const peakY = ekgCycle(cycleT) * h;
          // Edge fade factor for the dot
          const edgeFactor = peakX < w * 0.1
            ? peakX / (w * 0.1)
            : peakX > w * 0.9
              ? (w - peakX) / (w * 0.1)
              : 1;

          ctx.globalAlpha = brightness * 0.7 * edgeFactor;
          ctx.beginPath();
          ctx.arc(peakX, peakY, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#00e87b";
          ctx.fill();

          // Radial glow around peak dot
          ctx.beginPath();
          ctx.arc(peakX, peakY, 12, 0, Math.PI * 2);
          const glowGrad = ctx.createRadialGradient(
            peakX, peakY, 0,
            peakX, peakY, 12
          );
          glowGrad.addColorStop(0, "rgba(0, 232, 123, 0.5)");
          glowGrad.addColorStop(1, "rgba(0, 232, 123, 0)");
          ctx.globalAlpha = brightness * edgeFactor;
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }
      }

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
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
          <p className="font-data text-[10px] font-medium uppercase tracking-[0.25em] text-white/40 sm:text-xs">
            Brought to you by
          </p>
          <div className="grid grid-cols-3 items-center gap-8 sm:gap-12">
            <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(0,232,123,0.3)] transition-all duration-300 hover:scale-115 hover:drop-shadow-[0_0_20px_rgba(0,232,123,0.5)]">
              <Image
                src="/sponsors/babson-college-green.png"
                alt="Babson College"
                width={240}
                height={80}
                className="h-12 w-auto object-contain sm:h-16 md:h-20"
              />
            </div>
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
          <HeartbeatMonitor tick={Math.floor(countdown.seconds / 3)} />
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

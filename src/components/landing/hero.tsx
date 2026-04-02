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

function HeartbeatMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    const SWEEP_DURATION = 4000; // ms for one full sweep
    const GAP_WIDTH = 0.05;
    const FADE_WIDTH = 0.10;
    const BUFFER_SIZE = 800; // resolution of the waveform buffer
    const startTime = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Circular buffer of y-values (0–1, 0.5 = baseline)
    const buffer = new Float32Array(BUFFER_SIZE).fill(0.5);

    // State machine for generating the waveform in real-time
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    let state: "flat" | "p-wave" | "qrs-up" | "qrs-down" | "recovery" | "t-wave" = "flat";
    let stateCounter = 0; // samples remaining in current state
    let flatUntilBeat = Math.floor(rand(200, 450)); // long flatline — only ~2 beats per screen
    let baselineWander = 0;
    let wanderTarget = 0;

    // Current beat's randomized params
    let rHeight = 0;
    let sDepth = 0;
    let pHeight = 0;
    let tHeight = 0;
    let lastWriteIndex = 0;

    /** Generate the next sample value. */
    function nextSample(): number {
      // Slowly wander the baseline
      baselineWander += (wanderTarget - baselineWander) * 0.02;
      if (Math.random() < 0.005) wanderTarget = rand(-0.03, 0.03);
      const base = 0.5 + baselineWander;
      const noise = (Math.random() - 0.5) * 0.008; // tiny noise

      switch (state) {
        case "flat":
          flatUntilBeat--;
          if (flatUntilBeat <= 0) {
            // Start a new beat — randomize everything
            rHeight = rand(0.22, 0.45);
            sDepth = rand(0.08, 0.18);
            pHeight = rand(0.03, 0.09);
            tHeight = rand(0.04, 0.12);
            state = "p-wave";
            stateCounter = Math.floor(rand(8, 14)); // p-wave duration
          }
          return base + noise;

        case "p-wave": {
          const progress = 1 - stateCounter / Math.floor(rand(8, 14) || 12);
          stateCounter--;
          const val = base - pHeight * Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI);
          if (stateCounter <= 0) {
            state = "qrs-up";
            stateCounter = Math.floor(rand(3, 6));
          }
          return val + noise;
        }

        case "qrs-up": {
          const total = stateCounter + 1;
          stateCounter--;
          const progress = 1 - stateCounter / total;
          const val = base - rHeight * progress;
          if (stateCounter <= 0) {
            state = "qrs-down";
            stateCounter = Math.floor(rand(3, 6));
          }
          return val;
        }

        case "qrs-down": {
          const total = stateCounter + 1;
          stateCounter--;
          const progress = 1 - stateCounter / total;
          const val = base - rHeight * (1 - progress) + sDepth * progress;
          if (stateCounter <= 0) {
            state = "recovery";
            stateCounter = Math.floor(rand(6, 12));
          }
          return val;
        }

        case "recovery": {
          const total = stateCounter + 1;
          stateCounter--;
          const progress = 1 - stateCounter / total;
          const val = base + sDepth * (1 - progress);
          if (stateCounter <= 0) {
            state = "t-wave";
            stateCounter = Math.floor(rand(12, 22));
          }
          return val + noise;
        }

        case "t-wave": {
          const total = stateCounter + 1;
          stateCounter--;
          const progress = 1 - stateCounter / total;
          const val = base - tHeight * Math.sin(progress * Math.PI);
          if (stateCounter <= 0) {
            state = "flat";
            flatUntilBeat = Math.floor(rand(200, 450)); // long random gap until next beat
          }
          return val + noise;
        }
      }
    }

    // Pre-fill the buffer so the initial screen has a waveform
    for (let i = 0; i < BUFFER_SIZE; i++) {
      buffer[i] = nextSample();
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

      const elapsed = performance.now() - startTime;
      const cursor = reducedMotion ? 1 : (elapsed % SWEEP_DURATION) / SWEEP_DURATION;

      // Advance the buffer — write new samples up to cursor position
      const writeIndex = Math.floor(cursor * BUFFER_SIZE);
      if (writeIndex !== lastWriteIndex) {
        // Write new samples from lastWriteIndex to writeIndex (handles wrap)
        let i = (lastWriteIndex + 1) % BUFFER_SIZE;
        const end = (writeIndex + 1) % BUFFER_SIZE;
        let safety = 0;
        while (i !== end && safety < BUFFER_SIZE) {
          buffer[i] = nextSample();
          i = (i + 1) % BUFFER_SIZE;
          safety++;
        }
        lastWriteIndex = writeIndex;
      }

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      if (reducedMotion) {
        ctx.beginPath();
        for (let i = 0; i < BUFFER_SIZE; i++) {
          const x = (i / BUFFER_SIZE) * w;
          const y = buffer[i] * h;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(0, 232, 123, 0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();
        frameId = requestAnimationFrame(render);
        return;
      }

      // Draw buffer segment by segment with alpha based on distance from cursor
      for (let i = 1; i < BUFFER_SIZE; i++) {
        const t = i / BUFFER_SIZE;
        const prevT = (i - 1) / BUFFER_SIZE;
        const x = t * w;
        const prevX = prevT * w;
        const y = buffer[i] * h;
        const prevY = buffer[i - 1] * h;

        let distAhead = t - cursor;
        if (distAhead < 0) distAhead += 1;

        // Gap zone
        if (distAhead < GAP_WIDTH) continue;

        // Alpha
        let alpha: number;
        if (distAhead < GAP_WIDTH + FADE_WIDTH) {
          alpha = ((distAhead - GAP_WIDTH) / FADE_WIDTH) * 0.25;
        } else {
          let distBehind = cursor - t;
          if (distBehind < 0) distBehind += 1;
          alpha = Math.max(0.2, 0.9 - distBehind * 1.5);
        }

        // Edge fade
        if (x < w * 0.05) alpha *= x / (w * 0.05);
        if (x > w * 0.95) alpha *= (w - x) / (w * 0.05);

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#00e87b";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (alpha > 0.5) {
          ctx.globalAlpha = (alpha - 0.5) * 0.4;
          ctx.lineWidth = 6;
          ctx.stroke();
        }
      }

      // Cursor dot
      const cursorX = cursor * w;
      const cursorY = buffer[Math.floor(cursor * BUFFER_SIZE)] * h;
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
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/register"
              className="relative overflow-hidden rounded-xl bg-[#006241] px-10 py-4 text-base font-bold text-white shadow-lg shadow-[#006241]/20 transition-all hover:bg-[#007a52] hover:shadow-xl hover:shadow-[#006241]/30"
            >
              Register Now
            </Link>
            <span className="text-xs font-medium text-white/50">Registration closes April 7th</span>
          </div>
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

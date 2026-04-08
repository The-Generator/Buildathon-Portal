"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DEADLINE = new Date("2026-04-08T23:59:59-04:00");
const STORAGE_KEY = "deadline-banner-dismissed";

function getDaysLeft() {
  const now = new Date();
  const diff = DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function DeadlineBanner() {
  const [dismissed, setDismissed] = useState(true); // hidden by default until client checks
  const [daysLeft, setDaysLeft] = useState(getDaysLeft);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(wasDismissed);

    const interval = setInterval(() => setDaysLeft(getDaysLeft()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed || daysLeft <= 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  // Color shift based on urgency — always contrast against the dark site
  let bg: string;
  let textColor = "text-white";
  if (daysLeft <= 1) {
    bg = "bg-red-600";
  } else if (daysLeft <= 2) {
    bg = "bg-amber-500";
    textColor = "text-black";
  } else {
    bg = "bg-amber-400";
    textColor = "text-black";
  }

  const daysText =
    daysLeft === 1
      ? "Last day to register!"
      : `${daysLeft} days left to register`;

  return (
    <div className={`${bg} ${textColor} relative z-[60]`}>
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-4 px-6 py-2.5 text-sm font-medium">
        <p className="flex items-center gap-2">
          <span className="hidden sm:inline">Registration extended to April 8th —</span>
          <span className="font-bold">{daysText}</span>
        </p>
        <Link
          href="/register"
          className="flex-shrink-0 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold hover:bg-white/30 transition-colors"
        >
          Register Now &rarr;
        </Link>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

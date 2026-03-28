"use client";

import Link from "next/link";
import { useInView } from "@/hooks/useInView";

export function SponsorCTA() {
  const { ref, hasEntered } = useInView();

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20"
      style={{ background: "linear-gradient(to bottom, #0d1f18, #0a1a14)" }}
    >
      <div
        ref={ref}
        className={`relative mx-auto max-w-3xl px-6 text-center transition-all duration-700 ease-out ${
          hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Interested in Sponsoring?
        </h3>
        <p className="font-body mt-3 text-base text-white/50 sm:text-lg">
          Partner with us to support the next generation of innovators and get
          your brand in front of 500+ students.
        </p>
        <Link
          href="/partners"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#006241] px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-[#007a52]"
        >
          Become a Partner
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

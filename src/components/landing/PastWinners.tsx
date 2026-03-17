"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";
import { WINNERS } from "@/data/winners";
import { Trophy, X } from "lucide-react";

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="h-auto max-h-[90vh] w-auto rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

export function PastWinners() {
  const { ref, hasEntered } = useInView();
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  return (
    <>
      <section
        className="relative overflow-hidden py-24 sm:py-32"
        style={{ background: "linear-gradient(to bottom, #0a1210, #0f1210)" }}
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
              Hall of Fame
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Past Winners
            </h2>
            <p className="font-body mt-4 text-white/50">
              Celebrating the teams that built something extraordinary.
            </p>
          </div>

          {/* Winner cards */}
          <div className="mx-auto mt-14 max-w-3xl">
            {WINNERS.map((winner) => (
              <div
                key={`${winner.team}-${winner.event}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                {/* 2x2 photo quadrant */}
                <div className="grid grid-cols-2 gap-1">
                  {winner.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        openLightbox(img, `${winner.team} — photo ${i + 1}`)
                      }
                      className="group relative aspect-[4/3] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00e87b] focus-visible:ring-inset"
                    >
                      <Image
                        src={img}
                        alt={`${winner.team} — photo ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 384px"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="rounded-full bg-black/50 px-3 py-1.5 font-body text-xs font-medium text-white">
                          Click to enlarge
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Info */}
                <div className="px-4 py-5 sm:px-6 sm:py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                        {winner.team}
                      </h3>
                      <p className="font-body mt-1 text-sm text-white/50">
                        {winner.event} &middot; {winner.track}
                      </p>
                      <p className="font-body mt-3 text-sm leading-relaxed text-white/60">
                        {winner.description}
                      </p>
                    </div>
                    <Trophy className="mt-1 h-6 w-6 shrink-0 text-[#00e87b]" />
                  </div>

                  {winner.deckUrl && (
                    <a
                      href={winner.deckUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#00e87b]/30 bg-[#00e87b]/10 px-4 py-2 font-body text-sm font-medium text-[#00e87b] transition-colors hover:bg-[#00e87b]/20"
                    >
                      View Pitch Deck
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox overlay */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

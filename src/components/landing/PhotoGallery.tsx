"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

const photos = [
  {
    src: "/photos/buildathon-event.jpg",
    alt: "Students collaborating at the Build-a-thon",
  },
  {
    src: "/photos/buildathon-hacking.jpg",
    alt: "Teams hacking on projects",
  },
  {
    src: "/photos/buildathon-overhead.jpg",
    alt: "Overhead view of the Build-a-thon workspace",
  },
  {
    src: "/photos/buildathon-presentation.jpg",
    alt: "Team presenting their project",
  },
  {
    src: "/photos/buildathon-group.jpeg",
    alt: "Build-a-thon team group photo",
  },
  {
    src: "/photos/buildathon-teamwork.jpg",
    alt: "Students working together at the Build-a-thon",
  },
];

export function PhotoGallery() {
  const { ref, hasEntered } = useInView();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32" style={{ background: "linear-gradient(to bottom, #070a09, #0a1210)" }}>
      <div
        ref={ref}
        className={`transition-all duration-700 ease-out ${
          hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Section header */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
              From Last Year
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Build-a-thon in Action
            </h2>
            <p className="font-body mt-6 text-lg leading-relaxed text-white/60">
              A look back at what 200+ students built in 12 hours at the
              Spring 2025 Generator Build-a-thon.
            </p>
          </div>
        </div>

        {/* Full-bleed photo grid */}
        <div className="mt-16 grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className={`group relative overflow-hidden ${
                i === 0 ? "col-span-2 lg:col-span-2 row-span-2" : ""
              }`}
            >
              <div className={`relative w-full ${i === 0 ? "aspect-[3/2]" : "aspect-[4/3]"}`}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={
                    i === 0
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 50vw, 33vw"
                  }
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-3 left-3 right-3 font-body text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-sm">
                  {photo.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

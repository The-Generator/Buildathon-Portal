import Image from "next/image";

const photos = [
  {
    src: "/photos/buildathon-event.jpg",
    alt: "Students collaborating at the Build-a-thon",
    width: 1200,
    height: 800,
  },
  {
    src: "/photos/buildathon-hacking.jpg",
    alt: "Teams hacking on projects",
    width: 1200,
    height: 800,
  },
  {
    src: "/photos/buildathon-overhead.jpg",
    alt: "Overhead view of the Build-a-thon workspace",
    width: 600,
    height: 529,
  },
  {
    src: "/photos/buildathon-presentation.jpg",
    alt: "Team presenting their project",
    width: 600,
    height: 446,
  },
  {
    src: "/photos/buildathon-group.jpeg",
    alt: "Build-a-thon team group photo",
    width: 1200,
    height: 800,
  },
  {
    src: "/photos/buildathon-teamwork.jpg",
    alt: "Students working together at the Build-a-thon",
    width: 600,
    height: 323,
  },
];

export function PhotoGallery() {
  return (
    <section className="relative bg-[#0a0f0d] py-24 sm:py-32 overflow-hidden">
      {/* Gradient borders */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0f0d] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0f0d] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-emerald-400">
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

        {/* Photo grid — masonry-inspired with varying spans */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className={`group relative overflow-hidden rounded-xl ${
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

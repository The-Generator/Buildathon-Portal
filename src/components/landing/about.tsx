import { Brain, Clock, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI x Body & Mind",
    description:
      "Build solutions at the intersection of artificial intelligence and human well-being. Explore how AI can enhance physical health, mental wellness, and the mind-body connection.",
  },
  {
    icon: Clock,
    title: "12-Hour Sprint",
    description:
      "From concept to prototype in one intense day. Push your limits, learn fast, and ship something real by 9 PM.",
  },
  {
    icon: Users,
    title: "Teams of 5",
    description:
      "Collaborate with students from Babson, Bentley, and Bryant. Our matching algorithm builds balanced teams across skills, roles, and experience.",
  },
  {
    icon: Zap,
    title: "Prizes & Mentors",
    description:
      "Compete across multiple tracks with prizes for each. Industry mentors and faculty advisors guide you throughout the day.",
  },
];

export function About() {
  return (
    <section id="about" className="relative bg-[#0a0f0d] py-24 sm:py-32">
      {/* Subtle top gradient transition */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0f0d] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00e87b]">
            About the Event
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What is the Build-a-thon?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/60">
            The Generator Build-a-thon is Babson College&apos;s flagship hackathon —
            a 12-hour sprint where 500 students from across Boston-area universities
            come together to build AI-powered solutions. Whether you&apos;re a seasoned
            developer or picking up code for the first time, this is your chance to
            learn, create, and compete.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-[#00e87b]/20 hover:bg-white/[0.06]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-[#00e87b]/10 p-3 text-[#00e87b] transition-colors group-hover:bg-[#00e87b]/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

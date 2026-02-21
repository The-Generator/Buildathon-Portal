import { Brain, Clock, Users, Trophy } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered",
    description:
      "Build innovative solutions at the intersection of artificial intelligence and human well-being. Leverage cutting-edge AI tools and APIs to create something meaningful.",
  },
  {
    icon: Clock,
    title: "12-Hour Sprint",
    description:
      "From concept to prototype in one intense day. Push your limits, learn fast, and ship something real by the end of the event.",
  },
  {
    icon: Users,
    title: "Teams of 5",
    description:
      "Collaborate with talented peers from Babson, Bentley, and Bryant. Mix skills across engineering, design, business, and data science.",
  },
  {
    icon: Trophy,
    title: "Prizes & Mentorship",
    description:
      "Compete for prizes across multiple tracks. Get guidance from industry mentors and faculty advisors throughout the day.",
  },
];

export function About() {
  return (
    <section id="about" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#006241]">
            About the Event
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What is the Build-a-thon?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            The Babson Generator Build-a-thon is a 12-hour hackathon bringing
            together students from across Boston-area universities to build
            AI-powered solutions around the theme of{" "}
            <span className="font-semibold text-[#006241]">
              Body &amp; Mind
            </span>
            . Whether you&apos;re a seasoned developer or a first-time hacker,
            this is your chance to learn, create, and compete.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:border-[#006241]/20 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-[#006241]/10 p-3 text-[#006241] transition-colors group-hover:bg-[#006241] group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

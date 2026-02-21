import {
  Coffee,
  Mic,
  Rocket,
  UtensilsCrossed,
  Users,
  Upload,
  Scale,
  Award,
  PartyPopper,
} from "lucide-react";

const scheduleItems = [
  { time: "9:00 AM", title: "Registration & Breakfast", icon: Coffee, accent: false },
  { time: "10:00 AM", title: "Opening Ceremony", icon: Mic, accent: true },
  { time: "10:30 AM", title: "Hacking Begins", icon: Rocket, accent: true },
  { time: "12:30 PM", title: "Lunch", icon: UtensilsCrossed, accent: false },
  { time: "3:00 PM", title: "Mentor Check-ins", icon: Users, accent: false },
  { time: "5:30 PM", title: "Dinner", icon: UtensilsCrossed, accent: false },
  { time: "7:00 PM", title: "Submissions Due", icon: Upload, accent: true },
  { time: "7:30 PM", title: "Judging", icon: Scale, accent: false },
  { time: "8:30 PM", title: "Awards Ceremony", icon: Award, accent: true },
  { time: "9:00 PM", title: "Closing", icon: PartyPopper, accent: false },
];

export function Schedule() {
  return (
    <section id="schedule" className="relative bg-[#0a0f0d] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00e87b]">
            Day-of Schedule
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Saturday, April 11
          </h2>
          <p className="mt-4 text-white/50">
            12 hours of building, learning, and competing at Knight Auditorium.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto mt-16 max-w-2xl">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-[#00e87b]/40 via-[#00e87b]/20 to-[#00e87b]/40 sm:left-[31px]" />

          <div className="space-y-1">
            {scheduleItems.map((item, i) => (
              <div key={i} className="group relative flex items-start gap-5 py-4">
                {/* Dot on timeline */}
                <div
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-16 sm:w-16 ${
                    item.accent
                      ? "border-[#00e87b]/40 bg-[#00e87b]/10 text-[#00e87b]"
                      : "border-white/10 bg-white/5 text-white/40 group-hover:border-[#00e87b]/30 group-hover:text-[#00e87b]"
                  }`}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                {/* Content */}
                <div className="pt-3 sm:pt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#00e87b]/70">
                    {item.time}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

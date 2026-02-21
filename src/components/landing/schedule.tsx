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
  { time: "9:00 AM", title: "Registration & Breakfast", icon: Coffee },
  { time: "10:00 AM", title: "Opening Ceremony", icon: Mic },
  { time: "10:30 AM", title: "Hacking Begins", icon: Rocket },
  { time: "12:30 PM", title: "Lunch", icon: UtensilsCrossed },
  { time: "3:00 PM", title: "Mentor Check-ins", icon: Users },
  { time: "5:30 PM", title: "Dinner", icon: UtensilsCrossed },
  { time: "7:00 PM", title: "Submissions Due", icon: Upload },
  { time: "7:30 PM", title: "Judging", icon: Scale },
  { time: "8:30 PM", title: "Awards Ceremony", icon: Award },
  { time: "9:00 PM", title: "Closing", icon: PartyPopper },
];

export function Schedule() {
  return (
    <section id="schedule" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#006241]">
            Day-of Schedule
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Saturday, April 11, 2026
          </h2>
          <p className="mt-4 text-gray-600">
            12 hours of building, learning, and competing.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto mt-16 max-w-2xl">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gray-200 sm:left-[31px]" />

          <div className="space-y-1">
            {scheduleItems.map((item, i) => (
              <div key={i} className="group relative flex items-start gap-5 py-4">
                {/* Dot on timeline */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 transition-all group-hover:border-[#006241] group-hover:text-[#006241] sm:h-16 sm:w-16">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                {/* Content */}
                <div className="pt-3 sm:pt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#006241]">
                    {item.time}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
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

import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  ClipboardCheck,
  Laptop,
  GraduationCap,
} from "lucide-react";
import { EVENT_CONFIG } from "@/lib/constants";

const details = [
  {
    icon: CalendarDays,
    label: "When",
    value: "Saturday, April 11, 2026 — 8 AM to 8:30 PM",
  },
  {
    icon: MapPin,
    label: "Where",
    value: EVENT_CONFIG.location,
  },
  {
    icon: GraduationCap,
    label: "Who can participate",
    value:
      "Any currently enrolled undergraduate or graduate student. All universities welcome — not just Babson.",
  },
  {
    icon: Users,
    label: "Team size",
    value:
      "Teams of up to 5. Register solo, with a partial team, or bring a full squad. Solo registrants get matched before the event.",
  },
  {
    icon: Laptop,
    label: "What to bring",
    value:
      "Your laptop, charger, and any hardware you want to build with. We provide Wi-Fi, power, workspaces, and all meals.",
  },
  {
    icon: ClipboardCheck,
    label: "Requirements",
    value:
      "Just register ahead of time and show up. No cost, no prerequisites, no coding experience required. Walk-ins accepted on event day (space permitting).",
  },
];

export function RegistrationInfo() {
  return (
    <section
      id="register-info"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "linear-gradient(to bottom, #0a1a14, #0a1a14)" }}
    >

      <div className="relative mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            Registration
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything You Need to Know
          </h2>
          <p className="font-body mt-6 text-lg leading-relaxed text-white/60">
            Free to attend. Open to all students. Here&apos;s the rundown.
          </p>
        </div>

        {/* Details list — clean vertical layout, no card grid */}
        <dl className="mt-14 space-y-8">
          {details.map((item) => (
            <div
              key={item.label}
              className="flex gap-4 sm:gap-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00e87b]/10 text-[#00e87b] sm:h-12 sm:w-12">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <dt className="font-body text-sm font-semibold uppercase tracking-wide text-[#00e87b]">
                  {item.label}
                </dt>
                <dd className="font-body mt-1 text-base leading-relaxed text-white/70 sm:text-lg">
                  {item.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/register"
            className="inline-block rounded-xl bg-[#006241] px-10 py-4 text-base font-bold text-white shadow-lg shadow-[#006241]/20 transition-all hover:bg-[#007a52] hover:shadow-xl hover:shadow-[#006241]/30"
          >
            Register Now
          </Link>
          <p className="font-body mt-4 text-sm text-white/40">
            Registration is free and takes about 3 minutes.
          </p>
          <p className="font-body mt-2 text-sm font-semibold text-amber-400">
            Registration closes April 7th
          </p>
        </div>
      </div>
    </section>
  );
}

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
    value: "April 11, 2026 — 9 AM to 9 PM",
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
      className="relative overflow-hidden bg-neutral-950 py-24 sm:py-32"
    >
      {/* Subtle top/bottom gradient continuity */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-neutral-950 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-emerald-400">
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 sm:h-12 sm:w-12">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <dt className="font-body text-sm font-semibold uppercase tracking-wide text-emerald-400">
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
            className="shimmer-border inline-block rounded-full bg-emerald-400 px-10 py-4 text-base font-bold text-neutral-950 shadow-lg shadow-emerald-400/20 transition-all hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-400/30"
          >
            Register Now
          </Link>
          <p className="font-body mt-4 text-sm text-white/40">
            Registration is free and takes about 3 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}

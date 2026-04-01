"use client";

import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { TIERS, BENEFIT_ROWS } from "@/data/partners";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      {/* Header bar */}
      <header className="border-b border-white/5 bg-[#0a0f0d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 px-3 font-body text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="font-display text-lg font-bold text-white">
            Partnership Opportunities
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Page intro */}
        <div className="mb-16 max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Partner With Us
          </h1>
          <p className="font-body mt-4 text-lg leading-relaxed text-white/50">
            Over the past two years, the Generator Build-a-thon has brought
            together 200+ participants from across New England to build
            AI-powered projects in 12 hours. This year, we&apos;re going bigger
            than ever — shooting for 500 builders. Partner with us to connect
            with the next generation of innovators.
          </p>
        </div>

        {/* ── Sponsorship Tiers ── */}
        <section className="mb-20">
          <h2 className="font-display mb-2 text-2xl font-bold text-white">
            Sponsorship Tiers
          </h2>
          <p className="font-body mb-10 text-white/40">
            Financial sponsorships — choose the tier that fits your goals.
          </p>

          {/* Desktop table (hidden on mobile) */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-6 py-4 font-body text-sm font-medium text-white/40">
                    Benefits
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.name}
                      className="px-4 py-4 text-center"
                    >
                      <span
                        className="font-display block text-lg font-bold"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </span>
                      <span className="font-body text-sm text-white/50">
                        {tier.price}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENEFIT_ROWS.map((benefit, rowIdx) => (
                  <tr
                    key={benefit}
                    className={
                      rowIdx % 2 === 0
                        ? "bg-white/[0.02]"
                        : "bg-transparent"
                    }
                  >
                    <td className="px-6 py-3.5 font-body text-sm text-white/70">
                      {benefit}
                    </td>
                    {TIERS.map((tier) => (
                      <td
                        key={tier.name}
                        className="px-4 py-3.5 text-center"
                      >
                        {tier.benefits[rowIdx] ? (
                          <Check className="mx-auto h-5 w-5 text-[#00e87b]" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-white/15" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards (hidden on desktop) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-4">
                  <span
                    className="font-display text-lg font-bold"
                    style={{ color: tier.color }}
                  >
                    {tier.name}
                  </span>
                  <span className="font-body ml-2 text-sm text-white/50">
                    {tier.price}
                  </span>
                </div>
                <ul className="space-y-2">
                  {BENEFIT_ROWS.map((benefit, i) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 font-body text-sm"
                    >
                      {tier.benefits[i] ? (
                        <Check className="h-4 w-4 shrink-0 text-[#00e87b]" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-white/15" />
                      )}
                      <span
                        className={
                          tier.benefits[i]
                            ? "text-white/70"
                            : "text-white/25"
                        }
                      >
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tool & Platform Sponsors ── */}
        <section className="mb-20">
          <h2 className="font-display mb-2 text-2xl font-bold text-white">
            Tool &amp; Platform Sponsors
          </h2>
          <p className="font-body mb-8 text-white/40">
            Credits-based partnerships for API providers, developer tools,
            and platform companies.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-display mb-3 text-lg font-semibold text-white">
                What You Provide
              </h3>
              <ul className="space-y-2.5 font-body text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  API or compute credits for participants
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  Developer platform access
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  Subscription tool access
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-display mb-3 text-lg font-semibold text-white">
                What You Receive
              </h3>
              <ul className="space-y-2.5 font-body text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  Logo placement on Build-a-thon materials
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  Demo and speaker opportunities
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  Case study and co-marketing potential
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87b]" />
                  Opportunities to judge and access to student ventures
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h2 className="font-display mb-3 text-2xl font-bold text-white">
            Get in Touch
          </h2>
          <p className="font-body mx-auto mb-6 max-w-lg text-white/50">
            Interested in partnering with us? Reach out to our partnerships
            lead to discuss how we can work together.
          </p>
          <a
            href="mailto:etran2@babson.edu"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00e87b] px-6 py-3 font-body text-sm font-semibold text-[#0a0f0d] transition-colors hover:bg-[#00ff88]"
          >
            Contact Partnerships Lead
          </a>
          <p className="font-body mt-4 text-sm text-white/30">
            Or learn more about{" "}
            <a
              href="https://www.babson.edu/thegenerator/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#00e87b] underline underline-offset-4 transition-colors hover:text-[#00ff88]"
            >
              The Generator at Babson College
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}

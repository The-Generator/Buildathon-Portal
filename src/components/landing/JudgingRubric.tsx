import {
  Scale,
  Target,
  Cpu,
  Lightbulb,
  Shield,
  Mic,
  Users,
  Vote,
} from "lucide-react";

const rubricCategories = [
  {
    title: "Problem Validation",
    points: 20,
    icon: Target,
    criteria: [
      "Clearly defined problem with real-world relevance",
      "Evidence of user research or domain understanding",
      "Solution directly addresses the stated problem",
    ],
  },
  {
    title: "Functional Prototype",
    points: 25,
    icon: Cpu,
    criteria: [
      "Working demo — not just slides or mockups",
      "Core user flow is complete and interactive",
      "Handles edge cases gracefully",
    ],
  },
  {
    title: "Technical Innovation",
    points: 20,
    icon: Lightbulb,
    criteria: [
      "Creative or novel use of AI technology",
      "Technical complexity appropriate to team skill level",
      "Effective integration of multiple tools or APIs",
    ],
  },
  {
    title: "Feasibility & Ethics",
    points: 20,
    icon: Shield,
    criteria: [
      "Realistic path to deployment or continued development",
      "Considers data privacy and user safety",
      "Addresses potential bias or misuse risks",
    ],
  },
  {
    title: "Presentation",
    points: 15,
    icon: Mic,
    criteria: [
      "Clear, compelling 3-minute pitch",
      "Strong storytelling and demo flow",
      "All team members contribute meaningfully",
    ],
  },
];

const processSteps = [
  {
    step: "1",
    title: "Preliminary Round",
    description:
      "All teams present to a panel of judges in their assigned track. Each team gets 3 minutes to pitch + 2 minutes Q&A.",
  },
  {
    step: "2",
    title: "Judge Huddle",
    description:
      "Judges deliberate and select finalists from each track based on rubric scores.",
  },
  {
    step: "3",
    title: "Finals",
    description:
      "Finalists present to the full judging panel and audience. Same format — 3 minutes pitch, 2 minutes Q&A.",
  },
  {
    step: "4",
    title: "Ranked-Choice Crowd Vote",
    description:
      "The audience votes using ranked-choice. Final scoring is 80% judges, 20% crowd vote.",
  },
];

export function JudgingRubric() {
  const totalPoints = rubricCategories.reduce((sum, c) => sum + c.points, 0);

  return (
    <section
      id="judging"
      className="relative overflow-hidden bg-[#0a0f0d] py-24 sm:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,232,123,0.04)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            Judging
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How Projects Are Scored
          </h2>
          <p className="font-body mt-6 text-lg leading-relaxed text-white/60">
            Every project is evaluated on a{" "}
            <span className="font-semibold text-white">
              {totalPoints}-point rubric
            </span>{" "}
            across five categories. Judges score independently, then deliberate
            as a panel.
          </p>
        </div>

        {/* Rubric categories */}
        <div className="mt-14 space-y-4">
          {rubricCategories.map((category) => (
            <div
              key={category.title}
              className="glass-card glass-card-shimmer group rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Icon + points */}
                <div className="shrink-0">
                  <div className="inline-flex rounded-xl bg-[#00e87b]/10 p-3 text-[#00e87b] transition-colors group-hover:bg-[#00e87b]/20">
                    <category.icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-body text-lg font-semibold text-white">
                      {category.title}
                    </h3>
                    <span className="font-data text-sm font-bold text-[#00e87b]">
                      {category.points} pts
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {category.criteria.map((criterion) => (
                      <li
                        key={criterion}
                        className="font-body flex items-start gap-2 text-sm leading-relaxed text-white/50"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00e87b]/40" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Points badge (desktop) */}
                <div className="hidden shrink-0 sm:block">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-center">
                    <span className="font-data block text-2xl font-bold text-white">
                      {category.points}
                    </span>
                    <span className="font-data text-[10px] uppercase tracking-wider text-white/40">
                      points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        <div className="mt-6 flex items-center justify-end gap-3 px-2">
          <Scale className="h-4 w-4 text-white/30" />
          <span className="font-data text-sm font-medium text-white/40">
            Total
          </span>
          <span className="font-data text-lg font-bold text-[#00e87b]">
            {totalPoints} points
          </span>
        </div>

        {/* Judging process */}
        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Judging Process
            </h3>
            <p className="font-body mt-4 text-base leading-relaxed text-white/60">
              From preliminary pitches to the final crowd vote — here&apos;s how
              winners are decided.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="glass-card glass-card-shimmer group rounded-2xl p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00e87b]/10 font-data text-sm font-bold text-[#00e87b]">
                    {step.step}
                  </span>
                  <h4 className="font-body text-base font-semibold text-white">
                    {step.title}
                  </h4>
                </div>
                <p className="font-body text-sm leading-relaxed text-white/50">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Scoring split callout */}
          <div className="mx-auto mt-10 max-w-md">
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="mb-3 inline-flex items-center gap-3">
                <Users className="h-5 w-5 text-[#00e87b]" />
                <Vote className="h-5 w-5 text-[#00e87b]" />
              </div>
              <p className="font-body text-sm leading-relaxed text-white/50">
                Final scores are{" "}
                <span className="font-semibold text-white">80% judges</span>{" "}
                and{" "}
                <span className="font-semibold text-white">
                  20% crowd vote
                </span>{" "}
                via ranked-choice ballot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

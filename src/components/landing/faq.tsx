"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is the Generator Build-a-thon?",
    answer:
      "The Generator Build-a-thon is a 12-hour hackathon hosted by Babson College where students from Babson, Bentley, Bryant, and other universities come together to build innovative AI-powered projects around a central theme. It's a day of coding, collaborating, and competing for prizes.",
  },
  {
    question: "Who can participate?",
    answer:
      "Any currently enrolled undergraduate or graduate student is welcome to participate. You don't need to be from Babson, Bentley, or Bryant — students from all universities are encouraged to register.",
  },
  {
    question: "Do I need coding experience?",
    answer:
      "Not at all! Teams benefit from a mix of skills including design, business strategy, project management, and pitching. If you can contribute to building or presenting a product, there's a place for you. We also have mentors available to help with technical questions.",
  },
  {
    question: "How are teams formed?",
    answer:
      "Teams consist of up to 5 members. You can register with a full team, a partial team, or as a solo participant. Solo registrants and partial teams will be matched with others based on skills and interests before the event.",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, and any hardware you want to work with. We'll provide Wi-Fi, power strips, and workspaces. A good attitude and willingness to learn are the most important things to bring!",
  },
  {
    question: "Will food be provided?",
    answer:
      "Yes! Breakfast, lunch, dinner, and snacks will be provided throughout the day at no cost. We accommodate common dietary restrictions — you can specify yours during registration.",
  },
  {
    question: "What are the prizes?",
    answer:
      "Prizes will be awarded across multiple categories including each competition track, as well as special awards for best design, most innovative use of AI, and best pitch. Specific prize details will be announced closer to the event.",
  },
  {
    question: 'What does "AI x Body & Mind" mean?',
    answer:
      "Our theme challenges you to build AI-powered solutions that improve physical health, mental wellness, or the connection between body and mind. Specific tracks within this theme will be revealed on April 10th, the day before the event.",
  },
  {
    question: "Is there a cost to participate?",
    answer:
      "No! The Build-a-thon is completely free to attend. Registration, food, swag, and access to all resources are included at no cost.",
  },
  {
    question: "What happens after I register?",
    answer:
      "After registering, you'll receive a confirmation email with next steps. If you need team matching, we'll reach out before the event. A detailed participant guide will be sent the week of April 6th.",
  },
];

/* Brain wave decoration for FAQ section */
function BrainWaveDecoration() {
  return (
    <svg
      className="absolute right-0 top-1/3 h-16 w-48 opacity-[0.06] sm:w-64"
      viewBox="0 0 300 60"
      fill="none"
    >
      <path
        d="M0 30 L30 30 L45 10 L60 50 L75 10 L90 50 L105 30 L150 30 L165 15 L180 45 L195 15 L210 45 L225 30 L300 30"
        stroke="#00e87b"
        strokeWidth="2"
        fill="none"
        className="animate-brain-wave"
      />
    </svg>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="font-body pr-4 text-base font-semibold text-white sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-all duration-200 ${
            open ? "rotate-180 text-[#00e87b] drop-shadow-[0_0_6px_rgba(0,232,123,0.5)]" : "text-white/30"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="font-body px-6 text-sm leading-relaxed text-white/50 sm:text-base">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative bg-[#0a0f0d] py-24 sm:py-32 overflow-hidden">
      <BrainWaveDecoration />

      <div className="relative mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <p className="font-data text-sm font-medium uppercase tracking-widest text-[#00e87b]">
            FAQ
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="mt-14">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>

        <p className="font-body mt-10 text-center text-sm text-white/40">
          Have more questions?{" "}
          <a
            href="mailto:generator@babson.edu"
            className="font-medium text-[#00e87b] underline underline-offset-4 transition-colors hover:text-[#00ff88]"
          >
            Email us
          </a>
        </p>
      </div>
    </section>
  );
}

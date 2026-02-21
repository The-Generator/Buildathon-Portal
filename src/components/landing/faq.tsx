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
      "Any currently enrolled undergraduate or graduate student is welcome to participate. You don't need to be from Babson, Bentley, or Bryant -- students from all universities are encouraged to register.",
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
      "Yes! Breakfast, lunch, dinner, and snacks will be provided throughout the day at no cost. We accommodate common dietary restrictions -- you can specify yours during registration.",
  },
  {
    question: "What are the prizes?",
    answer:
      "Prizes will be awarded across multiple categories including each competition track, as well as special awards for best design, most innovative use of AI, and best pitch. Specific prize details will be announced closer to the event.",
  },
  {
    question: 'What does the "AI x Body & Mind" theme mean?',
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

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-[#006241]"
      >
        <span className="pr-4 text-base font-semibold text-gray-900 sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180 text-[#006241]" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#006241]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="mt-14">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Have more questions?{" "}
          <a
            href="mailto:generator@babson.edu"
            className="font-medium text-[#006241] underline underline-offset-4 hover:text-[#004d33]"
          >
            Email us
          </a>
        </p>
      </div>
    </section>
  );
}

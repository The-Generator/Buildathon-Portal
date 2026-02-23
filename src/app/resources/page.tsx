"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TOOLS, type ToolCategory } from "@/data/tools";
import { CategoryFilter } from "@/components/resources/CategoryFilter";
import { ToolsGrid } from "@/components/resources/ToolsGrid";

export default function ResourcesPage() {
  const [category, setCategory] = useState<ToolCategory>("All");

  const filtered = useMemo(
    () => (category === "All" ? TOOLS : TOOLS.filter((t) => t.category === category)),
    [category]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tool of TOOLS) {
      map[tool.category] = (map[tool.category] || 0) + 1;
    }
    return map;
  }, []);

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
            AI Tools & Resources
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Page intro */}
        <div className="mb-10 max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            AI Tools & Resources
          </h1>
          <p className="font-body mt-4 text-lg leading-relaxed text-white/50">
            Browse the AI tools available for the Build-a-thon. From coding assistants to
            image generators, these are the tools that can help you build faster and smarter.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CategoryFilter selected={category} onChange={setCategory} counts={counts} />
        </div>

        {/* Tool count */}
        <p className="font-body mb-6 text-sm text-white/30">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
          {category !== "All" && ` in ${category}`}
        </p>

        {/* Grid */}
        <ToolsGrid tools={filtered} />
      </main>
    </div>
  );
}

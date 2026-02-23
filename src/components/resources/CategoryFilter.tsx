"use client";

import { TOOL_CATEGORIES, type ToolCategory } from "@/data/tools";

interface CategoryFilterProps {
  selected: ToolCategory;
  onChange: (category: ToolCategory) => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOOL_CATEGORIES.map((category) => {
        const isActive = selected === category;
        const count = category === "All" ? undefined : counts[category];

        return (
          <button
            type="button"
            key={category}
            onClick={() => onChange(category)}
            aria-pressed={isActive}
            className={`font-body inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-all ${
              isActive
                ? "bg-[#00e87b] text-[#0a0f0d]"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {category}
            {count !== undefined && (
              <span className={`ml-1.5 ${isActive ? "text-[#0a0f0d]/60" : "text-white/30"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

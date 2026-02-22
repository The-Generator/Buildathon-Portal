"use client";

import { AI_TOOLS_BY_CATEGORY, AI_TOOL_CATEGORIES } from "@/lib/constants";
import { SkillChips } from "./SkillChips";

const NO_EXPERIENCE_OPTION =
  "I have no experience with AI tools (That's OK!)" as const;

interface AiToolsSelectorProps {
  selectedTools: string[];
  onChange: (tools: string[]) => void;
}

export function AiToolsSelector({
  selectedTools,
  onChange,
}: AiToolsSelectorProps) {
  const noExpSelected = selectedTools.includes(NO_EXPERIENCE_OPTION);

  const handleChange = (
    category: (typeof AI_TOOL_CATEGORIES)[number],
    newCategorySelection: string[]
  ) => {
    const categoryToolSet = new Set(
      AI_TOOLS_BY_CATEGORY[category] as readonly string[]
    );

    // Start with current selections minus this category's tools and minus "no experience"
    const otherSelections = selectedTools.filter(
      (t) => !categoryToolSet.has(t) && t !== NO_EXPERIENCE_OPTION
    );

    onChange([...otherSelections, ...newCategorySelection]);
  };

  const handleNoExperience = () => {
    if (noExpSelected) {
      // Deselect it
      onChange([]);
    } else {
      // Select it, clear everything else
      onChange([NO_EXPERIENCE_OPTION]);
    }
  };

  return (
    <div className="space-y-6">
      {AI_TOOL_CATEGORIES.map((category) => {
        const tools = AI_TOOLS_BY_CATEGORY[category];
        const categorySelected = selectedTools.filter((t) =>
          (tools as readonly string[]).includes(t)
        );

        return (
          <div key={category}>
            <h4 className="text-sm font-semibold text-white/80 mb-2">
              {category}
            </h4>
            <SkillChips
              skills={tools}
              selectedSkills={categorySelected}
              onChange={(newSelection) => handleChange(category, newSelection)}
              disabledSkills={noExpSelected ? [...tools] : []}
            />
          </div>
        );
      })}

      <div>
        <h4 className="text-sm font-semibold text-white/80 mb-2">
          No Experience
        </h4>
        <button
          type="button"
          onClick={handleNoExperience}
          className={
            noExpSelected
              ? "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 bg-[#006241] text-white border-[#006241] shadow-sm"
              : "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 bg-white text-gray-700 border-gray-300 hover:border-[#006241] hover:text-[#006241] cursor-pointer"
          }
        >
          {NO_EXPERIENCE_OPTION}
        </button>
      </div>
    </div>
  );
}

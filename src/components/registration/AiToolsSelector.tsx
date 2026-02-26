"use client";

import { AI_TOOLS_EXPERIENCE } from "@/lib/constants";
import { SkillChips } from "./SkillChips";

interface AiToolsSelectorProps {
  selectedTools: string[];
  onChange: (tools: string[]) => void;
}

export function AiToolsSelector({
  selectedTools,
  onChange,
}: AiToolsSelectorProps) {
  const handleChange = (
    categoryId: string,
    newCategorySelection: string[]
  ) => {
    const category = AI_TOOLS_EXPERIENCE.find((c) => c.id === categoryId);
    if (!category) return;

    const categoryToolIds = new Set<string>(category.tools.map((t) => t.id));

    // Start with current selections minus this category's tools
    const otherSelections = selectedTools.filter(
      (t) => !categoryToolIds.has(t)
    );

    onChange([...otherSelections, ...newCategorySelection]);
  };

  return (
    <div className="space-y-6">
      {AI_TOOLS_EXPERIENCE.map((category) => {
        const toolLabels: string[] = category.tools.map((t) => t.id);
        const categorySelected = selectedTools.filter((t) =>
          toolLabels.includes(t)
        );

        return (
          <div key={category.id}>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {category.label}
            </h4>
            <SkillChips
              skills={category.tools.map((t) => t.id)}
              selectedSkills={categorySelected}
              onChange={(newSelection) => handleChange(category.id, newSelection)}
              labels={Object.fromEntries(category.tools.map((t) => [t.id, t.label]))}
            />
          </div>
        );
      })}
    </div>
  );
}

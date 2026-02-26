"use client";

import { AI_TOOLS_EXPERIENCE } from "@/lib/constants";

interface AiToolsSelectorProps {
  selectedCategories: string[];
  selectedTools: string[];
  onChange: (categories: string[], tools: string[]) => void;
}

export function AiToolsSelector({
  selectedCategories,
  selectedTools,
  onChange,
}: AiToolsSelectorProps) {
  const noExperience =
    selectedCategories.length === 0 && selectedTools.length === 0;

  const handleCategoryToggle = (categoryId: string) => {
    const isChecked = selectedCategories.includes(categoryId);

    if (isChecked) {
      // Uncheck category: remove it and deselect all its tools
      const category = AI_TOOLS_EXPERIENCE.find((c) => c.id === categoryId);
      const categoryToolIds = new Set<string>(category?.tools.map((t) => t.id) ?? []);
      onChange(
        selectedCategories.filter((id) => id !== categoryId),
        selectedTools.filter((id) => !categoryToolIds.has(id))
      );
    } else {
      // Check category: add it, tools start unchecked
      onChange([...selectedCategories, categoryId], selectedTools);
    }
  };

  const handleToolToggle = (categoryId: string, toolId: string) => {
    if (!selectedCategories.includes(categoryId)) return;

    if (selectedTools.includes(toolId)) {
      onChange(selectedCategories, selectedTools.filter((id) => id !== toolId));
    } else {
      onChange(selectedCategories, [...selectedTools, toolId]);
    }
  };

  const handleNoExperience = () => {
    if (noExperience) {
      // Already in "no experience" state — uncheck does nothing special (empty selection)
      return;
    }
    // Clear everything
    onChange([], []);
  };

  return (
    <div className="space-y-3">
      {AI_TOOLS_EXPERIENCE.map((category) => {
        const isExpanded = selectedCategories.includes(category.id);

        return (
          <div key={category.id}>
            {/* Category checkbox */}
            <label
              className="flex items-center gap-3 cursor-pointer group"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCategoryToggle(category.id);
                }
              }}
            >
              <input
                type="checkbox"
                checked={isExpanded}
                onChange={() => handleCategoryToggle(category.id)}
                className="h-4 w-4 rounded border-gray-300 text-[#006241] focus:ring-[#006241]"
              />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {category.label}
              </span>
            </label>

            {/* Nested tools — shown when category is checked */}
            {isExpanded && (
              <div className="ml-7 mt-2 space-y-2">
                {category.tools.map((tool) => (
                  <label
                    key={tool.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleToolToggle(category.id, tool.id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.id)}
                      onChange={() => handleToolToggle(category.id, tool.id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#006241] focus:ring-[#006241]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      {tool.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* No experience option */}
      <div className="pt-2 border-t border-gray-200">
        <label
          className="flex items-center gap-3 cursor-pointer group"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleNoExperience();
            }
          }}
        >
          <input
            type="checkbox"
            checked={noExperience}
            onChange={handleNoExperience}
            className="h-4 w-4 rounded border-gray-300 text-[#006241] focus:ring-[#006241]"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            I have no experience with AI tools
          </span>
        </label>
      </div>
    </div>
  );
}

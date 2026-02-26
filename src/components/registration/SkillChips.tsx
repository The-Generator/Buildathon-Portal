"use client";

import { cn } from "@/lib/utils";

interface SkillChipsProps {
  skills: readonly string[];
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  disabledSkills?: string[];
  labels?: Record<string, string>;
}

export function SkillChips({
  skills,
  selectedSkills,
  onChange,
  disabledSkills = [],
  labels,
}: SkillChipsProps) {
  const toggleSkill = (skill: string) => {
    if (disabledSkills.includes(skill)) return;
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => {
        const isSelected = selectedSkills.includes(skill);
        const isDisabled = disabledSkills.includes(skill);

        return (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            disabled={isDisabled}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
              isDisabled
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                : isSelected
                  ? "bg-[#006241] text-white border-[#006241] shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#006241] hover:text-[#006241] cursor-pointer"
            )}
          >
            {labels?.[skill] ?? skill}
          </button>
        );
      })}
    </div>
  );
}

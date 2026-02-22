"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SkillChips } from "./SkillChips";
import { SPECIFIC_SKILLS } from "@/lib/constants";
import { stepTeamSkillsSchema } from "@/lib/validations";
import type { RegistrationFormData } from "@/types";

interface StepTeamSkillsProps {
  data: RegistrationFormData;
  onChange: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTeamSkills({
  data,
  onChange,
  onNext,
  onBack,
}: StepTeamSkillsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = stepTeamSkillsSchema.safeParse({
      tagged_team_skills: data.tagged_team_skills,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  // Combine user's own skills with their additional selections for display
  const allSelected = [
    ...new Set([...(data.specific_skills ?? []), ...data.tagged_team_skills]),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          What skills does your ideal team have?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select the skills you would like your teammates to bring. This helps
          our matching algorithm build balanced, complementary teams.
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          Your own skills are pre-selected and shown below. Choose additional
          skills you would like your team to have.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Desired Team Skills *
        </label>
        <SkillChips
          skills={SPECIFIC_SKILLS}
          selectedSkills={allSelected}
          onChange={(skills) => {
            // The user's own skills are disabled so they won't be toggled off.
            // Any new toggle is a team skill.
            const teamSkills = skills.filter(
              (s) => !(data.specific_skills ?? []).includes(s)
            );
            // Also keep any of the user's own skills that are in tagged_team_skills
            const ownSkillsInTeam = data.tagged_team_skills.filter((s) =>
              (data.specific_skills ?? []).includes(s)
            );
            onChange({
              tagged_team_skills: [...new Set([...ownSkillsInTeam, ...teamSkills])],
            });
          }}
          disabledSkills={data.specific_skills ?? []}
        />
        {errors.tagged_team_skills && (
          <p className="mt-2 text-sm text-red-600">
            {errors.tagged_team_skills}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Review
        </Button>
      </div>
    </div>
  );
}

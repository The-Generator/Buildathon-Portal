"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RoleSelector } from "./RoleSelector";
import { SkillChips } from "./SkillChips";
import { AiToolsSelector } from "./AiToolsSelector";
import {
  PRIMARY_ROLES,
  SPECIFIC_SKILLS,
  EXPERIENCE_LEVELS,
  SCHOOLS,
  YEARS,
} from "@/lib/constants";
import { stepPersonalInfoSchema } from "@/lib/validations";
import type { RegistrationFormData } from "@/types";

interface StepPersonalInfoProps {
  data: RegistrationFormData;
  onChange: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
}

export function StepPersonalInfo({
  data,
  onChange,
  onNext,
}: StepPersonalInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = stepPersonalInfoSchema.safeParse({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      school: data.school,
      school_other: data.school_other,
      year: data.year,
      dietary_restrictions: data.dietary_restrictions,
      primary_role: data.primary_role,
      specific_skills: data.specific_skills,
      experience_level: data.experience_level,
      ai_tools: data.ai_tools,
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about yourself so we can get you set up.
        </p>
      </div>

      {/* Name, Email, Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="full_name"
          label="Full Name *"
          placeholder="Jane Doe"
          value={data.full_name}
          onChange={(e) => onChange({ full_name: e.target.value })}
          error={errors.full_name}
        />
        <Input
          id="email"
          label="Email *"
          type="email"
          placeholder="jane@babson.edu"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          error={errors.email}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="phone"
          label="Phone *"
          type="tel"
          placeholder="(555) 123-4567"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          error={errors.phone}
        />
      </div>

      {/* School + Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="school"
          label="School *"
          placeholder="Select your school"
          value={data.school}
          onChange={(e) => {
            onChange({ school: e.target.value, school_other: "" });
          }}
          options={SCHOOLS.map((s) => ({ value: s, label: s }))}
          error={errors.school}
        />
        {data.school === "Other" && (
          <Input
            id="school_other"
            label="Your School *"
            placeholder="Enter your school name"
            value={data.school_other || ""}
            onChange={(e) => onChange({ school_other: e.target.value })}
            error={errors.school_other}
          />
        )}
        <Select
          id="year"
          label="Year *"
          placeholder="Select your year"
          value={data.year}
          onChange={(e) => onChange({ year: e.target.value })}
          options={YEARS.map((y) => ({ value: y, label: y }))}
          error={errors.year}
        />
      </div>

      {/* Dietary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="dietary_restrictions"
          label="Dietary Restrictions"
          placeholder="e.g., Vegetarian, Gluten-free"
          value={data.dietary_restrictions || ""}
          onChange={(e) => onChange({ dietary_restrictions: e.target.value })}
        />
      </div>

      {/* Primary Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Role *
        </label>
        <RoleSelector
          roles={PRIMARY_ROLES}
          selectedRole={data.primary_role ?? ""}
          onChange={(role) => onChange({ primary_role: role })}
        />
        {errors.primary_role && (
          <p className="mt-1 text-sm text-red-600">{errors.primary_role}</p>
        )}
      </div>

      {/* Specific Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Skills * <span className="text-gray-400 font-normal">(select all that apply)</span>
        </label>
        <SkillChips
          skills={SPECIFIC_SKILLS}
          selectedSkills={data.specific_skills ?? []}
          onChange={(skills) => onChange({ specific_skills: skills })}
        />
        {errors.specific_skills && (
          <p className="mt-1 text-sm text-red-600">{errors.specific_skills}</p>
        )}
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hackathon Experience *
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                data.experience_level === level
                  ? "border-[#006241] bg-[#006241]/5 text-[#006241]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="experience_level"
                value={level}
                checked={data.experience_level === level}
                onChange={(e) => onChange({ experience_level: e.target.value })}
                className="sr-only"
              />
              <div
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  data.experience_level === level
                    ? "border-[#006241]"
                    : "border-gray-300"
                }`}
              >
                {data.experience_level === level && (
                  <div className="h-2 w-2 rounded-full bg-[#006241]" />
                )}
              </div>
              <span className="text-sm font-medium">{level}</span>
            </label>
          ))}
        </div>
        {errors.experience_level && (
          <p className="mt-1 text-sm text-red-600">{errors.experience_level}</p>
        )}
      </div>

      {/* AI Tools */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Tools Experience <span className="text-gray-400 font-normal">(select all that apply)</span>
        </label>
        <AiToolsSelector
          selectedTools={data.ai_tools ?? []}
          onChange={(tools) => onChange({ ai_tools: tools })}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} size="lg">
          Next Step
        </Button>
      </div>
    </div>
  );
}

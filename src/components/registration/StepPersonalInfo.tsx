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
  const [profileOpen, setProfileOpen] = useState(false);

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
      linkedin_url: data.linkedin_url || "",
      portfolio_url: data.portfolio_url || "",
      bio: data.bio || "",
      profile_visible: data.profile_visible ?? false,
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

      {/* Public Profile (Optional) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setProfileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            Public Profile <span className="text-gray-400 font-normal">(Optional)</span>
          </span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {profileOpen && (
          <div className="px-4 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="linkedin_url"
                label="LinkedIn URL"
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                value={data.linkedin_url || ""}
                onChange={(e) => onChange({ linkedin_url: e.target.value })}
                error={errors.linkedin_url}
              />
              <Input
                id="portfolio_url"
                label="Portfolio URL"
                type="url"
                placeholder="https://yourportfolio.com"
                value={data.portfolio_url || ""}
                onChange={(e) => onChange({ portfolio_url: e.target.value })}
                error={errors.portfolio_url}
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Short Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                maxLength={280}
                placeholder="A quick intro about yourself (280 chars max)"
                value={data.bio || ""}
                onChange={(e) => onChange({ bio: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241] resize-none"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {(data.bio || "").length}/280
              </p>
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.profile_visible ?? false}
                onChange={(e) => onChange({ profile_visible: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[#006241] focus:ring-[#006241]"
              />
              <span className="text-sm text-gray-700">
                Show my profile to other participants
              </span>
            </label>
          </div>
        )}
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

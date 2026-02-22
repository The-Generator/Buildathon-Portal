"use client";

import { useState } from "react";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { StepPersonalInfo } from "@/components/registration/StepPersonalInfo";
import { StepTeamSetup } from "@/components/registration/StepTeamSetup";
import { StepTeamSkills } from "@/components/registration/StepTeamSkills";
import { StepReview } from "@/components/registration/StepReview";
import type { RegistrationFormData } from "@/types";

const STEPS = ["Personal Info", "Team Setup", "Team Skills", "Review"];

const INITIAL_FORM_DATA: RegistrationFormData = {
  full_name: "",
  email: "",
  phone: "",
  school: "",
  school_other: "",
  year: "",
  dietary_restrictions: "",
  primary_role: "",
  specific_skills: [],
  experience_level: "",
  ai_tools: [],
  team_option: "solo",
  teammates: [],
  tagged_team_skills: [],
};

interface RegistrationWizardProps {
  participantCapacityFull?: boolean;
}

export function RegistrationWizard({
  participantCapacityFull = false,
}: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] =
    useState<RegistrationFormData>(INITIAL_FORM_DATA);

  const updateFormData = (partial: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const isSpectator = formData.team_option === "spectator";

  const goNext = () => {
    setCurrentStep((prev) => {
      // Spectator on Team Setup (step 1) -> skip Team Skills (step 2) -> go to Review (step 3)
      if (isSpectator && prev === 1) return 3;
      return Math.min(prev + 1, STEPS.length - 1);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setCurrentStep((prev) => {
      // Spectator on Review (step 3) -> skip Team Skills (step 2) -> go to Team Setup (step 1)
      if (isSpectator && prev === 3) return 1;
      return Math.max(prev - 1, 0);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (participantCapacityFull && formData.team_option !== "spectator") {
      throw new Error(
        "Participant registration is full. Spectator registration is still open."
      );
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.error || `Registration failed (${res.status})`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Register for Build-a-thon 2026
          </h1>
          <p className="mt-2 text-gray-500">
            April 11, 2026 &middot; Babson College
          </p>
        </div>

        {participantCapacityFull && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Participant registration is currently full. Spectator registration
            remains open.
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-10">
          <ProgressSteps steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {currentStep === 0 && (
            <StepPersonalInfo
              data={formData}
              onChange={updateFormData}
              onNext={goNext}
            />
          )}
          {currentStep === 1 && (
            <StepTeamSetup
              data={formData}
              onChange={updateFormData}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 2 && (
            <StepTeamSkills
              data={formData}
              onChange={updateFormData}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepReview
              data={formData}
              onBack={goBack}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

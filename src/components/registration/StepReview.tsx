"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RegistrationFormData } from "@/types";

interface StepReviewProps {
  data: RegistrationFormData;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-gray-900 mb-3">{children}</h3>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#006241]/10 text-[#006241] border border-[#006241]/20"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function StepReview({ data, onBack, onSubmit }: StepReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit();
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="text-6xl">&#127881;</div>
        <h2 className="text-3xl font-bold text-gray-900">
          You are registered!
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          We have sent a confirmation email to{" "}
          <span className="font-semibold text-[#006241]">{data.email}</span>.
          See you at the Build-a-thon!
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 text-base bg-[#006241] text-white hover:bg-[#004d33] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const schoolDisplay =
    data.school === "Other" ? data.school_other || "Other" : data.school;

  const isSpectator = data.team_option === "spectator";

  const teamOptionLabels: Record<string, string> = {
    partial_team: "I have teammates (group of 2-3)",
    solo: "Solo (entering matching pool)",
    spectator: "Spectator",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Registration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review all your information before submitting.
        </p>
      </div>

      {/* Personal Info */}
      <div className="p-5 bg-gray-50 rounded-xl space-y-3">
        <SectionLabel>Personal Information</SectionLabel>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Full Name" value={data.full_name} />
          <Field label="Email" value={data.email} />
          <Field label="Phone" value={data.phone} />
          <Field label="School" value={schoolDisplay} />
          <Field label="Year" value={data.year} />
          <Field
            label="Dietary Restrictions"
            value={data.dietary_restrictions || "None"}
          />
          <Field label="Primary Role" value={data.primary_role} />
          <Field label="Experience" value={data.experience_level} />
        </dl>
        <div className="pt-1">
          <dt className="text-sm text-gray-500 mb-1.5">Your Skills</dt>
          <Chips items={data.specific_skills ?? []} />
        </div>
        {data.ai_tools_used && data.ai_tools_used.length > 0 && (
          <div className="pt-1">
            <dt className="text-sm text-gray-500 mb-1.5">AI Tools Used</dt>
            <Chips items={data.ai_tools_used} />
          </div>
        )}
      </div>

      {/* Registration Type (spectator) */}
      {isSpectator && (
        <div className="p-5 bg-amber-50 rounded-xl space-y-3">
          <SectionLabel>Registration Type</SectionLabel>
          <Field label="Type" value="Spectator" />
          <p className="text-sm text-gray-500">
            You are registering as a spectator. You will not be placed on a team.
          </p>
        </div>
      )}

      {/* Team Setup (hidden for spectator) */}
      {!isSpectator && (
        <div className="p-5 bg-gray-50 rounded-xl space-y-3">
          <SectionLabel>Team Setup</SectionLabel>
          <Field
            label="Team Option"
            value={teamOptionLabels[data.team_option]}
          />
          {data.teammates.length > 0 && (
            <div>
              <dt className="text-sm text-gray-500 mb-2">Teammates</dt>
              <div className="space-y-2">
                {data.teammates.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#006241]/10 flex items-center justify-center text-xs font-semibold text-[#006241]">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Summary (hidden for spectator) */}
      {!isSpectator && (
        <div className="p-5 bg-gray-50 rounded-xl space-y-3">
          <SectionLabel>Desired Team Skills</SectionLabel>
          {data.tagged_team_skills.length > 0 ? (
            <Chips items={data.tagged_team_skills} />
          ) : (
            <p className="text-sm text-gray-500">No additional team skills selected</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Registration"
          )}
        </Button>
      </div>
    </div>
  );
}

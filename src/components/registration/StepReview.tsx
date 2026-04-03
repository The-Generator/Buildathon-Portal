"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AI_TOOLS_EXPERIENCE } from "@/lib/constants";
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
    const handleSavePDF = () => {
      const teamLabel =
        data.team_option === "spectator"
          ? "Spectator"
          : data.team_option === "solo"
            ? "Solo — you'll be matched with a team"
            : `Group of ${data.teammates.length + 1}`;
      const html = `<!DOCTYPE html>
<html><head><title>Build-a-thon 2026 — Registration Confirmation</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 560px; margin: 40px auto; color: #111827; }
  .header { background: #0a0f0d; color: #fff; padding: 28px 32px; text-align: center; border-radius: 12px 12px 0 0; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 4px 0 0; color: #34d399; font-size: 13px; }
  .banner { background: #ecfdf5; border-bottom: 1px solid #d1fae5; padding: 24px; text-align: center; }
  .banner h2 { color: #065f46; margin: 0; font-size: 24px; }
  .content { padding: 28px 32px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 16px 0; }
  .card-label { color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; margin: 0 0 14px; }
  .detail-row { margin: 8px 0; font-size: 14px; }
  .detail-label { color: #6b7280; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 12px 12px; }
  @media print { body { margin: 0; } }
</style></head><body>
<div class="header"><h1>Build-a-thon 2026</h1><p>AI x Body &amp; Mind</p></div>
<div class="banner"><h2>Registration Confirmed</h2></div>
<div class="content">
  <p>Hi ${data.full_name},</p>
  <p>Thank you for registering for Babson Generator Build-a-thon 2026!</p>
  <div class="card">
    <p class="card-label">EVENT DETAILS</p>
    <div class="detail-row">📅 Saturday, April 11, 2026</div>
    <div class="detail-row">🕗 8:00 AM – 8:30 PM ET</div>
    <div class="detail-row">📍 Knight Auditorium, Babson College<br><span class="detail-label">231 Forest St, Wellesley, MA 02457</span></div>
  </div>
  <div class="card">
    <p class="card-label">REGISTRATION STATUS</p>
    <p>${teamLabel}</p>
  </div>
  <hr>
  <p style="color:#6b7280;font-size:13px;text-align:center;">Questions? Email alaraia1@babson.edu</p>
</div>
<div class="footer">Babson Generator · Build-a-thon 2026<br>231 Forest St, Wellesley, MA 02457</div>
</body></html>`;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.onload = () => w.print();
      }
    };

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
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          The email may take up to 5 minutes to arrive.{" "}
          <strong className="text-gray-600">
            Check your spam or junk folder if you don&apos;t see it.
          </strong>
        </p>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          You can re-register anytime using the same email, name, or phone
          number — it will replace your previous entry.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleSavePDF}
            className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 text-base border border-[#006241] text-[#006241] hover:bg-[#006241]/5 transition-colors"
          >
            Save Confirmation as PDF
          </button>
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
        {data.ai_tools && data.ai_tools.length > 0 && (
          <div className="pt-1">
            <dt className="text-sm text-gray-500 mb-1.5">AI Tools Experience</dt>
            <div className="space-y-2">
              {AI_TOOLS_EXPERIENCE.filter((cat) =>
                data.ai_tools.includes(cat.id)
              ).map((cat) => {
                const toolsInCategory = cat.tools.filter(
                  (t) => data.ai_tools_used?.includes(t.id)
                );
                return (
                  <div key={cat.id}>
                    <span className="text-sm font-medium text-gray-900">
                      {cat.label}
                    </span>
                    {toolsInCategory.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {toolsInCategory.map((tool) => (
                          <span
                            key={tool.id}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#006241]/10 text-[#006241] border border-[#006241]/20"
                          >
                            {tool.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

      {/* Contact */}
      <p className="text-sm text-gray-500">
        Questions? Reach out to{" "}
        <a href="mailto:alaraia1@babson.edu" className="font-medium text-[#006241] underline">
          alaraia1@babson.edu
        </a>
      </p>

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

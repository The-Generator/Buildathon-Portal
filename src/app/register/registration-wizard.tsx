"use client";

import { useState } from "react";
import Link from "next/link";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { StepPersonalInfo } from "@/components/registration/StepPersonalInfo";
import { StepTeamSetup } from "@/components/registration/StepTeamSetup";
import { StepTeamSkills } from "@/components/registration/StepTeamSkills";
import { StepReview } from "@/components/registration/StepReview";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
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
  ai_tools_used: [],
  team_option: "solo",
  teammates: [],
  tagged_team_skills: [],
};

interface DuplicateInfo {
  email: string;
  existingName: string;
  isTeamAssigned: boolean;
}

interface RegistrationWizardProps {
  participantCapacityFull?: boolean;
}

export function RegistrationWizard({
  participantCapacityFull = false,
}: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] =
    useState<RegistrationFormData>(INITIAL_FORM_DATA);

  // Duplicate replacement flow state
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo[] | null>(
    null
  );
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceSuccess, setReplaceSuccess] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

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

    if (res.status === 409) {
      const body = await res.json();
      if (body.teamAssigned) {
        throw new Error(
          "One or more existing registrations have already been assigned to a team. Please contact an organizer to update your registration."
        );
      }
      if (body.duplicates) {
        setDuplicateInfo(body.duplicateEmails);
        throw new Error(
          "An existing registration was found for one or more emails. Please confirm if you'd like to replace it."
        );
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      let message = body?.error || `Registration failed (${res.status})`;
      if (body?.details?.fieldErrors) {
        const fields = Object.entries(body.details.fieldErrors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join("; ");
        message += ` (${fields})`;
      }
      throw new Error(message);
    }
  };

  const handleConfirmReplace = async () => {
    setReplaceError(null);
    setIsReplacing(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, replaceExisting: true }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error || "Failed to replace registration. Please try again."
        );
      }

      setDuplicateInfo(null);
      setReplaceSuccess(true);
    } catch (err) {
      setReplaceError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsReplacing(false);
    }
  };

  // Show success screen after a confirmed replacement
  if (replaceSuccess) {
    const handleSavePDF = () => {
      const teamLabel =
        formData.team_option === "spectator"
          ? "Spectator"
          : formData.team_option === "solo"
            ? "Solo — you'll be matched with a team"
            : `Group of ${formData.teammates.length + 1}`;
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
  <p>Hi ${formData.full_name},</p>
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="text-center py-16 space-y-6">
              <div className="text-6xl">&#127881;</div>
              <h2 className="text-3xl font-bold text-gray-900">
                Registration Updated!
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Your previous registration has been replaced. A new confirmation
                email has been sent to{" "}
                <span className="font-semibold text-[#006241]">
                  {formData.email}
                </span>
                . See you at the Build-a-thon!
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
          </div>
        </div>
      </div>
    );
  }

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

      {/* Duplicate registration confirmation modal */}
      <Modal
        open={!!duplicateInfo}
        onClose={() => setDuplicateInfo(null)}
        title="Existing Registration Found"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            We found existing registrations for the following email
            {duplicateInfo && duplicateInfo.length > 1 ? "s" : ""}:
          </p>
          <div className="space-y-2">
            {duplicateInfo?.map((dup) => (
              <div
                key={dup.email}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {dup.existingName}
                  </p>
                  <p className="text-xs text-gray-500">{dup.email}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              Resubmitting will replace the existing registration
              {duplicateInfo && duplicateInfo.length > 1 ? "s" : ""} with your
              new submission. This action cannot be undone.
            </p>
          </div>

          {replaceError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{replaceError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDuplicateInfo(null);
                setReplaceError(null);
              }}
              disabled={isReplacing}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmReplace} disabled={isReplacing}>
              {isReplacing ? "Replacing..." : "Replace and Register"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

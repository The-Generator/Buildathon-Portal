"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TEAM_OPTIONS } from "@/lib/constants";
import { stepTeamSetupSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { Users, UserPlus, User, Eye, Plus, Trash2 } from "lucide-react";
import type { RegistrationFormData } from "@/types";

const TEAM_ICONS: Record<string, React.ElementType> = {
  full_team: Users,
  partial_team: UserPlus,
  solo: User,
  spectator: Eye,
};

interface StepTeamSetupProps {
  data: RegistrationFormData;
  onChange: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTeamSetup({
  data,
  onChange,
  onNext,
  onBack,
}: StepTeamSetupProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOptionChange = (option: RegistrationFormData["team_option"]) => {
    let teammates: { full_name: string; email: string }[] = [];
    if (option === "full_team") {
      teammates = Array.from({ length: 4 }, () => ({
        full_name: "",
        email: "",
      }));
    } else if (option === "partial_team") {
      teammates = [{ full_name: "", email: "" }];
    }
    onChange({ team_option: option, teammates });
    setErrors({});
  };

  const updateTeammate = (
    index: number,
    field: "full_name" | "email",
    value: string
  ) => {
    const updated = [...data.teammates];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ teammates: updated });
  };

  const addTeammate = () => {
    if (data.teammates.length < 3) {
      onChange({
        teammates: [...data.teammates, { full_name: "", email: "" }],
      });
    }
  };

  const removeTeammate = (index: number) => {
    if (data.teammates.length > 1) {
      onChange({
        teammates: data.teammates.filter((_, i) => i !== index),
      });
    }
  };

  const handleNext = () => {
    const noTeammates = data.team_option === "solo" || data.team_option === "spectator";
    const result = stepTeamSetupSchema.safeParse({
      team_option: data.team_option,
      teammates: noTeammates ? [] : data.teammates,
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

    if (noTeammates) {
      onChange({ teammates: [] });
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Setup</h2>
        <p className="mt-1 text-sm text-gray-500">
          How would you like to participate? Teams are 5 people total.
        </p>
      </div>

      {/* Team Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {TEAM_OPTIONS.map((option) => {
          const isSelected = data.team_option === option.value;
          const Icon = TEAM_ICONS[option.value] || User;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionChange(option.value)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 text-center",
                isSelected
                  ? "border-[#006241] bg-[#006241]/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-[#006241]/40 hover:shadow-sm"
              )}
            >
              <Icon
                className={cn(
                  "h-8 w-8",
                  isSelected ? "text-[#006241]" : "text-gray-400"
                )}
              />
              <div>
                <p
                  className={cn(
                    "font-semibold text-base",
                    isSelected ? "text-[#006241]" : "text-gray-800"
                  )}
                >
                  {option.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {errors.team_option && (
        <p className="text-sm text-red-600">{errors.team_option}</p>
      )}

      {/* Teammate Inputs */}
      {data.team_option === "full_team" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Your 4 Teammates
          </h3>
          {data.teammates.map((teammate, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <Input
                id={`teammate-${index}-name`}
                label={`Teammate ${index + 1} Name *`}
                placeholder="Full name"
                value={teammate.full_name}
                onChange={(e) =>
                  updateTeammate(index, "full_name", e.target.value)
                }
                error={errors[`teammates.${index}.full_name`]}
              />
              <Input
                id={`teammate-${index}-email`}
                label={`Teammate ${index + 1} Email *`}
                type="email"
                placeholder="teammate@school.edu"
                value={teammate.email}
                onChange={(e) =>
                  updateTeammate(index, "email", e.target.value)
                }
                error={errors[`teammates.${index}.email`]}
              />
            </div>
          ))}
        </div>
      )}

      {data.team_option === "partial_team" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Your Teammates
          </h3>
          {data.teammates.map((teammate, index) => (
            <div
              key={index}
              className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <Input
                  id={`teammate-${index}-name`}
                  label={`Teammate ${index + 1} Name *`}
                  placeholder="Full name"
                  value={teammate.full_name}
                  onChange={(e) =>
                    updateTeammate(index, "full_name", e.target.value)
                  }
                  error={errors[`teammates.${index}.full_name`]}
                />
                <Input
                  id={`teammate-${index}-email`}
                  label={`Teammate ${index + 1} Email *`}
                  type="email"
                  placeholder="teammate@school.edu"
                  value={teammate.email}
                  onChange={(e) =>
                    updateTeammate(index, "email", e.target.value)
                  }
                  error={errors[`teammates.${index}.email`]}
                />
              </div>
              {data.teammates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTeammate(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-1"
                  aria-label="Remove teammate"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {data.teammates.length < 3 && (
            <button
              type="button"
              onClick={addTeammate}
              className="flex items-center gap-2 text-sm font-medium text-[#006241] hover:text-[#004d33] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add another teammate
            </button>
          )}
        </div>
      )}

      {data.team_option === "solo" && (
        <div className="p-6 bg-[#006241]/5 rounded-xl border border-[#006241]/20 text-center">
          <p className="text-[#006241] font-medium">
            No worries -- we will match you with a great team!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Our matching algorithm considers your skills and preferences.
          </p>
        </div>
      )}

      {data.team_option === "spectator" && (
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
          <p className="text-amber-800 font-medium">
            You are registering as a spectator.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Spectators will not be placed on a team. You can still attend workshops and ceremonies.
          </p>
        </div>
      )}

      {errors.teammates && (
        <p className="text-sm text-red-600">{errors.teammates}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Next Step
        </Button>
      </div>
    </div>
  );
}

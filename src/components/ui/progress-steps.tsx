import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <nav className="flex items-center justify-center">
      <ol className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step} className="flex items-center">
              {index > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-6 sm:w-12 mx-1 sm:mx-2",
                    isCompleted ? "bg-[#006241]" : "bg-gray-200"
                  )}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-[#006241] text-white"
                      : isCurrent
                        ? "border-2 border-[#006241] text-[#006241]"
                        : "border-2 border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "hidden sm:block text-sm",
                    isCurrent
                      ? "font-medium text-gray-900"
                      : isCompleted
                        ? "text-gray-600"
                        : "text-gray-400"
                  )}
                >
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  className?: string;
}

export function Wizard({ steps, onComplete, className }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Progress indicator */}
      <nav className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium",
                  index < currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="mt-1 hidden text-xs sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-12 sm:w-20",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step content */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
        {steps[currentStep].description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        )}
        <div className="mt-6">{steps[currentStep].content}</div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          onClick={() => {
            if (isLastStep) {
              onComplete();
            } else {
              setCurrentStep((s) => s + 1);
            }
          }}
        >
          {isLastStep ? "Complete" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

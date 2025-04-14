
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: {
    id: number;
    name: string;
  }[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex space-x-2 md:space-x-8">
          {steps.map((step) => (
            <li key={step.id} className="flex-1">
              <div className="group flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium",
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    currentStep >= step.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default StepIndicator;

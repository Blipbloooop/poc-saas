import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  labels: string[];
  currentStep: number;
}

export function Stepper({ labels, currentStep }: StepperProps) {
  return (
    <div className="flex w-full max-w-[420px] items-center">
      {labels.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={label} className="relative flex flex-1 flex-col items-center gap-2">
            {i > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full",
                  done || active ? "bg-success" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-bold",
                done && "border-success bg-success text-white",
                active && "border-primary bg-primary text-white",
                !done && !active && "border-border-strong bg-white text-faint"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-center text-xs font-semibold",
                active ? "text-secondary" : "text-faint"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;

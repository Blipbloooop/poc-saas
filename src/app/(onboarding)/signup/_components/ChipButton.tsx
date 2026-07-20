import { cn } from "@/lib/utils";

interface ChipButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function ChipButton({ label, selected, onClick, className }: ChipButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
        selected
          ? "border-primary bg-primary-light text-warning-text"
          : "border-border-strong bg-white text-body hover:border-primary",
        className
      )}
    >
      {label}
    </button>
  );
}

export default ChipButton;

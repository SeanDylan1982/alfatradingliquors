import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex h-12 items-center rounded-full border border-input bg-card px-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 rounded-full"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 rounded-full"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

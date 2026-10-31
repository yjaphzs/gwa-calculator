"use client";

import { CheckIcon } from "lucide-react";

import { oklchToHex } from "@/features/appearance/lib/color";
import { deriveDark, deriveLight } from "@/features/appearance/lib/derive-scheme";
import { CUSTOM_SCHEME, SCHEME_PRESETS } from "@/features/appearance/lib/schemes";
import { cn } from "@/lib/utils";

// Each swatch shows the scheme's accent in light mode and in dark mode, side by side.
const SWATCHES = SCHEME_PRESETS.map((preset) => ({
  id: preset.id,
  label: preset.label,
  light: oklchToHex(deriveLight(preset.light).primary),
  dark: oklchToHex(deriveDark(preset.dark).primary),
}));

interface SchemeSwatchesProps {
  value: string;
  /** The custom accent, shown on the Custom swatch. */
  accent?: string;
  onSelect: (scheme: string) => void;
}

function Swatch({ active, label, background, onClick }: { active: boolean; label: string; background: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 rounded-lg p-1 text-xs font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span
        className={cn(
          "relative flex size-11 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow",
          active ? "ring-2 ring-foreground" : "ring-1 ring-border group-hover:ring-foreground/40",
        )}
        style={{ background }}
      >
        {active && (
          <span className="flex size-5 items-center justify-center rounded-full bg-background text-foreground shadow">
            <CheckIcon className="size-3.5" />
          </span>
        )}
      </span>
      <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </button>
  );
}

/** The pre-made schemes plus Custom, as a grid of color swatches. */
export function SchemeSwatches({ value, accent, onSelect }: SchemeSwatchesProps) {
  return (
    <div role="group" aria-label="Color scheme" className="grid grid-cols-5 gap-x-1 gap-y-3 sm:grid-cols-9">
      {SWATCHES.map((swatch) => (
        <Swatch
          key={swatch.id}
          active={value === swatch.id}
          label={swatch.label}
          background={`linear-gradient(135deg, ${swatch.light} 50%, ${swatch.dark} 50%)`}
          onClick={() => onSelect(swatch.id)}
        />
      ))}
      <Swatch
        active={value === CUSTOM_SCHEME}
        label="Custom"
        background={
          value === CUSTOM_SCHEME && accent
            ? accent
            : "conic-gradient(from 0deg, #f43f5e, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #f43f5e)"
        }
        onClick={() => onSelect(CUSTOM_SCHEME)}
      />
    </div>
  );
}

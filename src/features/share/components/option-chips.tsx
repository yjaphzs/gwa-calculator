"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Option<T extends string | number> {
  value: T;
  label: ReactNode;
  /** Accessible name when the label is only an emoji or a swatch. */
  name?: string;
}

interface OptionChipsProps<T extends string | number> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

/** A labelled row of pill buttons acting as one choice. */
export function OptionChips<T extends string | number>({ label, value, options, onChange }: OptionChipsProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={option.value === value}
            aria-label={option.name}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
              option.value === value ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

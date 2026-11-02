"use client";

import { useEffect, useRef, type ReactNode } from "react";

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

// Phones: one row that swipes sideways (fading at the edge) instead of wrapping to several lines.
const PHONE_ROW =
  "max-md:flex-nowrap max-md:snap-x max-md:overflow-x-auto max-md:pb-1 max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] max-md:[scrollbar-width:none] max-md:pr-7";

/** A labelled row of pill buttons acting as one choice. */
export function OptionChips<T extends string | number>({ label, value, options, onChange }: OptionChipsProps<T>) {
  const row = useRef<HTMLDivElement>(null);

  // Keep the chosen chip in view when the row scrolls (a swipe or Surprise can pick one off-screen).
  useEffect(() => {
    const el = row.current;
    const chip = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !chip || el.scrollWidth <= el.clientWidth) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: chip.offsetLeft - (el.clientWidth - chip.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  }, [value]);

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-muted-foreground">{label}</legend>
      <div ref={row} className={cn("relative flex flex-wrap gap-2", PHONE_ROW)}>
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={option.value === value}
            aria-label={option.name}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-10 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors",
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

"use client";

import { useEffect, useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { hexToOklch } from "@/features/appearance/lib/color";

interface CustomAccentFieldProps {
  value: string;
  onChange: (hex: string) => void;
}

const normalize = (hex: string) => (hex.startsWith("#") ? hex : `#${hex}`).toLowerCase();

/** Any accent color, by picker or hex code. The app keeps it readable in both modes. */
export function CustomAccentField({ value, onChange }: CustomAccentFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const valid = hexToOklch(draft) !== null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
      <label htmlFor={`${id}-hex`} className="text-sm font-medium">
        Your color
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label="Pick a color"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="size-11 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
        />
        <Input
          id={`${id}-hex`}
          value={draft}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!valid}
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            const next = e.target.value.trim();
            setDraft(next);
            if (hexToOklch(next)) onChange(normalize(next));
          }}
          className="max-w-36 font-mono uppercase max-md:h-10"
        />
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {valid ? "Shades for light and dark mode are adjusted so text stays readable." : "Enter a color like #7C3AED."}
      </p>
    </div>
  );
}

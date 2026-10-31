"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/types";

const MODES: { value: ThemeMode; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

interface ModePickerProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

/** Light, Dark, or follow the device. */
export function ModePicker({ value, onChange }: ModePickerProps) {
  return (
    <div role="group" aria-label="Mode" className="grid grid-cols-3 gap-2">
      {MODES.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-sm font-medium transition-colors",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            value === mode ? "border-primary bg-primary/10" : "hover:bg-accent",
          )}
        >
          <Icon className="size-5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

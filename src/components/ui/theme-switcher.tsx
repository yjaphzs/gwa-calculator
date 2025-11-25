"use client";

import { useAppearance } from "@/hooks/use-appearance";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ThemeSwitcher() {
  const { appearance, updateAppearance } = useAppearance();

  return (
    <div className="flex items-center space-x-3">
      <Sun className="size-4" />
      <Switch
        checked={appearance === "dark"}
        onCheckedChange={(value) => updateAppearance(value ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <Moon className="size-4" />
    </div>
  );
}

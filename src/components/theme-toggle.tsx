"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Compact icon theme toggle for the app bar. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Render the icon only after mount to avoid a hydration mismatch. */}
      {mounted ? isDark ? <SunIcon /> : <MoonIcon /> : <SunIcon className="opacity-0" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-provider";
import { DEFAULT_ACCENT, isThemeMode, toPreference } from "@/features/appearance/lib/preference";
import { setScheme, useScheme } from "@/features/appearance/lib/scheme-store";
import { CUSTOM_SCHEME, type SchemeChoice } from "@/features/appearance/lib/schemes";
import { updateUserProfile } from "@/lib/firebase/firestore";
import type { ThemeMode } from "@/types";

// Dragging the color picker fires many changes; save the last one.
const SAVE_DELAY_MS = 700;

/**
 * The look the user picks in the Appearance dialog: color scheme, custom
 * accent, and light/dark/system. Changes apply right away on this device and,
 * when signed in, are saved to the profile so other devices follow
 * (AppearanceSync applies them there).
 */
export function useAppearance() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const choice = useScheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mode: ThemeMode = isThemeMode(theme) ? theme : "system";

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const save = (next: SchemeChoice, nextMode: ThemeMode) => {
    if (!user) return;
    if (timer.current) clearTimeout(timer.current);
    const uid = user.uid;
    timer.current = setTimeout(() => {
      updateUserProfile(uid, { appearance: toPreference(next, nextMode) }).catch((err) => {
        console.error("[appearance] save failed:", err);
        toast.error("Couldn't save your theme to your account", { id: "appearance-save-error" });
      });
    }, SAVE_DELAY_MS);
  };

  const selectScheme = (scheme: string) => {
    const next = scheme === CUSTOM_SCHEME ? { scheme, accent: choice.accent ?? DEFAULT_ACCENT } : { scheme };
    setScheme(next);
    save(next, mode);
  };

  const setAccent = (accent: string) => {
    const next = { scheme: CUSTOM_SCHEME, accent };
    setScheme(next);
    save(next, mode);
  };

  const setMode = (next: ThemeMode) => {
    setTheme(next);
    save(choice, next);
  };

  return { choice, mode, selectScheme, setAccent, setMode };
}

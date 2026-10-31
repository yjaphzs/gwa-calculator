"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

import { useAuth } from "@/context/auth-provider";
import { toPreference } from "@/features/appearance/lib/preference";
import { getScheme, refreshScheme, sameChoice, setScheme } from "@/features/appearance/lib/scheme-store";
import { DEFAULT_SCHEME, isValidChoice } from "@/features/appearance/lib/schemes";
import { updateUserProfile } from "@/lib/firebase/firestore";

/**
 * Keeps the look in step with the account. On load it refreshes the saved
 * scheme from the current definitions. When signed in, the profile's saved
 * look wins (it's how a change on another device arrives); an account with no
 * saved look adopts this device's, if it isn't the default.
 */
export function AppearanceSync() {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);
  const adoptedFor = useRef<string | null>(null);
  const saved = profile?.appearance ?? null;

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    refreshScheme();
  }, []);

  useEffect(() => {
    if (!user || !profile) return;
    if (saved && isValidChoice(saved)) {
      const choice = { scheme: saved.scheme, ...(saved.accent ? { accent: saved.accent } : {}) };
      if (!sameChoice(choice, getScheme())) setScheme(choice);
      if (saved.mode && saved.mode !== themeRef.current) setTheme(saved.mode);
      return;
    }
    if (adoptedFor.current === user.uid) return;
    adoptedFor.current = user.uid;
    const local = getScheme();
    if (local.scheme === DEFAULT_SCHEME && (!themeRef.current || themeRef.current === "system")) return;
    updateUserProfile(user.uid, { appearance: toPreference(local, themeRef.current) }).catch(() => undefined);
    // Re-run only when the saved look itself changes, not on every profile snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, !!profile, saved?.scheme, saved?.accent, saved?.mode]);

  return null;
}

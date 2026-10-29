"use client";

import { useEffect } from "react";

import { ensureAppCheck } from "@/lib/firebase/client";

/**
 * Starts App Check on the auth pages so sign-in, sign-up, and password-reset
 * requests carry a token. Guests elsewhere never start it (see client.ts).
 */
export function AppCheckActivator() {
  useEffect(() => {
    ensureAppCheck();
  }, []);
  return null;
}

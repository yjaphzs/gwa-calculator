"use client";

import { useEffect, useState } from "react";
import { applyActionCode, verifyPasswordResetCode } from "firebase/auth";

import { auth } from "@/lib/firebase/client";
import { getAuthErrorMessage } from "@/lib/firebase/errors";

export type ActionPhase = "loading" | "reset" | "verified" | "done" | "invalid";

/**
 * Validates a Firebase email-action link (`mode` + `oobCode`): verifies the
 * email right away, or checks a reset code and exposes its email.
 */
export function useActionCode(mode: string | null, oobCode: string | null) {
  const [phase, setPhase] = useState<ActionPhase>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode || !mode) {
      setPhase("invalid");
      return;
    }

    let cancelled = false;
    const code = oobCode;

    async function run() {
      try {
        if (mode === "resetPassword") {
          const verifiedEmail = await verifyPasswordResetCode(auth, code);
          if (cancelled) return;
          setEmail(verifiedEmail);
          setPhase("reset");
        } else if (mode === "verifyEmail") {
          await applyActionCode(auth, code);
          if (cancelled) return;
          setPhase("verified");
        } else {
          setPhase("invalid");
        }
      } catch (err) {
        if (cancelled) return;
        setError(getAuthErrorMessage(err));
        setPhase("invalid");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [mode, oobCode]);

  return { phase, setPhase, email, error };
}

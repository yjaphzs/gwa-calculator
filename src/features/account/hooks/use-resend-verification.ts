"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { deliverVerificationEmail } from "@/lib/firebase/email-delivery";
import { getAuthErrorMessage } from "@/lib/firebase/errors";

/** Re-send the account's verification email, with a pending flag and toasts. */
export function useResendVerification() {
  const [resending, setResending] = useState(false);

  const resend = useCallback(async () => {
    setResending(true);
    try {
      await deliverVerificationEmail();
      toast.success("Verification email sent. Check your inbox.");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  }, []);

  return { resending, resend };
}

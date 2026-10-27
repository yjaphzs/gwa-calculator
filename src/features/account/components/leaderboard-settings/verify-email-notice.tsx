"use client";

import { MailWarningIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResendVerification } from "@/features/account/hooks/use-resend-verification";

/** Amber notice gating the leaderboard behind email verification. */
export function VerifyEmailNotice() {
  const { resending, resend } = useResendVerification();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
      <MailWarningIcon className="size-4 text-amber-600" />
      <span>Verify your email to join the leaderboard.</span>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto p-0"
        onClick={resend}
        disabled={resending}
      >
        {resending ? "Sending…" : "Resend verification"}
      </Button>
    </div>
  );
}

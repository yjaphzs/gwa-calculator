"use client";

import { CheckCircle2Icon, MailWarningIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { useResendVerification } from "@/features/account/hooks/use-resend-verification";

interface EmailStatusFieldProps {
  email: string | null;
  verified: boolean;
}

/** The account email with its verified badge, or a resend link when unverified. */
export function EmailStatusField({ email, verified }: EmailStatusFieldProps) {
  const { resending, resend } = useResendVerification();

  return (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{email}</span>
        {verified ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2Icon className="size-3 text-emerald-500" />
            Verified
          </Badge>
        ) : (
          <>
            <Badge variant="outline" className="gap-1 text-amber-600">
              <MailWarningIcon className="size-3" />
              Unverified
            </Badge>
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
          </>
        )}
      </div>
    </Field>
  );
}

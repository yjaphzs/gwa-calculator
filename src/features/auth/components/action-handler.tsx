"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, CircleCheckIcon, MailCheckIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CenteredCard } from "@/features/auth/components/action/centered-card";
import { ResetPasswordForm } from "@/features/auth/components/action/reset-password-form";
import { useActionCode } from "@/features/auth/hooks/use-action-code";

/** In-app handler for Firebase email-action links (verify email, reset password). */
export function ActionHandler() {
  const params = useSearchParams();
  const oobCode = params.get("oobCode");
  const { phase, setPhase, email, error } = useActionCode(params.get("mode"), oobCode);

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner className="size-6 text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your link…</p>
      </div>
    );
  }

  if (phase === "invalid") {
    return (
      <CenteredCard
        icon={<TriangleAlertIcon className="size-6 text-primary" />}
        title="Link not valid"
        description={
          error ?? "This link is invalid or has already been used. Request a new one and try again."
        }
      >
        <Button asChild className="w-full" variant="outline">
          <Link href="/login">
            <ArrowLeftIcon />
            Back to login
          </Link>
        </Button>
      </CenteredCard>
    );
  }

  if (phase === "verified") {
    return (
      <CenteredCard
        icon={<MailCheckIcon className="size-6 text-primary" />}
        title="Email verified"
        description="Thanks! Your email address has been confirmed."
      >
        <Button asChild className="w-full">
          <Link href="/account">Go to your account</Link>
        </Button>
      </CenteredCard>
    );
  }

  if (phase === "done") {
    return (
      <CenteredCard
        icon={<CircleCheckIcon className="size-6 text-primary" />}
        title="Password updated"
        description="Your password has been changed. You can now sign in with it."
      >
        <Button asChild className="w-full">
          <Link href="/login">Continue to login</Link>
        </Button>
      </CenteredCard>
    );
  }

  // phase === "reset"
  return <ResetPasswordForm email={email} oobCode={oobCode!} onDone={() => setPhase("done")} />;
}

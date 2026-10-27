"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  ArrowLeftIcon,
  CircleCheckIcon,
  MailCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { auth } from "@/lib/firebase/client";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Phase = "loading" | "reset" | "verified" | "done" | "invalid";

function CenteredCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-2">
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-2 w-fit rounded-full bg-primary/10 p-3">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function ActionHandler() {
  const params = useSearchParams();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode || !mode) {
      setPhase("invalid");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        if (mode === "resetPassword") {
          const verifiedEmail = await verifyPasswordResetCode(auth, oobCode!);
          if (cancelled) return;
          setEmail(verifiedEmail);
          setPhase("reset");
        } else if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode!);
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
  return (
    <ResetPasswordForm
      email={email}
      oobCode={oobCode!}
      onDone={() => setPhase("done")}
    />
  );
}

const resetSchema = z
  .object({
    password: z.string().min(6, "Use at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type ResetSchema = z.infer<typeof resetSchema>;

function ResetPasswordForm({
  email,
  oobCode,
  onDone,
}: {
  email: string | null;
  oobCode: string;
  onDone: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetSchema) {
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      onDone();
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {email ? (
              <>
                For <span className="font-medium text-foreground">{email}</span>
              </>
            ) : (
              "Choose a new password for your account."
            )}
          </p>
        </div>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput
            id="reset-password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            disabled={isSubmitting}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="reset-confirm">Confirm password</FieldLabel>
          <PasswordInput
            id="reset-confirm"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        {errors.root && (
          <p className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </FieldGroup>
    </form>
  );
}

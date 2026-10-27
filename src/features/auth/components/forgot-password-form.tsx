"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeftIcon, MailCheckIcon, MailQuestionIcon } from "lucide-react";

import { requestPasswordReset } from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
});
type ForgotSchema = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({ resolver: zodResolver(forgotSchema) });

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <MailCheckIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>,
            we&apos;ve sent a reset link.
          </p>
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">
            Didn&apos;t get the email?
          </p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>Check your spam or junk folder.</li>
            <li>Wait a minute — delivery can take a moment.</li>
            <li>Confirm the address is correct and try again.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => setSubmittedEmail(null)}>
            Try a different email
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">
              <ArrowLeftIcon />
              Back to login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  async function onSubmit(values: ForgotSchema) {
    const email = values.email.trim().toLowerCase();
    try {
      await requestPasswordReset({ email });
      setSubmittedEmail(email);
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <MailQuestionIcon className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your account email and we&apos;ll send you a link to set a new
            password.
          </p>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        {errors.root && (
          <p className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
          <Button asChild variant="ghost" disabled={isSubmitting}>
            <Link href="/login">
              <ArrowLeftIcon />
              Back to login
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

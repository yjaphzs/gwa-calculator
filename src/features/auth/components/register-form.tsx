"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { AuthFormHeader } from "@/features/auth/components/shared/auth-form-header";
import { FormRootError } from "@/features/auth/components/shared/form-root-error";
import { GoogleSignInButton } from "@/features/auth/components/shared/google-sign-in-button";
import { TermsConsentField } from "@/features/auth/components/shared/terms-consent-field";
import { signInWithGoogle, signUp } from "@/lib/firebase/auth";
import { requestEmailVerification } from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";

const TERMS_MESSAGE = "You must agree to the Privacy Policy and Terms to continue.";

const registerSchema = z
  .object({
    email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
    password: z.string().min(6, "Use at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.boolean().refine((v) => v, { message: TERMS_MESSAGE }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterSchema) {
    try {
      await signUp(values.email, values.password);
      // Best-effort branded verification email via the Cloud Function; the
      // profile doc is created by the AuthProvider once auth state updates.
      try {
        await requestEmailVerification();
        toast.success("Account created. Check your email to verify it.");
      } catch {
        toast.success("Account created.");
      }
      // Redirect handled by GuestGuard.
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
    }
  }

  async function handleGoogle() {
    if (!getValues("acceptTerms")) {
      setError("acceptTerms", { message: TERMS_MESSAGE });
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
      setGoogleLoading(false);
    }
  }

  const busy = isSubmitting || googleLoading;

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <AuthFormHeader title="Create your account">
          Save your progress and sync it across devices
        </AuthFormHeader>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            type="email"
            placeholder="email@example.com"
            aria-invalid={!!errors.email}
            autoComplete="email"
            disabled={busy}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <PasswordInput
            id="register-password"
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            disabled={busy}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="register-confirm">Confirm password</FieldLabel>
          <PasswordInput
            id="register-confirm"
            aria-invalid={!!errors.confirmPassword}
            autoComplete="new-password"
            disabled={busy}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <FormRootError message={errors.root?.message} />

        <TermsConsentField
          registration={register("acceptTerms")}
          error={errors.acceptTerms}
          disabled={busy}
        />

        <Field>
          <Button type="submit" disabled={busy}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Field>

        <FieldSeparator>or</FieldSeparator>

        <GoogleSignInButton loading={googleLoading} disabled={busy} onClick={handleGoogle} />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { signUp, signInWithGoogle } from "@/lib/firebase/auth";
import { requestEmailVerification } from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "@/components/google-icon";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: z.string().min(6, "Use at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.boolean().refine((v) => v, {
      message: "You must agree to the Privacy Policy and Terms to continue.",
    }),
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
        toast.success("Account created — check your email to verify it.");
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
      setError("acceptTerms", {
        message: "You must agree to the Privacy Policy and Terms to continue.",
      });
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
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Save your progress and sync it across devices
          </p>
        </div>

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

        {errors.root && (
          <p className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        {/* Consent — required before creating an account by any method. */}
        <div>
          <label
            htmlFor="register-accept-terms"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-relaxed text-muted-foreground transition-colors",
              "has-checked:border-primary/40 has-checked:bg-primary/5",
              errors.acceptTerms ? "border-destructive" : "border-input",
            )}
          >
            <input
              id="register-accept-terms"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
              disabled={busy}
              {...register("acceptTerms")}
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms-and-conditions"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <FieldError errors={[errors.acceptTerms]} className="mt-1.5" />
        </div>

        <Field>
          <Button type="submit" disabled={busy}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Field>

        <FieldSeparator>or</FieldSeparator>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={busy}
        >
          {googleLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Continue with Google
        </Button>

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

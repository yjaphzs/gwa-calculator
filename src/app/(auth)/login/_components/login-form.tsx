"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signIn, signInWithGoogle } from "@/lib/firebase/auth";
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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginSchema) {
    try {
      await signIn(values.email, values.password);
      // Redirect handled by GuestGuard once auth state updates.
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
    }
  }

  async function handleGoogle() {
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
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in to sync your GWA across your devices
          </p>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
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
          <div className="flex items-center">
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            disabled={busy}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        {errors.root && (
          <p className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Field>
          <Button type="submit" disabled={busy}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Signing in…" : "Login"}
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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Create one
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}

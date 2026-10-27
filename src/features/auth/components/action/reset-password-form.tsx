"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { confirmPasswordReset } from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { AuthFormHeader } from "@/features/auth/components/shared/auth-form-header";
import { FormRootError } from "@/features/auth/components/shared/form-root-error";
import { auth } from "@/lib/firebase/client";
import { getAuthErrorMessage } from "@/lib/firebase/errors";

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

interface ResetPasswordFormProps {
  email: string | null;
  oobCode: string;
  onDone: () => void;
}

/** New-password form for a verified password-reset link. */
export function ResetPasswordForm({ email, oobCode, onDone }: ResetPasswordFormProps) {
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
        <AuthFormHeader title="Set a new password">
          {email ? (
            <>
              For <span className="font-medium text-foreground">{email}</span>
            </>
          ) : (
            "Choose a new password for your account."
          )}
        </AuthFormHeader>

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

        <FormRootError message={errors.root?.message} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </FieldGroup>
    </form>
  );
}

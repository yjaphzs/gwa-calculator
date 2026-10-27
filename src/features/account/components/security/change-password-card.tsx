"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldError as RHFFieldError, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { changePassword, reauthenticate, type User } from "@/lib/firebase/auth";
import { getAuthErrorMessage } from "@/lib/firebase/errors";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(6, "Use at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type PasswordSchema = z.infer<typeof passwordSchema>;

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error?: RHFFieldError;
  disabled: boolean;
  registration: UseFormRegisterReturn;
}

function PasswordField({ id, label, autoComplete, error, disabled, registration }: PasswordFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <PasswordInput
        id={id}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        disabled={disabled}
        {...registration}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

/** Re-authenticate with the current password, then set a new one. */
export function ChangePasswordCard({ user }: { user: User }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordSchema>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(values: PasswordSchema) {
    try {
      await reauthenticate(user, values.currentPassword);
      await changePassword(user, values.newPassword);
      reset();
      toast.success("Password updated.");
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change the password you use to sign in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <PasswordField
            id="current-password"
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword}
            disabled={isSubmitting}
            registration={register("currentPassword")}
          />
          <PasswordField
            id="new-password"
            label="New password"
            autoComplete="new-password"
            error={errors.newPassword}
            disabled={isSubmitting}
            registration={register("newPassword")}
          />
          <PasswordField
            id="confirm-new-password"
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            disabled={isSubmitting}
            registration={register("confirmPassword")}
          />

          {errors.root && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

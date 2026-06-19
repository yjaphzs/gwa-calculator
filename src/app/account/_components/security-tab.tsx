"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LogOutIcon, ShieldIcon, Trash2Icon } from "lucide-react";

import { useAuth } from "@/context/auth-provider";
import {
  changePassword,
  hasPasswordProvider,
  reauthenticate,
  signOut,
} from "@/lib/firebase/auth";
import { deleteAccount } from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";

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

export function SecurityTab() {
  const { user } = useAuth();
  const router = useRouter();

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordSchema>({ resolver: zodResolver(passwordSchema) });

  if (!user) return null;

  const canChangePassword = hasPasswordProvider(user);

  async function onChangePassword(values: PasswordSchema) {
    if (!user) return;
    try {
      await reauthenticate(user, values.currentPassword);
      await changePassword(user, values.newPassword);
      reset();
      toast.success("Password updated.");
    } catch (err) {
      setError("root", { message: getAuthErrorMessage(err) });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut().catch(() => undefined);
      toast.success("Your account has been deleted.");
      router.replace("/");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="size-4" />
            Password
          </CardTitle>
          <CardDescription>
            {canChangePassword
              ? "Change the password you use to sign in."
              : "You sign in with Google. Manage your password in your Google account."}
          </CardDescription>
        </CardHeader>
        {canChangePassword && (
          <CardContent>
            <form
              onSubmit={handleSubmit(onChangePassword)}
              className="flex flex-col gap-4"
            >
              <Field data-invalid={!!errors.currentPassword}>
                <FieldLabel htmlFor="current-password">
                  Current password
                </FieldLabel>
                <PasswordInput
                  id="current-password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  disabled={isSubmitting}
                  {...register("currentPassword")}
                />
                <FieldError errors={[errors.currentPassword]} />
              </Field>

              <Field data-invalid={!!errors.newPassword}>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  disabled={isSubmitting}
                  {...register("newPassword")}
                />
                <FieldError errors={[errors.newPassword]} />
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirm-new-password">
                  Confirm new password
                </FieldLabel>
                <PasswordInput
                  id="confirm-new-password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>

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
        )}
      </Card>

      {/* Sign out */}
      <Card>
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            Sign out on this device. Your saved data stays in your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
          >
            <LogOutIcon />
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40 ring-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently delete your account and all saved subjects, semesters,
            and your profile photo. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2Icon />
                Delete my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your account and all data. To
                  confirm, type your email{" "}
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>{" "}
                  below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={user.email ?? ""}
                autoComplete="off"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirm("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={
                    deleting ||
                    deleteConfirm.trim().toLowerCase() !==
                      (user.email ?? "").toLowerCase()
                  }
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleting && <Spinner data-icon="inline-start" />}
                  {deleting ? "Deleting…" : "Delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

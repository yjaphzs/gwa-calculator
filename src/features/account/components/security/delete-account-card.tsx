"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/lib/firebase/auth";
import { deleteAccount } from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";

/** Danger zone: delete the account after typing the email to confirm. */
export function DeleteAccountCard({ email }: { email: string | null }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirmed = confirm.trim().toLowerCase() === (email ?? "").toLowerCase();

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
    <Card className="border-destructive/40 ring-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently delete your account and all saved subjects, semesters, and your profile
          photo. This cannot be undone.
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
                This permanently removes your account and all data. To confirm, type your email{" "}
                <span className="font-medium text-foreground">{email}</span> below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={email ?? ""}
              autoComplete="off"
              aria-label="Type your email to confirm"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirm("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={deleting || !confirmed}
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
  );
}

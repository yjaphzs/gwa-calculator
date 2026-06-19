"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2Icon, MailWarningIcon } from "lucide-react";

import { useAuth } from "@/context/auth-provider";
import { updateProfile } from "@/lib/firebase/auth";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { uploadAvatar } from "@/lib/firebase/storage";
import { requestEmailVerification } from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import { AvatarCropperField } from "@/components/avatar-cropper-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

function initialsFrom(name: string | null, email: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function ProfileTab() {
  const { user, profile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!user) return null;

  const shownPhoto = photoURL ?? profile?.photoURL ?? null;

  async function handleCrop(blob: Blob) {
    if (!user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(user.uid, blob);
      await updateProfile(user, { photoURL: url });
      await updateUserProfile(user.uid, { photoURL: url });
      setPhotoURL(url);
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveName() {
    if (!user) return;
    const name = displayName.trim();
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: name || null });
      await updateUserProfile(user.uid, { displayName: name || null });
      toast.success("Name updated.");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setSavingName(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    try {
      await requestEmailVerification();
      toast.success("Verification email sent — check your inbox.");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  const nameUnchanged = displayName.trim() === (user.displayName ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your photo and name are saved to your account and synced everywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AvatarCropperField
          currentUrl={shownPhoto}
          initials={initialsFrom(displayName || user.displayName, user.email)}
          onCrop={handleCrop}
          busy={uploading}
        />

        <Separator />

        {/* Email */}
        <Field>
          <FieldLabel>Email</FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{user.email}</span>
            {user.emailVerified ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2Icon className="size-3 text-emerald-500" />
                Verified
              </Badge>
            ) : (
              <>
                <Badge variant="outline" className="gap-1 text-amber-600">
                  <MailWarningIcon className="size-3" />
                  Unverified
                </Badge>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={handleResendVerification}
                  disabled={resending}
                >
                  {resending ? "Sending…" : "Resend verification"}
                </Button>
              </>
            )}
          </div>
        </Field>

        {/* Display name */}
        <Field>
          <FieldLabel htmlFor="display-name">Display name</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              disabled={savingName}
            />
            <Button
              type="button"
              onClick={handleSaveName}
              disabled={savingName || nameUnchanged}
            >
              {savingName && <Spinner data-icon="inline-start" />}
              Save
            </Button>
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-provider";
import { AvatarCropperField } from "@/features/account/components/avatar-cropper-field";
import { DisplayNameField } from "@/features/account/components/profile/display-name-field";
import { EmailStatusField } from "@/features/account/components/profile/email-status-field";
import { updateProfile } from "@/lib/firebase/auth";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { uploadAvatar } from "@/lib/firebase/storage";
import { initials } from "@/lib/initials";

export function ProfileTab() {
  const { user, profile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState<string | null>(user?.photoURL ?? null);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

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
          currentUrl={photoURL ?? profile?.photoURL ?? null}
          initials={initials(displayName || user.displayName || user.email || "?")}
          onCrop={handleCrop}
          busy={uploading}
        />

        <Separator />

        <EmailStatusField email={user.email} verified={user.emailVerified} />
        <DisplayNameField user={user} value={displayName} onChange={setDisplayName} />
      </CardContent>
    </Card>
  );
}

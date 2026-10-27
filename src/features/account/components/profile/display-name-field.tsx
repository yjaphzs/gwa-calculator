"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile, type User } from "@/lib/firebase/auth";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import { updateUserProfile } from "@/lib/firebase/firestore";

interface DisplayNameFieldProps {
  user: User;
  /** Controlled so the avatar initials can follow what's typed. */
  value: string;
  onChange: (value: string) => void;
}

/** Display name input, saved to both Firebase Auth and the profile doc. */
export function DisplayNameField({ user, value, onChange }: DisplayNameFieldProps) {
  const [saving, setSaving] = useState(false);
  const unchanged = value.trim() === (user.displayName ?? "");

  async function handleSave() {
    const name = value.trim();
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name || null });
      await updateUserProfile(user.uid, { displayName: name || null });
      toast.success("Name updated.");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor="display-name">Display name</FieldLabel>
      <div className="flex gap-2">
        <Input
          id="display-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name"
          disabled={saving}
        />
        <Button type="button" onClick={handleSave} disabled={saving || unchanged}>
          {saving && <Spinner data-icon="inline-start" />}
          Save
        </Button>
      </div>
    </Field>
  );
}

"use client";

import { useAuth } from "@/context/auth-provider";
import { ChangePasswordCard } from "@/features/account/components/security/change-password-card";
import { DeleteAccountCard } from "@/features/account/components/security/delete-account-card";
import { SignOutCard } from "@/features/account/components/security/sign-out-card";
import { hasPasswordProvider } from "@/lib/firebase/auth";

export function SecurityTab() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Change password — hidden for Google-only accounts (no password). */}
      {hasPasswordProvider(user) && <ChangePasswordCard user={user} />}
      <SignOutCard />
      <DeleteAccountCard email={user.email} />
    </div>
  );
}

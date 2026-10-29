"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CloudCheckIcon,
  LogInIcon,
  LogOutIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";

import type { MenuGroup } from "@/components/shared/menu-types";
import { ResponsiveMenu } from "@/components/shared/responsive-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { initials } from "@/lib/initials";

interface AccountSummaryProps {
  name: string | null;
  email: string | null;
  photo?: string;
  avatarInitials: string;
}

/** Name, email, and sync status; the avatar only shows in the phone sheet. */
function AccountSummary({ name, email, photo, avatarInitials }: AccountSummaryProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 md:hidden">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback>{avatarInitials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        {name && <span className="truncate font-medium">{name}</span>}
        <span className="truncate text-xs text-muted-foreground">{email}</span>
        <span className="mt-1 inline-flex w-fit items-center gap-1 text-xs text-primary">
          <CloudCheckIcon className="size-3" />
          Synced to your account
        </span>
      </div>
    </div>
  );
}

export function AccountMenu() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
        className="font-semibold shadow-sm transition-shadow hover:shadow-md"
      >
        <Link href="/login">
          <LogInIcon className="size-4" />
          Sign in
        </Link>
      </Button>
    );
  }

  const photo = profile?.photoURL ?? user.photoURL ?? undefined;
  const name = user.displayName ?? profile?.displayName ?? null;
  const avatarInitials = initials(name ?? user.email ?? "?");

  const groups: MenuGroup[] = [
    {
      id: "pages",
      items: [
        { kind: "link", id: "leaderboard", label: "Leaderboard", icon: TrophyIcon, href: "/leaderboard" },
        { kind: "link", id: "account", label: "Account", icon: UserIcon, href: "/account" },
      ],
    },
    {
      id: "session",
      items: [
        {
          kind: "action",
          id: "logout",
          label: "Log out",
          icon: LogOutIcon,
          onSelect: () => void signOut().then(() => router.refresh()),
        },
      ],
    },
  ];

  return (
    <ResponsiveMenu
      title="Your account"
      groups={groups}
      header={<AccountSummary name={name} email={user.email} photo={photo} avatarInitials={avatarInitials} />}
      trigger={
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open account menu">
          <Avatar>
            {photo && <AvatarImage src={photo} alt="" />}
            <AvatarFallback className="text-xs">{avatarInitials}</AvatarFallback>
          </Avatar>
        </Button>
      }
    />
  );
}

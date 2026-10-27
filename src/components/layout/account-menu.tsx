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

import { useAuth } from "@/context/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initialsFrom(name: string | null, email: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
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
  const initials = initialsFrom(name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            {photo && <AvatarImage src={photo} alt="" />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          {name && <span className="truncate font-medium">{name}</span>}
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
          <span className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-normal text-primary">
            <CloudCheckIcon className="size-3" />
            Synced to your account
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/leaderboard">
            <TrophyIcon />
            Leaderboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserIcon />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

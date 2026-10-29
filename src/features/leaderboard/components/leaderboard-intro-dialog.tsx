"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EyeOffIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  useResponsiveDialogIsDrawer,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";

/** localStorage flag so the intro only shows on a device's first visit. */
const SEEN_KEY = "gwa_leaderboard_intro_seen";

function Point({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheckIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{children}</span>
      </div>
    </div>
  );
}

/** Desktop: secondary then primary. Sheet: primary on top, both full width. */
function IntroActions({ onDismiss }: { onDismiss: () => void }) {
  const drawer = useResponsiveDialogIsDrawer();
  const setup = (
    <Button variant="outline" className={drawer ? "h-11" : undefined} asChild>
      <Link href="/account" onClick={onDismiss}>
        Set up in Account
      </Link>
    </Button>
  );
  const ok = (
    <Button className={drawer ? "h-11" : undefined} onClick={onDismiss}>
      Got it
    </Button>
  );
  return (
    <ResponsiveDialogFooter className="gap-2 sm:gap-2">
      {drawer ? ok : setup}
      {drawer ? setup : ok}
    </ResponsiveDialogFooter>
  );
}

/**
 * First-visit explainer for the leaderboard: spells out that nothing is shared
 * without consent, that joining means agreeing to share, and that anonymity is
 * available. Shown once per device.
 */
export function LeaderboardIntroDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
    } catch {
      /* localStorage unavailable (private mode) — just skip the intro. */
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Welcome to the Leaderboard</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            A quick note on how your privacy works here.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex flex-col gap-4 py-2">
          <Point icon={ShieldCheckIcon} title="Nothing is shared without your permission">
            Your name, photo, school, and GWA stay private unless you choose to
            join. By default you only ever view the boards.
          </Point>
          <Point icon={UsersIcon} title="Joining means agreeing to share">
            If you opt in, you agree to show your standing to other signed-in
            students. You can leave at any time from your Account page.
          </Point>
          <Point icon={EyeOffIcon} title="You can stay anonymous">
            Prefer privacy? Join under a generated handle with no name or photo,
            and switch between anonymous and named whenever you like.
          </Point>
        </ResponsiveDialogBody>

        <IntroActions onDismiss={dismiss} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

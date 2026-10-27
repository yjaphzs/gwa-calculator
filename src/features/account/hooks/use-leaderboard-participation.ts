"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { setLeaderboardParticipation } from "@/lib/firebase/callable";
import { getCallableErrorMessage } from "@/lib/firebase/errors";
import type { LeaderboardSettings } from "@/types";

/** Join/leave and anonymity toggles for the leaderboard, synced with `settings`. */
export function useLeaderboardParticipation(settings: LeaderboardSettings | null) {
  const [anonymous, setAnonymous] = useState(true);
  const [busy, setBusy] = useState(false);
  const optIn = settings?.optIn ?? false;

  // Mirror the stored anonymity choice once it loads.
  useEffect(() => {
    if (settings) setAnonymous(settings.isAnonymous);
  }, [settings]);

  async function toggleJoin(next: boolean) {
    setBusy(true);
    try {
      await setLeaderboardParticipation({ optIn: next, isAnonymous: anonymous });
      toast.success(next ? "You've joined the leaderboard." : "You've left the leaderboard.");
    } catch (err) {
      toast.error(getCallableErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleAnonymous(next: boolean) {
    setAnonymous(next);
    if (!optIn) return; // not on the board yet — just remember the choice
    setBusy(true);
    try {
      await setLeaderboardParticipation({ optIn: true, isAnonymous: next });
      toast.success(next ? "You now appear anonymously." : "You now appear with your name.");
    } catch (err) {
      setAnonymous(!next); // revert on failure
      toast.error(getCallableErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return { optIn, anonymous, busy, toggleJoin, toggleAnonymous };
}

"use client";

import { useEffect, useState } from "react";

import { subscribeLeaderboardSettings } from "@/lib/firebase/firestore";
import type { LeaderboardSettings } from "@/types";

/** Live view of the user's own (server-written) leaderboard settings. */
export function useLeaderboardSettings(uid: string | undefined) {
  const [settings, setSettings] = useState<LeaderboardSettings | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeLeaderboardSettings(uid, setSettings);
  }, [uid]);

  return settings;
}

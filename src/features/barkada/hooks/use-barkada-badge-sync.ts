"use client";

import { useEffect } from "react";

import { useAuth } from "@/context/auth-provider";
import { readSentBadges, writeSentBadges } from "@/features/barkada/lib/barkada-local";
import { updateBarkadaMember } from "@/lib/firebase/callable";

/**
 * Sends the user's earned badge count to their barkadas when it changes. Only
 * signed-in users in a barkada (known from this device) ever call the server.
 */
export function useBarkadaBadgeSync(earned: number, ready: boolean) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!ready || !uid) return;
    const sent = readSentBadges(uid);
    if (sent === null || sent === earned) return;
    writeSentBadges(uid, earned);
    // On failure, keep the old count so the next visit tries again.
    updateBarkadaMember({ badges: earned }).catch(() => writeSentBadges(uid, sent));
  }, [earned, ready, uid]);
}

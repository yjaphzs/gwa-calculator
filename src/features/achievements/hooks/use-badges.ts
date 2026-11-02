"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getUnseen,
  markSeen,
  readSeen,
  setEarnedCount,
  setUnseen,
  subscribeUnseen,
} from "@/features/achievements/lib/badge-seen";
import { evaluateBadges, type BadgeStatus } from "@/features/achievements/lib/evaluate-badges";
import { useBarkadaBadgeSync } from "@/features/barkada/hooks/use-barkada-badge-sync";
import { buzz } from "@/lib/haptics";
import type { Semester, Subject } from "@/types";

interface Input {
  subjects: Subject[];
  semesters: Semester[];
  /** False while the data is still loading, so nothing is judged on empty data. */
  ready: boolean;
  /** On the achievements page, everything shown counts as seen. */
  onPage?: boolean;
}

/**
 * The user's badges. Also keeps the nav's new-badge dot up to date, cheers
 * badges earned during this visit (a toast and a buzz), and sends the count to
 * the user's barkadas when it changes. Badges someone already had when the
 * page loaded never toast.
 */
export function useBadges({ subjects, semesters, ready, onPage = false }: Input): BadgeStatus[] {
  const router = useRouter();
  const statuses = useMemo(() => evaluateBadges(subjects, semesters), [subjects, semesters]);
  const earnedKey = statuses.filter((s) => s.earned).map((s) => s.badge.id).join(",");
  const before = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!ready) return;
    const ids = earnedKey ? earnedKey.split(",") : [];
    setEarnedCount(ids.length);
    if (onPage) markSeen(ids);
    else setUnseen(ids.filter((id) => !readSeen().has(id)).length);

    const previous = before.current;
    before.current = new Set(ids);
    const fresh = previous ? statuses.filter((s) => s.earned && !previous.has(s.badge.id)).map((s) => s.badge.name) : [];
    if (fresh.length === 0) return;
    buzz("badge");
    toast.success(fresh.length === 1 ? `New badge: ${fresh[0]}` : `${fresh.length} new badges: ${fresh.join(", ")}`, {
      action: onPage ? undefined : { label: "See badges", onClick: () => router.push("/achievements") },
    });
    // statuses follows earnedKey; listing it would re-run on every new array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedKey, ready, onPage, router]);

  useBarkadaBadgeSync(earnedKey ? earnedKey.split(",").length : 0, ready);
  return statuses;
}

/** How many earned badges the user hasn't seen yet, for the nav dot. */
export function useUnseenBadges(): number {
  return useSyncExternalStore(subscribeUnseen, getUnseen, () => 0);
}

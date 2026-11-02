"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type LeaderboardTab = "school" | "barkada";

/**
 * The Leaderboard page's tab, kept in the URL (`?tab=barkada`) so it survives
 * a refresh. An invite link (`?join=CODE`) opens the Barkada tab.
 */
export function useLeaderboardTab() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const joinCode = params.get("join");
  const tab: LeaderboardTab = joinCode !== null || params.get("tab") === "barkada" ? "barkada" : "school";

  const replace = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return {
    tab,
    setTab: (value: LeaderboardTab) => replace({ tab: value === "barkada" ? "barkada" : null, join: null }),
    joinCode,
    /** Drops `?join=` once the invite is handled, staying on the Barkada tab. */
    clearJoin: () => replace({ join: null, tab: "barkada" }),
  };
}

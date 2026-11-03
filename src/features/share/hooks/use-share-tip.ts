"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";

const TIP_KEY = "gwa_share_tip_seen";

/** The one-time "Make it yours" tip in the share studio, gone after the first tab, swipe, Surprise, or full-screen view. */
export function useShareTip() {
  const [seen, setSeen] = useLocalStorage(TIP_KEY, false);
  return {
    showTip: !seen,
    dismissTip: () => {
      if (!seen) setSeen(true);
    },
  };
}

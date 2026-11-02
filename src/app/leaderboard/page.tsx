import { Suspense } from "react";
import type { Metadata } from "next";

import { LeaderboardView } from "@/features/leaderboard/components/leaderboard-view";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "GWA rankings by school for students who opted in, and barkada challenges with your friends.",
};

export default function LeaderboardPage() {
  // The view reads ?tab= and ?join= (barkada invites) with useSearchParams.
  return (
    <Suspense fallback={null}>
      <LeaderboardView />
    </Suspense>
  );
}

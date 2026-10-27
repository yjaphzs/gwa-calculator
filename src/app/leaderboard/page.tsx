import type { Metadata } from "next";

import { LeaderboardView } from "@/features/leaderboard/components/leaderboard-view";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "GWA rankings by school for students who opted in.",
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}

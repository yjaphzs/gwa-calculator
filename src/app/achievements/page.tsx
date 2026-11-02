import type { Metadata } from "next";

import { AchievementsView } from "@/features/achievements/components/achievements-view";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Badges you earn from your grades and saved semesters, like Uno!, Comeback, and Scholar Streak.",
  alternates: { canonical: "/achievements/" },
};

export default function AchievementsPage() {
  return <AchievementsView />;
}

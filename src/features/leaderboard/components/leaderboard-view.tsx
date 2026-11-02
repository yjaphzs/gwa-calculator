"use client";

import { TrophyIcon, UsersRoundIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarkadaTab } from "@/features/barkada/components/barkada-tab";
import { SchoolBoards } from "@/features/leaderboard/components/school-boards";
import { useLeaderboardTab, type LeaderboardTab } from "@/features/leaderboard/hooks/use-leaderboard-tab";

/** The leaderboard page: your school's boards, or your barkada challenges. */
export function LeaderboardView() {
  const { tab, setTab, joinCode, clearJoin } = useLeaderboardTab();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <TrophyIcon className="size-6 text-primary" />
        Leaderboard
      </h1>
      <Tabs value={tab} onValueChange={(value) => setTab(value as LeaderboardTab)}>
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="school" className="max-md:h-9">
            <TrophyIcon />
            My school
          </TabsTrigger>
          <TabsTrigger value="barkada" className="max-md:h-9">
            <UsersRoundIcon />
            Barkada
          </TabsTrigger>
        </TabsList>
        <TabsContent value="school" className="mt-3">
          <SchoolBoards />
        </TabsContent>
        <TabsContent value="barkada" className="mt-3">
          <BarkadaTab invite={joinCode} onInviteHandled={clearJoin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

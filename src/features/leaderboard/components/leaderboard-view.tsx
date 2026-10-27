"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrophyIcon, UsersIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-provider";
import { BoardEmpty } from "@/features/leaderboard/components/board-states";
import { LeaderboardIntroDialog } from "@/features/leaderboard/components/leaderboard-intro-dialog";
import { OverallBoard } from "@/features/leaderboard/components/overall-board";
import { SchoolCombobox } from "@/features/leaderboard/components/school-combobox";
import { SemesterBoard } from "@/features/leaderboard/components/semester-board";
import { useLeaderboardSettings } from "@/features/leaderboard/hooks/use-leaderboard-settings";

/** The leaderboard page: school picker, then the overall and per-semester boards. */
export function LeaderboardView() {
  const { user, profile } = useAuth();
  const [schoolId, setSchoolId] = useState<string | null>(null);

  // Know our own handle, to highlight our row across the boards.
  const ownHandle = useLeaderboardSettings(user?.uid)?.handle ?? null;

  // Default the filter to the signed-in user's own school (once).
  useEffect(() => {
    if (profile?.schoolId) setSchoolId((prev) => prev ?? profile.schoolId ?? null);
  }, [profile?.schoolId]);

  return (
    <div className="flex flex-col gap-4">
      <LeaderboardIntroDialog />
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <TrophyIcon className="size-6 text-primary" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          GWA rankings by school, for students who opted in, updated live. Lower is better;
          1.00 leads. Join or leave anytime from your{" "}
          <Link href="/account" className="underline underline-offset-2">
            Account
          </Link>{" "}
          page.
        </p>
      </div>

      <SchoolCombobox
        value={schoolId}
        onChange={(school) => {
          if (school) setSchoolId(school.id);
        }}
        placeholder="Pick a school to view its boards…"
      />

      {!schoolId ? (
        <BoardEmpty icon={<UsersIcon />} title="Pick a school">
          Choose a school above to see its boards. Set your own school on the Account page to
          default here.
        </BoardEmpty>
      ) : (
        <Tabs defaultValue="overall" className="mt-1">
          <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="semester">Per semester</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="mt-4">
            <OverallBoard schoolId={schoolId} ownHandle={ownHandle} />
          </TabsContent>
          <TabsContent value="semester" className="mt-4">
            <SemesterBoard schoolId={schoolId} ownHandle={ownHandle} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

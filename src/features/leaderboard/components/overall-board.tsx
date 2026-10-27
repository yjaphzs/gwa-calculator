"use client";

import { TrophyIcon } from "lucide-react";

import { getSchoolById } from "@/config/schools";
import { BoardEmpty, LoadError, LoadingRows } from "@/features/leaderboard/components/board-states";
import { RankedList } from "@/features/leaderboard/components/ranked-list";
import { useBoardEntries } from "@/features/leaderboard/hooks/use-board-entries";
import { subscribeLeaderboard } from "@/lib/firebase/firestore";

interface BoardProps {
  schoolId: string;
  ownHandle: string | null;
}

/** Overall (cumulative) board for a school — live. */
export function OverallBoard({ schoolId, ownHandle }: BoardProps) {
  const { entries, error } = useBoardEntries(schoolId, subscribeLeaderboard);
  const schoolName = getSchoolById(schoolId)?.name ?? "this school";

  if (entries === null) return <LoadingRows />;
  if (error) return <LoadError />;
  if (entries.length === 0) {
    return (
      <BoardEmpty icon={<TrophyIcon />} title="No complete records yet">
        The overall board ranks full academic summaries from {schoolName}. It needs 8+
        semesters and 120+ units, so it fills up later. The <strong>Per semester</strong> tab
        fills up sooner.
      </BoardEmpty>
    );
  }
  return <RankedList entries={entries} ownHandle={ownHandle} />;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { TrophyIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSchoolById } from "@/config/schools";
import { BoardEmpty, LoadError, LoadingRows } from "@/features/leaderboard/components/board-states";
import { RankedList } from "@/features/leaderboard/components/ranked-list";
import { useBoardEntries } from "@/features/leaderboard/hooks/use-board-entries";
import { groupTerms } from "@/features/leaderboard/lib/group-terms";
import { subscribeSemesterLeaderboard } from "@/lib/firebase/firestore";

interface BoardProps {
  schoolId: string;
  ownHandle: string | null;
}

/** Per-term board for a school, with a term selector — live. */
export function SemesterBoard({ schoolId, ownHandle }: BoardProps) {
  const { entries, error } = useBoardEntries(schoolId, subscribeSemesterLeaderboard);
  const [term, setTerm] = useState<string | null>(null);
  const schoolName = getSchoolById(schoolId)?.name ?? "this school";

  const terms = useMemo(() => (entries ? groupTerms(entries) : []), [entries]);

  // Default to the most recent term once data loads / changes.
  useEffect(() => {
    if (terms.length === 0) {
      setTerm(null);
    } else if (!term || !terms.some((t) => t.key === term)) {
      setTerm(terms[0].key);
    }
  }, [terms, term]);

  if (entries === null) return <LoadingRows />;
  if (error) return <LoadError />;
  if (entries.length === 0 || terms.length === 0) {
    return (
      <BoardEmpty icon={<TrophyIcon />} title="No semesters yet">
        No one from {schoolName} has a semester on the board yet. Join from your Account page, and
        each saved semester (12+ units) gets ranked here.
      </BoardEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Select value={term ?? undefined} onValueChange={setTerm}>
        <SelectTrigger className="w-full sm:w-72" aria-label="Term">
          <SelectValue placeholder="Select a term" />
        </SelectTrigger>
        <SelectContent>
          {terms.map((t) => (
            <SelectItem key={t.key} value={t.key}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <RankedList entries={entries.filter((e) => e.termKey === term)} ownHandle={ownHandle} />
    </div>
  );
}

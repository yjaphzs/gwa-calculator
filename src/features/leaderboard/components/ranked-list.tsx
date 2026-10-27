"use client";

import { useEffect, useState } from "react";

import Paginator from "@/components/shared/paginator";
import { ItemGroup } from "@/components/ui/item";
import { paginate } from "@/lib/pagination";
import { RankedListItem } from "@/features/leaderboard/components/ranked-list-item";
import type { LeaderboardEntry } from "@/types";

const PAGE_SIZE = 10;

interface RankedListProps {
  entries: LeaderboardEntry[];
  ownHandle: string | null;
}

/** A paginated ranked list shared by the overall and per-term boards. */
export function RankedList({ entries, ownHandle }: RankedListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [entries]);

  return (
    <>
      <ItemGroup className="gap-3">
        {paginate(entries, page, PAGE_SIZE).map((entry, i) => (
          <RankedListItem
            key={entry.handle}
            entry={entry}
            rank={(page - 1) * PAGE_SIZE + i + 1}
            isOwn={!!ownHandle && entry.handle === ownHandle}
          />
        ))}
      </ItemGroup>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {entries.length} student{entries.length === 1 ? "" : "s"}
          </span>
          <Paginator
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showPreviousNext
          />
        </div>
      )}
    </>
  );
}

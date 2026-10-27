import type { ReactNode } from "react";
import { UsersIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingRows() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface BoardEmptyProps {
  icon: ReactNode;
  title: ReactNode;
  children: ReactNode;
}

/** Dashed empty-state panel used by every board state. */
export function BoardEmpty({ icon, title, children }: BoardEmptyProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function LoadError() {
  return (
    <BoardEmpty icon={<UsersIcon />} title="Couldn't load the leaderboard">
      Something went wrong fetching the rankings. Please try again later.
    </BoardEmpty>
  );
}

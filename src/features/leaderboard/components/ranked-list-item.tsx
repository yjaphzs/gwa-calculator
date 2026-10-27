import { UserIcon } from "lucide-react";

import { HonorBadge } from "@/components/shared/honor-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { initials } from "@/lib/initials";
import type { LeaderboardEntry } from "@/types";

interface RankedListItemProps {
  entry: LeaderboardEntry;
  rank: number;
  isOwn: boolean;
}

/** One ranked student: rank, avatar, name + program, GWA + honor. */
export function RankedListItem({ entry, rank, isOwn }: RankedListItemProps) {
  const name = entry.isAnonymous ? entry.handle : (entry.displayName ?? entry.handle);

  return (
    <Item variant="outline" className={isOwn ? "border-primary bg-primary/5" : undefined}>
      <div className="w-7 shrink-0 text-center font-mono text-sm font-medium text-muted-foreground">
        {rank}
      </div>
      <ItemMedia>
        <Avatar>
          {!entry.isAnonymous && entry.photoURL && <AvatarImage src={entry.photoURL} alt="" />}
          <AvatarFallback className="text-xs">
            {entry.isAnonymous ? <UserIcon className="size-4" /> : initials(name)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex items-center gap-2">
          <span className="truncate">{name}</span>
          {isOwn && (
            <Badge variant="default" className="text-[10px]">
              You
            </Badge>
          )}
        </ItemTitle>
        <ItemDescription className="truncate">{entry.program ?? entry.schoolName}</ItemDescription>
      </ItemContent>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-xl font-bold">{entry.gwa.toFixed(3)}</span>
        {entry.honor && <HonorBadge honor={entry.honor} compact />}
      </div>
    </Item>
  );
}

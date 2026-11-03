import { AwardIcon, CrownIcon } from "lucide-react";

import { HonorBadge } from "@/components/shared/honor-badge";
import type { RankedMember } from "@/features/barkada/lib/barkada-rank";
import { shareGwa } from "@/features/share/lib/share-text";
import { cn } from "@/lib/utils";
import type { BarkadaMember } from "@/types";

const MEDALS = ["🥇", "🥈", "🥉"];

function statusText(member: BarkadaMember): string {
  if (member.status === "waiting") return "Waiting for grades";
  if (member.status === "short") return "Under 12 units";
  return "No honor this term";
}

const initials = (nickname: string) => nickname.trim().slice(0, 2).toUpperCase();

interface MemberRowProps {
  entry: RankedMember;
  isMe: boolean;
  isOwner: boolean;
}

/** One member: place, nickname, honor band (or why not yet), the GWA only if shown, and badges. */
export function MemberRow({ entry, isMe, isOwner }: MemberRowProps) {
  const { member, place } = entry;
  const medal = member.honor && place <= 3 ? MEDALS[place - 1] : null;
  const gwa = member.gwa !== null && member.gwaShown !== "hidden" ? shareGwa(member.gwa, member.gwaShown === "exact") : null;

  return (
    <li className={cn("flex items-center gap-3 rounded-lg border p-3", isMe && "border-primary/40 bg-primary/5")}>
      <span className="w-7 shrink-0 text-center text-sm font-semibold tabular-nums">
        <span className="sr-only">Place </span>
        <span aria-hidden={!!medal}>{medal ?? place}</span>
        {medal && <span className="sr-only">{place}</span>}
      </span>
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
      >
        {initials(member.nickname)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
          <span className="truncate">{member.nickname}</span>
          {isMe && <span className="shrink-0 text-xs font-normal text-muted-foreground">(you)</span>}
          {isOwner && (
            <>
              <CrownIcon className="size-3.5 shrink-0 text-chart-line" aria-hidden />
              <span className="sr-only">(owner)</span>
            </>
          )}
        </p>
        <div className="mt-1">
          {member.honor ? (
            <HonorBadge honor={member.honor} />
          ) : (
            <span className="text-xs text-muted-foreground">{statusText(member)}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {gwa && <span className="font-mono text-sm font-bold tabular-nums">{gwa}</span>}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <AwardIcon className="size-3.5" aria-hidden />
          {member.badges}
          <span className="sr-only"> badges</span>
        </span>
      </div>
    </li>
  );
}

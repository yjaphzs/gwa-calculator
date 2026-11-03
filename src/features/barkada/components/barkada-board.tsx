"use client";

import { useState } from "react";
import { SettingsIcon, UserRoundPenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoalCard } from "@/features/barkada/components/goal-card";
import { InviteButton } from "@/features/barkada/components/invite-button";
import { MemberRow } from "@/features/barkada/components/member-row";
import { MyEntryDialog } from "@/features/barkada/components/my-entry-dialog";
import { OwnerSettingsDialog } from "@/features/barkada/components/owner-settings-dialog";
import type { BarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import { rankMembers } from "@/features/barkada/lib/barkada-rank";
import type { BarkadaGroup } from "@/types";

const MAX_MEMBERS = 10;

interface BarkadaBoardProps {
  group: BarkadaGroup;
  uid: string;
  actions: BarkadaActions;
}

/** One barkada: its goal, then everyone ranked by honor band and badges. */
export function BarkadaBoard({ group, uid, actions }: BarkadaBoardProps) {
  const [editing, setEditing] = useState<"me" | "settings" | null>(null);
  const owner = group.ownerUid === uid;
  const ranked = rankMembers(group.members);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight">{group.name}</h2>
          <p className="text-sm text-muted-foreground">
            {group.term.label} · {group.memberUids.length} of {MAX_MEMBERS} members
          </p>
        </div>
        <div className="flex gap-2">
          <InviteButton code={group.code} disabled={group.memberUids.length >= MAX_MEMBERS} />
          <Button variant="outline" size="sm" className="max-md:h-10" onClick={() => setEditing("me")}>
            <UserRoundPenIcon className="size-4" />
            You
          </Button>
          {owner && (
            <Button
              variant="outline"
              size="icon"
              className="size-8 max-md:size-10"
              onClick={() => setEditing("settings")}
              aria-label="Barkada settings"
            >
              <SettingsIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <GoalCard group={group} />

      <ol className="flex flex-col gap-2" aria-label="Members, best standing first">
        {ranked.map((entry) => (
          <MemberRow key={entry.uid} entry={entry} isMe={entry.uid === uid} isOwner={entry.uid === group.ownerUid} />
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        Each entry comes from that member&apos;s saved semester for {group.term.label}, so save yours on the calculator
        to show up. Ranked by honor band, then badges. A GWA never decides the order, and it shows only when its owner
        chooses.
      </p>

      <MyEntryDialog group={group} uid={uid} open={editing === "me"} onOpenChange={(o) => setEditing(o ? "me" : null)} actions={actions} />
      {owner && (
        <OwnerSettingsDialog
          group={group}
          uid={uid}
          open={editing === "settings"}
          onOpenChange={(o) => setEditing(o ? "settings" : null)}
          actions={actions}
        />
      )}
    </div>
  );
}

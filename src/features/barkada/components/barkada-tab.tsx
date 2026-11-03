"use client";

import { useState } from "react";
import { PlusIcon, UsersRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-provider";
import { BarkadaBoard } from "@/features/barkada/components/barkada-board";
import { CreateBarkadaDialog } from "@/features/barkada/components/create-barkada-dialog";
import { JoinBarkadaDialog } from "@/features/barkada/components/join-barkada-dialog";
import { JoinCodeForm } from "@/features/barkada/components/join-code-form";
import { useBarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import { useMyBarkadas } from "@/features/barkada/hooks/use-my-barkadas";
import { BoardEmpty, LoadingRows } from "@/features/leaderboard/components/board-states";

const MAX_GROUPS = 5;

interface BarkadaTabProps {
  /** An invite from the URL (`?join=`), opened once. */
  invite: string | null;
  onInviteHandled: () => void;
}

/**
 * The Barkada tab: your friend groups (switch between up to five), or a way
 * to start one or join with a code. An invite link opens the join dialog.
 */
export function BarkadaTab({ invite, onInviteHandled }: BarkadaTabProps) {
  const uid = useAuth().user?.uid ?? null;
  const { groups, loading, error } = useMyBarkadas(uid);
  const actions = useBarkadaActions();
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [typed, setTyped] = useState<string | null>(null);
  const group = groups.find((g) => g.id === selected) ?? groups[0];
  const pending = invite ?? typed;

  const closeInvite = () => {
    if (invite) onInviteHandled();
    setTyped(null);
  };
  const open = (groupId: string) => {
    setSelected(groupId);
    closeInvite();
  };

  const dialogs = (
    <>
      <JoinBarkadaDialog invite={pending} onClose={closeInvite} actions={actions} onJoined={open} />
      <CreateBarkadaDialog open={creating} onOpenChange={setCreating} actions={actions} onCreated={setSelected} />
    </>
  );

  if (!uid || loading) return <LoadingRows />;
  if (error) {
    return (
      <BoardEmpty icon={<UsersRoundIcon />} title="Couldn't load your barkadas">
        Something went wrong. Please try again later.
      </BoardEmpty>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col gap-4">
        <BoardEmpty icon={<UsersRoundIcon />} title="Start a barkada challenge">
          Pick a goal for the term with your friends, like everyone on the Dean&apos;s List, and cheer each other on.
          You&apos;ll see each other&apos;s honor band, never your subjects or grades.
        </BoardEmpty>
        <Button className="self-center max-md:h-11" onClick={() => setCreating(true)}>
          <PlusIcon className="size-4" />
          Start a barkada
        </Button>
        <JoinCodeForm onJoin={setTyped} />
        {dialogs}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.length > 1 && (
        <Select value={group.id} onValueChange={setSelected}>
          <SelectTrigger aria-label="Your barkadas" className="w-full max-md:h-10 sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <BarkadaBoard key={group.id} group={group} uid={uid} actions={actions} />
      {groups.length < MAX_GROUPS && (
        <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <JoinCodeForm onJoin={setTyped} />
          </div>
          <Button variant="outline" className="max-md:h-10" onClick={() => setCreating(true)}>
            <PlusIcon className="size-4" />
            Start another
          </Button>
        </div>
      )}
      {dialogs}
    </div>
  );
}

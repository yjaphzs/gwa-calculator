"use client";

import { useEffect, useState } from "react";
import { UsersRoundIcon } from "lucide-react";

import { FormDialog } from "@/components/shared/form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-provider";
import { GwaShownField, NicknameField, WhatTheySee } from "@/features/barkada/components/entry-fields";
import type { BarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import { goalLabel } from "@/features/barkada/lib/barkada-rank";
import { defaultNickname } from "@/features/barkada/lib/default-term";
import { parseInviteCode } from "@/features/barkada/lib/invite";
import { previewBarkada, type BarkadaPreview } from "@/lib/firebase/callable";
import { getCallableErrorMessage } from "@/lib/firebase/errors";
import type { GwaShown } from "@/types";

interface JoinBarkadaDialogProps {
  /** The invite code or link to open; null keeps the dialog closed. */
  invite: string | null;
  onClose: () => void;
  actions: BarkadaActions;
  onJoined: (groupId: string) => void;
}

type Preview = { invite: string; data?: BarkadaPreview; error?: string };

/** Opens an invite: who's in it and what joining shares, then Join. */
export function JoinBarkadaDialog({ invite, onClose, actions, onJoined }: JoinBarkadaDialogProps) {
  const { user, profile } = useAuth();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [gwaShown, setGwaShown] = useState<GwaShown>("hidden");
  const code = invite ? parseInviteCode(invite) : null;

  useEffect(() => {
    if (!invite || !code) return;
    let cancelled = false;
    previewBarkada({ code }).then(
      ({ data }) => !cancelled && setPreview({ invite, data }),
      (err) => !cancelled && setPreview({ invite, error: getCallableErrorMessage(err) }),
    );
    return () => {
      cancelled = true;
    };
  }, [invite, code]);

  const current = invite && !code ? { invite, error: "That invite link doesn't look right." } : preview?.invite === invite ? preview : null;
  const data = current?.data;
  const full = !!data && !data.isMember && data.memberCount >= data.maxMembers;
  const shownNickname = nickname ?? defaultNickname(profile?.displayName ?? user?.displayName);

  const submit = async () => {
    if (!data || !code) return;
    if (data.isMember) return onJoined(data.groupId);
    const result = await actions.join(code, { nickname: shownNickname.trim(), gwaShown });
    if (result) onJoined(result.groupId);
  };

  return (
    <FormDialog
      open={invite !== null}
      onOpenChange={(open) => !open && onClose()}
      title={data ? `Join ${data.name}?` : "Barkada invite"}
      description="A barkada challenge: a shared goal for the term, and a friendly ranking."
      submitLabel={data?.isMember ? "Open it" : "Join barkada"}
      onSubmit={submit}
      processing={actions.busy}
      dirty={!!data && !full && (data.isMember || shownNickname.trim().length >= 1)}
    >
      {!current ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : current.error ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{current.error}</p>
      ) : data ? (
        <>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <UsersRoundIcon className="mt-0.5 size-5 shrink-0 text-chart-line" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{data.name}</p>
              <p className="text-muted-foreground">
                {data.ownerNickname ? `Started by ${data.ownerNickname} · ` : ""}
                {data.memberCount} of {data.maxMembers} members
              </p>
              <p className="mt-1">
                {goalLabel(data.goal)} for {data.termLabel}.
              </p>
            </div>
          </div>
          {data.isMember ? (
            <p className="text-sm text-muted-foreground">You&apos;re already in this barkada.</p>
          ) : full ? (
            <p className="text-sm text-muted-foreground">This barkada is full. Ask the owner to make room.</p>
          ) : (
            <>
              <NicknameField value={shownNickname} onChange={setNickname} />
              <GwaShownField value={gwaShown} onChange={setGwaShown} />
              <WhatTheySee />
            </>
          )}
        </>
      ) : null}
    </FormDialog>
  );
}

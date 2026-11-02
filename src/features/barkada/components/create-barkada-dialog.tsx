"use client";

import { useState } from "react";

import { FormDialog } from "@/components/shared/form-dialog";
import { useAuth } from "@/context/auth-provider";
import { ChallengeFields, type ChallengeValues } from "@/features/barkada/components/challenge-fields";
import { GwaShownField, NicknameField, WhatTheySee } from "@/features/barkada/components/entry-fields";
import type { BarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import { defaultNickname, defaultTerm } from "@/features/barkada/lib/default-term";
import type { GwaShown } from "@/types";

interface CreateBarkadaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: BarkadaActions;
  onCreated: (groupId: string) => void;
}

/** Start a barkada: a name, the term and goal, and how you appear in it. */
export function CreateBarkadaDialog({ open, onOpenChange, actions, onCreated }: CreateBarkadaDialogProps) {
  const { user, profile } = useAuth();
  const [values, setValues] = useState<ChallengeValues>(() => ({ name: "", goal: "deans-lister", ...defaultTerm(new Date()) }));
  // null until edited, so the profile name (which may load late) fills it in.
  const [nickname, setNickname] = useState<string | null>(null);
  const [gwaShown, setGwaShown] = useState<GwaShown>("hidden");
  const shownNickname = nickname ?? defaultNickname(profile?.displayName ?? user?.displayName);
  const ready = values.name.trim().length >= 2 && shownNickname.trim().length >= 1;

  const submit = async () => {
    const result = await actions.create({ ...values, name: values.name.trim(), nickname: shownNickname.trim(), gwaShown });
    if (!result) return;
    onCreated(result.groupId);
    onOpenChange(false);
    setValues((prev) => ({ ...prev, name: "" }));
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start a barkada"
      description="Challenge your friends this term. You'll get a link to invite them."
      submitLabel="Start barkada"
      onSubmit={submit}
      processing={actions.busy}
      dirty={ready}
    >
      <ChallengeFields values={values} onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))} />
      <NicknameField value={shownNickname} onChange={setNickname} />
      <GwaShownField value={gwaShown} onChange={setGwaShown} />
      <WhatTheySee />
    </FormDialog>
  );
}

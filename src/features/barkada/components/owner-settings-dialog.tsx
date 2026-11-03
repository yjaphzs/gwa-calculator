"use client";

import { useState } from "react";
import { toast } from "sonner";

import { FormDialog } from "@/components/shared/form-dialog";
import { ChallengeFields, type ChallengeValues } from "@/features/barkada/components/challenge-fields";
import { OwnerTools } from "@/features/barkada/components/owner-tools";
import type { BarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import { termFromKey } from "@/features/barkada/lib/default-term";
import type { BarkadaGroup } from "@/types";

interface OwnerSettingsDialogProps {
  group: BarkadaGroup;
  uid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: BarkadaActions;
}

const fromGroup = (group: BarkadaGroup): ChallengeValues => ({
  name: group.name,
  goal: group.goal,
  ...termFromKey(group.term.key, new Date()),
});

/** The owner's settings: name, term and goal, plus members, the invite link, and delete. */
export function OwnerSettingsDialog({ group, uid, open, onOpenChange, actions }: OwnerSettingsDialogProps) {
  const [draft, setDraft] = useState<ChallengeValues | null>(null);
  const saved = fromGroup(group);
  const values = draft ?? saved;
  const renamed = values.name.trim() !== saved.name;
  const regoaled = values.goal !== saved.goal;
  const retermed = values.schoolYear !== saved.schoolYear || values.semester !== saved.semester;

  const close = (next: boolean) => {
    if (!next) setDraft(null);
    onOpenChange(next);
  };

  const submit = async () => {
    // One call per change; stop at the first that fails (its toast says why).
    if (renamed && !(await actions.manage(group.id, { action: "rename", name: values.name.trim() }))) return;
    if (regoaled && !(await actions.manage(group.id, { action: "goal", goal: values.goal }))) return;
    if (retermed && !(await actions.manage(group.id, { action: "term", schoolYear: values.schoolYear, semester: values.semester }))) {
      return;
    }
    toast.success("Barkada updated");
    close(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title="Barkada settings"
      description="Changing the term starts a new challenge: everyone's entry comes from their semester for it."
      submitLabel="Save changes"
      onSubmit={submit}
      processing={actions.busy}
      dirty={(renamed || regoaled || retermed) && values.name.trim().length >= 2}
    >
      <ChallengeFields values={values} onChange={(patch) => setDraft({ ...values, ...patch })} />
      <OwnerTools group={group} uid={uid} actions={actions} onDeleted={() => close(false)} />
    </FormDialog>
  );
}

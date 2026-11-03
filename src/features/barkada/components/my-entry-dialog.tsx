"use client";

import { useState } from "react";
import { LogOutIcon } from "lucide-react";

import { FormDialog } from "@/components/shared/form-dialog";
import { ConfirmButton } from "@/features/barkada/components/confirm-button";
import { GwaShownField, NicknameField } from "@/features/barkada/components/entry-fields";
import type { BarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import type { BarkadaGroup, GwaShown } from "@/types";

interface MyEntryDialogProps {
  group: BarkadaGroup;
  uid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: BarkadaActions;
}

/** Your own entry: your nickname and how your GWA shows, or leave the barkada. */
export function MyEntryDialog({ group, uid, open, onOpenChange, actions }: MyEntryDialogProps) {
  const me = group.members[uid];
  const [draft, setDraft] = useState<{ nickname: string; gwaShown: GwaShown } | null>(null);
  const values = draft ?? { nickname: me?.nickname ?? "", gwaShown: me?.gwaShown ?? "hidden" };
  const changed = !!me && (values.nickname.trim() !== me.nickname || values.gwaShown !== me.gwaShown);

  const close = (next: boolean) => {
    if (!next) setDraft(null);
    onOpenChange(next);
  };

  const submit = async () => {
    if (!me) return;
    const patch = {
      ...(values.nickname.trim() !== me.nickname && { nickname: values.nickname.trim() }),
      ...(values.gwaShown !== me.gwaShown && { gwaShown: values.gwaShown }),
    };
    if (await actions.updateMe(group.id, patch)) close(false);
  };

  const leave = async () => {
    if (await actions.leave(group.id)) close(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title="You in this barkada"
      description={`How you appear in ${group.name}. Your entry comes from your saved semester for ${group.term.label}.`}
      submitLabel="Save"
      onSubmit={submit}
      processing={actions.busy}
      dirty={changed && values.nickname.trim().length >= 1}
    >
      <NicknameField value={values.nickname} onChange={(nickname) => setDraft({ ...values, nickname })} />
      <GwaShownField value={values.gwaShown} onChange={(gwaShown) => setDraft({ ...values, gwaShown })} />
      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm text-muted-foreground">Done with this one?</p>
        <ConfirmButton
          title={`Leave ${group.name}?`}
          description="Your entry is removed for everyone. If you're the owner, the member who joined first takes over; if you're the last one, the barkada is deleted."
          confirmLabel="Leave"
          onConfirm={leave}
          disabled={actions.busy}
          className="max-md:h-10"
        >
          <LogOutIcon className="size-4" />
          Leave barkada
        </ConfirmButton>
      </div>
    </FormDialog>
  );
}

"use client";

import { LinkIcon, Trash2Icon, UserMinusIcon } from "lucide-react";

import { ConfirmButton } from "@/features/barkada/components/confirm-button";
import type { BarkadaActions } from "@/features/barkada/hooks/use-barkada-actions";
import type { BarkadaGroup } from "@/types";

interface OwnerToolsProps {
  group: BarkadaGroup;
  uid: string;
  actions: BarkadaActions;
  onDeleted: () => void;
}

/** Remove members, replace the invite link, or delete the barkada. Each asks first. */
export function OwnerTools({ group, uid, actions, onDeleted }: OwnerToolsProps) {
  const others = group.memberUids.filter((id) => id !== uid && group.members[id]);

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Members</p>
          <ul className="flex flex-col divide-y rounded-lg border">
            {others.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{group.members[id].nickname}</span>
                <ConfirmButton
                  title={`Remove ${group.members[id].nickname}?`}
                  description="They leave the barkada and their entry is removed. They can rejoin only with the invite link."
                  confirmLabel="Remove"
                  onConfirm={() => actions.manage(group.id, { action: "remove", memberUid: id }, "Member removed")}
                  disabled={actions.busy}
                  className="max-md:h-10"
                >
                  <UserMinusIcon className="size-4" />
                  Remove
                </ConfirmButton>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <ConfirmButton
          title="Make a new invite link?"
          description="The current link and code stop working. Members already in stay in."
          confirmLabel="Make new link"
          destructive={false}
          onConfirm={() => actions.manage(group.id, { action: "new-code" }, "New invite link ready")}
          disabled={actions.busy}
          className="max-md:h-10"
        >
          <LinkIcon className="size-4" />
          New invite link
        </ConfirmButton>
        <ConfirmButton
          title={`Delete ${group.name}?`}
          description="The barkada and everyone's entries in it are deleted. This can't be undone."
          confirmLabel="Delete"
          onConfirm={async () => {
            if (await actions.manage(group.id, { action: "delete" }, "Barkada deleted")) onDeleted();
          }}
          disabled={actions.busy}
          className="text-destructive max-md:h-10"
        >
          <Trash2Icon className="size-4" />
          Delete barkada
        </ConfirmButton>
      </div>
    </div>
  );
}

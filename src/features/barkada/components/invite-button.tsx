"use client";

import { UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCode, inviteUrl } from "@/features/barkada/lib/invite";
import { shareUrl } from "@/features/share/lib/share-targets";

const INVITE_TEXT = "Sali ka sa barkada namin sa GWA Calculator!";

/** Phones get the share sheet (Messenger, group chats); desktops just copy the link. */
export function InviteButton({ code, disabled }: { code: string; disabled?: boolean }) {
  const invite = async () => {
    const url = inviteUrl(code, window.location.origin);
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && (await shareUrl(url, INVITE_TEXT)) !== "unsupported") return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied", { description: `Or give them the code ${formatCode(code)}.` });
    } catch {
      toast.error(`Couldn't copy the link. The code is ${formatCode(code)}.`);
    }
  };

  return (
    <Button size="sm" className="max-md:h-10" onClick={invite} disabled={disabled}>
      <UserPlusIcon className="size-4" />
      Invite
    </Button>
  );
}

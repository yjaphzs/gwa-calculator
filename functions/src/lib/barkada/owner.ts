import type { Timestamp } from "firebase-admin/firestore";

import type { BarkadaDoc } from "./types";

const joinedMillis = (group: BarkadaDoc, uid: string) =>
  (group.members?.[uid]?.joinedAt as Timestamp | undefined)?.toMillis?.() ?? 0;

/**
 * Who owns the group after `leaving` goes: the same owner, or (when the owner
 * leaves) the member who joined earliest. Null when nobody is left.
 */
export function nextOwner(group: BarkadaDoc, leaving: string): string | null {
  const rest = group.memberUids.filter((uid) => uid !== leaving);
  if (!rest.length) return null;
  if (group.ownerUid !== leaving) return group.ownerUid;
  return [...rest].sort((a, b) => joinedMillis(group, a) - joinedMillis(group, b))[0];
}

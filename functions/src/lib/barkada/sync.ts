import { FieldPath, FieldValue } from "firebase-admin/firestore";

import { memberResult, sameResult } from "./entry";
import { groupsOf } from "./store";
import type { BarkadaDoc, MemberResult, StoredSemester } from "./types";

/**
 * Field/value pairs that set a member's result, for `update(...)`. Callers add
 * `updatedAt` once: a field path may appear only once per update.
 */
export function resultFields(uid: string, result: MemberResult): unknown[] {
  return [
    new FieldPath("members", uid, "status"), result.status,
    new FieldPath("members", uid, "honor"), result.honor,
    new FieldPath("members", uid, "gwa"), result.gwa,
  ];
}

/**
 * Recomputes the user's entry in each of their barkadas after their saved
 * semesters change. Writes only to groups where the result actually moved.
 */
export async function syncBarkadaEntries(uid: string, semesters: StoredSemester[]): Promise<void> {
  const groups = await groupsOf(uid);
  await Promise.all(
    groups.map(async (snap) => {
      const group = snap.data() as BarkadaDoc;
      const me = group.members?.[uid];
      if (!me) return;
      const next = memberResult(semesters, group.term.key, me.gwaShown);
      if (sameResult(me, next)) return;
      const [field, value, ...rest] = [...resultFields(uid, next), "updatedAt", FieldValue.serverTimestamp()];
      await snap.ref.update(field as FieldPath, value, ...rest);
    }),
  );
}

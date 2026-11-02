import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { memberResult } from "../../lib/barkada/entry";
import { memberGroup, removeMember, semestersOf, uniqueCode } from "../../lib/barkada/store";
import { resultFields } from "../../lib/barkada/sync";
import type { BarkadaDoc } from "../../lib/barkada/types";
import {
  parseGoal,
  parseGroupId,
  parseName,
  parseTerm,
  requireUid,
  toHttpsError,
} from "../../lib/barkada/validate";

type Action = "rename" | "goal" | "term" | "remove" | "new-code" | "delete";
const ACTIONS: readonly Action[] = ["rename", "goal", "term", "remove", "new-code", "delete"];

/**
 * The owner's tools: rename, change the goal or term (every member's entry is
 * worked out again for the new term), remove a member, make a new invite link
 * (the old one stops working), or delete the group.
 */
export const manageBarkada = onCall(callableOptions, async (request) => {
  const uid = requireUid(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const groupId = parseGroupId(data.groupId);
  const action = data.action as Action;
  if (!ACTIONS.includes(action)) throw new HttpsError("invalid-argument", "Unknown action.");

  await enforceRateLimit({ key: `bk_manage_${uid}`, max: 30, windowSec: 3600 });

  try {
    const snap = await memberGroup(groupId, uid);
    const group = snap.data() as BarkadaDoc;
    if (group.ownerUid !== uid) throw new HttpsError("permission-denied", "Only the barkada's owner can do that.");
    const touch = ["updatedAt", FieldValue.serverTimestamp()] as const;

    switch (action) {
      case "rename":
        await snap.ref.update("name", parseName(data.name), ...touch);
        return { ok: true };
      case "goal":
        await snap.ref.update("goal", parseGoal(data.goal), ...touch);
        return { ok: true };
      case "term": {
        const term = parseTerm(data.schoolYear, data.semester);
        const fields: unknown[] = ["term", term];
        for (const member of group.memberUids) {
          const result = memberResult(await semestersOf(member), term.key, group.members[member].gwaShown);
          fields.push(...resultFields(member, result));
        }
        const [field, value, ...rest] = [...fields, ...touch];
        await snap.ref.update(field as string, value, ...rest);
        return { ok: true };
      }
      case "remove": {
        const member = typeof data.memberUid === "string" ? data.memberUid : "";
        if (member === uid || !group.memberUids.includes(member)) {
          throw new HttpsError("invalid-argument", "That member isn't in this barkada.");
        }
        await removeMember(groupId, member);
        return { ok: true };
      }
      case "new-code": {
        const code = await uniqueCode();
        await snap.ref.update("code", code, ...touch);
        return { ok: true, code };
      }
      case "delete":
        await snap.ref.delete();
        return { ok: true };
    }
  } catch (err) {
    throw toHttpsError(err, "manageBarkada", uid, "Couldn't update the barkada. Try again.");
  }
});

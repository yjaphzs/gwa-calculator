import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { requireUid, toHttpsError } from "../../lib/barkada/callable";
import { memberResult } from "../../lib/barkada/entry";
import { groupsOf, memberGroup, semestersOf } from "../../lib/barkada/store";
import { resultFields } from "../../lib/barkada/sync";
import type { BarkadaDoc } from "../../lib/barkada/types";
import {
  parseBadges,
  parseGroupId,
  parseGwaShown,
  parseNickname,
} from "../../lib/barkada/validate";

/**
 * Updates the caller's own entry: their nickname and how their GWA shows in
 * one group, and their badge count in every group they're in.
 */
export const updateBarkadaMember = onCall(callableOptions, async (request) => {
  const uid = requireUid(request);

  try {
    const data = (request.data ?? {}) as Record<string, unknown>;
    const groupId = data.groupId === undefined ? null : parseGroupId(data.groupId);
    const nickname = data.nickname === undefined ? null : parseNickname(data.nickname);
    const gwaShown = data.gwaShown === undefined ? null : parseGwaShown(data.gwaShown);
    const badges = data.badges === undefined ? null : parseBadges(data.badges);

    await enforceRateLimit({ key: `bk_update_${uid}`, max: 60, windowSec: 3600 });

    if (badges !== null) {
      const groups = await groupsOf(uid);
      await Promise.all(
        groups
          .filter((snap) => (snap.data() as BarkadaDoc).members?.[uid]?.badges !== badges)
          .map((snap) => snap.ref.update(new FieldPath("members", uid, "badges"), badges)),
      );
    }

    if (groupId && (nickname !== null || gwaShown !== null)) {
      const snap = await memberGroup(groupId, uid);
      const group = snap.data() as BarkadaDoc;
      const fields: unknown[] = [];
      if (nickname !== null) fields.push(new FieldPath("members", uid, "nickname"), nickname);
      if (gwaShown !== null && gwaShown !== group.members[uid].gwaShown) {
        // Showing or hiding the GWA changes what's stored, so work it out again.
        const result = memberResult(await semestersOf(uid), group.term.key, gwaShown);
        fields.push(new FieldPath("members", uid, "gwaShown"), gwaShown, ...resultFields(uid, result));
      }
      if (!fields.length) return { ok: true };
      fields.push("updatedAt", FieldValue.serverTimestamp());
      const [field, value, ...rest] = fields;
      await snap.ref.update(field as FieldPath, value, ...rest);
    }
    return { ok: true };
  } catch (err) {
    throw toHttpsError(err, "updateBarkadaMember", uid, "Couldn't save your changes. Try again.");
  }
});

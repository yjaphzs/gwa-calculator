import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { memberResult } from "../../lib/barkada/entry";
import { barkadas, groupsOf, semestersOf, uniqueCode } from "../../lib/barkada/store";
import { MAX_GROUPS, type BarkadaDoc } from "../../lib/barkada/types";
import {
  parseBadges,
  parseGoal,
  parseGwaShown,
  parseName,
  parseNickname,
  parseTerm,
  requireUid,
  toHttpsError,
} from "../../lib/barkada/validate";

/**
 * Starts a barkada for a term with a shared goal, the caller as owner and
 * first member. Returns the new group's id and invite code.
 */
export const createBarkada = onCall(callableOptions, async (request) => {
  const uid = requireUid(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const name = parseName(data.name);
  const term = parseTerm(data.schoolYear, data.semester);
  const goal = parseGoal(data.goal);
  const nickname = parseNickname(data.nickname);
  const gwaShown = parseGwaShown(data.gwaShown);
  const badges = parseBadges(data.badges);

  await enforceRateLimit({ key: `bk_create_${uid}`, max: 5, windowSec: 3600 });

  try {
    if ((await groupsOf(uid)).length >= MAX_GROUPS) {
      throw new HttpsError("failed-precondition", `You're already in ${MAX_GROUPS} barkadas. Leave one to start another.`);
    }
    const [code, semesters] = await Promise.all([uniqueCode(), semestersOf(uid)]);
    const ref = barkadas().doc();
    const now = FieldValue.serverTimestamp();
    const group: BarkadaDoc = {
      name,
      code,
      ownerUid: uid,
      goal,
      term,
      memberUids: [uid],
      members: { [uid]: { nickname, gwaShown, badges, ...memberResult(semesters, term.key, gwaShown), joinedAt: now } },
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(group);
    return { groupId: ref.id, code };
  } catch (err) {
    throw toHttpsError(err, "createBarkada", uid, "Couldn't start the barkada. Try again.");
  }
});

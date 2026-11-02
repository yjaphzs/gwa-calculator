import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { memberResult } from "../../lib/barkada/entry";
import { findByCode, groupsOf, semestersOf } from "../../lib/barkada/store";
import { MAX_GROUPS, MAX_MEMBERS, type BarkadaDoc, type BarkadaMember } from "../../lib/barkada/types";
import {
  parseBadges,
  parseCode,
  parseGwaShown,
  parseNickname,
  requireUid,
  toHttpsError,
} from "../../lib/barkada/validate";

/** Joins the barkada an invite code belongs to. Joining one you're already in just returns it. */
export const joinBarkada = onCall(callableOptions, async (request) => {
  const uid = requireUid(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const code = parseCode(data.code);
  const nickname = parseNickname(data.nickname);
  const gwaShown = parseGwaShown(data.gwaShown);
  const badges = parseBadges(data.badges);

  await enforceRateLimit({ key: `bk_join_${uid}`, max: 10, windowSec: 3600 });

  try {
    const snap = await findByCode(code);
    if (!snap) throw new HttpsError("not-found", "That invite isn't valid anymore. Ask your friend for a new link.");
    const [mine, semesters] = await Promise.all([groupsOf(uid), semestersOf(uid)]);
    if (mine.some((g) => g.id === snap.id)) return { groupId: snap.id };
    if (mine.length >= MAX_GROUPS) {
      throw new HttpsError("failed-precondition", `You're already in ${MAX_GROUPS} barkadas. Leave one to join this one.`);
    }

    await getFirestore().runTransaction(async (tx) => {
      const fresh = await tx.get(snap.ref);
      const group = fresh.data() as BarkadaDoc | undefined;
      // The owner may have made a new link (or deleted the group) since the lookup.
      if (!group || group.code !== code) {
        throw new HttpsError("not-found", "That invite isn't valid anymore. Ask your friend for a new link.");
      }
      if (group.memberUids.includes(uid)) return;
      if (group.memberUids.length >= MAX_MEMBERS) {
        throw new HttpsError("failed-precondition", `This barkada is full (${MAX_MEMBERS} members).`);
      }
      const member: BarkadaMember = {
        nickname,
        gwaShown,
        badges,
        ...memberResult(semesters, group.term.key, gwaShown),
        joinedAt: FieldValue.serverTimestamp(),
      };
      tx.update(
        snap.ref,
        "memberUids", FieldValue.arrayUnion(uid),
        new FieldPath("members", uid), member,
        "updatedAt", FieldValue.serverTimestamp(),
      );
    });
    return { groupId: snap.id };
  } catch (err) {
    throw toHttpsError(err, "joinBarkada", uid, "Couldn't join the barkada. Try again.");
  }
});

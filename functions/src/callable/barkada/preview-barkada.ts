import { HttpsError, onCall } from "firebase-functions/v2/https";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { requireUid, toHttpsError } from "../../lib/barkada/callable";
import { findByCode } from "../../lib/barkada/store";
import { MAX_MEMBERS, type BarkadaDoc } from "../../lib/barkada/types";
import { parseCode } from "../../lib/barkada/validate";

/**
 * What an invite leads to, before joining: the group's name, owner, term,
 * goal and size. Members' entries stay private until you're in.
 */
export const previewBarkada = onCall(callableOptions, async (request) => {
  const uid = requireUid(request);

  try {
    const code = parseCode((request.data as { code?: unknown } | undefined)?.code);

    await enforceRateLimit({ key: `bk_preview_${uid}`, max: 30, windowSec: 3600 });

    const snap = await findByCode(code);
    if (!snap) throw new HttpsError("not-found", "That invite isn't valid anymore. Ask your friend for a new link.");
    const group = snap.data() as BarkadaDoc;
    return {
      groupId: snap.id,
      name: group.name,
      ownerNickname: group.members?.[group.ownerUid]?.nickname ?? null,
      termLabel: group.term.label,
      goal: group.goal,
      memberCount: group.memberUids.length,
      maxMembers: MAX_MEMBERS,
      isMember: group.memberUids.includes(uid),
    };
  } catch (err) {
    throw toHttpsError(err, "previewBarkada", uid, "Couldn't open that invite. Try again.");
  }
});

import { onCall } from "firebase-functions/v2/https";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { requireUid, toHttpsError } from "../../lib/barkada/callable";
import { memberGroup, removeMember } from "../../lib/barkada/store";
import { parseGroupId } from "../../lib/barkada/validate";

/** Leaves a barkada. The owner's role passes to the earliest member; the last one out deletes it. */
export const leaveBarkada = onCall(callableOptions, async (request) => {
  const uid = requireUid(request);

  try {
    const groupId = parseGroupId((request.data as { groupId?: unknown } | undefined)?.groupId);

    await enforceRateLimit({ key: `bk_leave_${uid}`, max: 20, windowSec: 3600 });

    await memberGroup(groupId, uid);
    await removeMember(groupId, uid);
    return { left: true };
  } catch (err) {
    throw toHttpsError(err, "leaveBarkada", uid, "Couldn't leave the barkada. Try again.");
  }
});

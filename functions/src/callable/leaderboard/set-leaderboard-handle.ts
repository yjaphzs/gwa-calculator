import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { chooseLeaderboardHandle } from "../../lib/leaderboard";

/**
 * Sets a custom anonymous codename for the signed-in user's leaderboard entry.
 * Requires a verified email. The codename is validated + reserved server-side;
 * the previous one is released and any public board rows are republished under
 * the new handle.
 */
export const setLeaderboardHandle = onCall(callableOptions, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (!request.auth?.token.email_verified) {
    throw new HttpsError(
      "failed-precondition",
      "Verify your email to set a codename.",
    );
  }

  const data = (request.data ?? {}) as { handle?: unknown };
  if (typeof data.handle !== "string") {
    throw new HttpsError("invalid-argument", "`handle` must be a string.");
  }

  await enforceRateLimit({ key: `lb_handle_${uid}`, max: 10, windowSec: 3600 });

  try {
    return await chooseLeaderboardHandle(uid, data.handle);
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error("[setLeaderboardHandle] failed", { uid, err });
    throw new HttpsError("internal", "Couldn't update your codename.");
  }
});

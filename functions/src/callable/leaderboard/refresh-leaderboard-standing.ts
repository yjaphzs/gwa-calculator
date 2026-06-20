import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import { publishLeaderboardEntry } from "../../lib/leaderboard";

/**
 * Recomputes the signed-in user's cumulative standing and rewrites their public
 * leaderboard doc. Used by the "Update my standing" button. No-op unless the
 * user has already opted in (and still has a verified email).
 */
export const refreshLeaderboardStanding = onCall(
  callableOptions,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }
    if (!request.auth?.token.email_verified) {
      throw new HttpsError(
        "failed-precondition",
        "Verify your email to update your leaderboard standing.",
      );
    }

    await enforceRateLimit({ key: `lb_refresh_${uid}`, max: 30, windowSec: 3600 });

    const db = getFirestore();
    const settingsSnap = await db.doc(`users/${uid}/leaderboard/settings`).get();
    const settings = settingsSnap.exists ? settingsSnap.data() : null;
    if (!settings?.optIn) {
      throw new HttpsError(
        "failed-precondition",
        "You haven't joined the leaderboard yet.",
      );
    }

    try {
      const { handle } = await publishLeaderboardEntry(uid, {
        isAnonymous: settings.isAnonymous === true,
      });
      return { handle };
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error("[refreshLeaderboardStanding] failed", { uid, err });
      throw new HttpsError("internal", "Couldn't refresh your standing.");
    }
  },
);

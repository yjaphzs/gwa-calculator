import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";
import {
  publishLeaderboardEntry,
  removeLeaderboardEntry,
} from "../../lib/leaderboard";

/**
 * Joins, updates, or leaves the per-school leaderboard for the signed-in user.
 *
 * Participation requires a verified email. On opt-in we compute the user's
 * cumulative GWA from their saved calculator state (server-side) and publish a
 * privacy-respecting projection to `leaderboard/{handle}`; on opt-out we delete
 * that doc but keep the assigned handle for stability.
 */
export const setLeaderboardParticipation = onCall(
  callableOptions,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }
    if (!request.auth?.token.email_verified) {
      throw new HttpsError(
        "failed-precondition",
        "Verify your email to join the leaderboard.",
      );
    }

    const data = (request.data ?? {}) as {
      optIn?: unknown;
      isAnonymous?: unknown;
    };
    if (typeof data.optIn !== "boolean") {
      throw new HttpsError("invalid-argument", "`optIn` must be a boolean.");
    }
    const isAnonymous = data.isAnonymous === true;

    await enforceRateLimit({ key: `lb_set_${uid}`, max: 20, windowSec: 3600 });

    try {
      if (data.optIn) {
        const { handle } = await publishLeaderboardEntry(uid, { isAnonymous });
        return { optIn: true, handle };
      }
      await removeLeaderboardEntry(uid);
      return { optIn: false };
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error("[setLeaderboardParticipation] failed", { uid, err });
      throw new HttpsError("internal", "Couldn't update your leaderboard entry.");
    }
  },
);

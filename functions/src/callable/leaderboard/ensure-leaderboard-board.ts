import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { callableOptions } from "../../config";
import {
  BOARD_COLLECTION,
  rebuildSchoolBoard,
  SCHOOL_ID_PATTERN,
} from "../../lib/leaderboard-board";
import { enforceRateLimit } from "../../lib/rate-limit";

/**
 * Builds a school's precomputed board when it doesn't exist yet, e.g. a school
 * nobody has published to since boards were introduced, or a school with no
 * participants (it gets an empty board, so later views skip this call). The
 * page calls this only when its board snapshot comes back missing; afterwards
 * every publish keeps the board current. No-op when the board already exists.
 */
export const ensureLeaderboardBoard = onCall(callableOptions, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const schoolId = (request.data as { schoolId?: unknown } | undefined)?.schoolId;
  if (typeof schoolId !== "string" || !SCHOOL_ID_PATTERN.test(schoolId)) {
    throw new HttpsError("invalid-argument", "A valid school is required.");
  }

  await enforceRateLimit({ key: `lb_board_${uid}`, max: 30, windowSec: 3600 });

  const existing = await getFirestore().doc(`${BOARD_COLLECTION}/${schoolId}`).get();
  if (existing.exists) return { built: false };

  try {
    await rebuildSchoolBoard(schoolId);
  } catch (err) {
    logger.error("[ensureLeaderboardBoard] build failed", { schoolId, err });
    throw new HttpsError("internal", "Couldn't load this leaderboard. Please try again.");
  }
  return { built: true };
});

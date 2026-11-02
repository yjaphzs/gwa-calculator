import { getFirestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { REGION } from "../config";
import { syncBarkadaEntries } from "../lib/barkada/sync";
import {
  deletePublicEntries,
  publishLeaderboardEntry,
} from "../lib/leaderboard";

/**
 * Keeps the leaderboard and barkadas live: whenever a user's saved semesters
 * change (e.g. they save or edit a semester), their public board entries and
 * their entries in every barkada are recomputed automatically.
 *
 * Both derive only from saved `semesters`, so we skip the frequent working-set
 * / single-subject edits that don't affect them before any extra reads, to
 * keep this cheap on the common path. The two run side by side, each handling
 * its own errors, so one never skips the other.
 */
export const onCalculatorStateWritten = onDocumentWritten(
  { document: "users/{uid}/calculator/state", region: REGION, maxInstances: 5 },
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return; // state deleted (account deletion does its own cleanup)
    const before = event.data?.before?.data();

    const beforeSems = JSON.stringify(before?.semesters ?? []);
    const afterSems = JSON.stringify(after.semesters ?? []);
    if (before && beforeSems === afterSems) return; // semesters unchanged

    const uid = event.params.uid;
    await Promise.all([
      republishLeaderboard(uid),
      syncBarkadaEntries(uid, after.semesters ?? []).catch((err) =>
        logger.error("[onCalculatorStateWritten] barkada sync failed", { uid, err }),
      ),
    ]);
  },
);

/** Republishes the user's leaderboard entries, if they take part. */
async function republishLeaderboard(uid: string): Promise<void> {
  try {
    const settingsSnap = await getFirestore().doc(`users/${uid}/leaderboard/settings`).get();
    const settings = settingsSnap.exists ? settingsSnap.data() : null;
    if (!settings?.optIn) return; // not participating

    try {
      await publishLeaderboardEntry(uid, {
        isAnonymous: settings.isAnonymous === true,
      });
    } catch (err) {
      if (err instanceof HttpsError && err.code === "failed-precondition") {
        // No longer qualifies (dropped below min units, or school removed) —
        // pull the public entries but keep their opt-in for when they're back.
        if (typeof settings.handle === "string") {
          await deletePublicEntries(settings.handle).catch(() => undefined);
        }
        return;
      }
      throw err;
    }
  } catch (err) {
    logger.error("[onCalculatorStateWritten] republish failed", { uid, err });
  }
}

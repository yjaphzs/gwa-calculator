import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { callableOptions } from "../../config";
import { enforceRateLimit } from "../../lib/rate-limit";

/**
 * Permanently deletes the calling user's account:
 *   1. Firestore — the `users/{uid}/calculator/*` subdocs and the `users/{uid}`
 *      profile document.
 *   2. Storage   — everything under `users/{uid}/` (the profile photo).
 *   3. Auth      — the Firebase Auth user itself.
 *
 * Runs with Admin privileges so it can remove the auth user and bypass the
 * client-side "no self-delete" Firestore rule, keeping cleanup atomic.
 */
export const deleteAccount = onCall(callableOptions, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  // Anti-abuse cap (generous — allows retries on a partial failure).
  await enforceRateLimit({ key: `delacct_${uid}`, max: 5, windowSec: 3600 });

  const db = getFirestore();

  // 1. Firestore — calculator subcollection + profile doc.
  try {
    const calcSnap = await db.collection(`users/${uid}/calculator`).get();
    const batch = db.batch();
    calcSnap.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.doc(`users/${uid}`));
    await batch.commit();
  } catch (err) {
    logger.error("[deleteAccount] Firestore cleanup failed", { uid, err });
    throw new HttpsError("internal", "Failed to delete your data.");
  }

  // 2. Storage — profile photo(s) under users/{uid}/. Best-effort.
  try {
    await getStorage()
      .bucket()
      .deleteFiles({ prefix: `users/${uid}/` });
  } catch (err) {
    logger.warn("[deleteAccount] Storage cleanup failed (continuing)", {
      uid,
      err,
    });
  }

  // 3. Auth — delete the user last, once their data is gone.
  try {
    await getAuth().deleteUser(uid);
  } catch (err) {
    logger.error("[deleteAccount] Auth user deletion failed", { uid, err });
    throw new HttpsError("internal", "Failed to delete your account.");
  }

  return { success: true };
});

import { randomInt } from "node:crypto";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import {
  computeGwa,
  getAcademicHonor,
  getLatinHonor,
  HONOR_MIN_UNITS,
  LEADERBOARD_MIN_SEMESTERS,
  LEADERBOARD_MIN_UNITS,
  LEADERBOARD_SEMESTER_MIN_UNITS,
} from "./academic";
import { normalizeTerm } from "./term";

const HANDLE_PREFIX = "anonymous";
const HANDLE_REGISTRY = "leaderboardHandles";
const SUMMARY_COLLECTION = "leaderboard";
const SEMESTER_COLLECTION = "leaderboardSemesters";

interface Subject {
  grade: number;
  units: number;
}

interface Semester {
  schoolYear?: string;
  semester?: string;
  subjects?: Subject[];
}

/**
 * Reserves a unique anonymous handle (e.g. "anonymous2421") in the server-only
 * `leaderboardHandles` registry. Stable per user: assigned once and reused
 * across opt-out / opt-in cycles.
 */
async function assignHandle(
  db: FirebaseFirestore.Firestore,
  uid: string,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${HANDLE_PREFIX}${randomInt(1000, 1000000)}`;
    const ref = db.collection(HANDLE_REGISTRY).doc(candidate);
    const assigned = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) return null; // collision — retry with a new number
      tx.set(ref, { uid, createdAt: FieldValue.serverTimestamp() });
      return candidate;
    });
    if (assigned) return assigned;
  }
  throw new HttpsError(
    "internal",
    "Couldn't assign a leaderboard handle. Please try again.",
  );
}

/** Deletes every per-term semester entry belonging to a handle. */
async function deleteSemesterEntries(
  db: FirebaseFirestore.Firestore,
  handle: string,
): Promise<void> {
  const snap = await db
    .collection(SEMESTER_COLLECTION)
    .where("handle", "==", handle)
    .get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

/**
 * Removes a handle's public board entries (overall + all per-term) without
 * touching their private settings — used when a participant's data drops below
 * the threshold so their opt-in is preserved for when they qualify again.
 */
export async function deletePublicEntries(handle: string): Promise<void> {
  const db = getFirestore();
  await db.doc(`${SUMMARY_COLLECTION}/${handle}`).delete();
  await deleteSemesterEntries(db, handle);
}

/**
 * Computes the caller's standings and publishes them to the public boards:
 *   - the overall (academic-summary) entry at `leaderboard/{handle}` with Latin
 *     honors — only when the record is reasonably *complete* (at least
 *     {@link LEADERBOARD_MIN_SEMESTERS} saved semesters AND
 *     {@link LEADERBOARD_MIN_UNITS} cumulative units), and
 *   - one per-term entry at `leaderboardSemesters/{handle}__{termKey}` for each
 *     saved semester with at least {@link LEADERBOARD_SEMESTER_MIN_UNITS} units,
 *     with scholarship honors.
 *
 * GWAs are read from the user's actual saved calculator state (Admin SDK) so the
 * boards reflect what's stored, not whatever the client claims. Stale entries
 * (e.g. a semester the user deleted, or an overall entry that no longer
 * qualifies) are reconciled away.
 *
 * Throws `failed-precondition` when the profile has no school or the user
 * doesn't qualify for *any* board yet.
 */
export async function publishLeaderboardEntry(
  uid: string,
  opts: { isAnonymous: boolean },
): Promise<{ handle: string }> {
  const db = getFirestore();

  const profileSnap = await db.doc(`users/${uid}`).get();
  const profile = profileSnap.exists ? profileSnap.data() ?? {} : {};
  const schoolId = typeof profile.schoolId === "string" ? profile.schoolId : "";
  if (!schoolId) {
    throw new HttpsError(
      "failed-precondition",
      "Choose your school before joining the leaderboard.",
    );
  }

  const stateSnap = await db.doc(`users/${uid}/calculator/state`).get();
  const semesters: Semester[] = stateSnap.exists
    ? (stateSnap.data()?.semesters ?? [])
    : [];
  const allSubjects: Subject[] = semesters.flatMap((s) =>
    Array.isArray(s.subjects) ? s.subjects : [],
  );
  const { gwa, totalUnits } = computeGwa(allSubjects);

  // Evaluate each saved semester: count the non-empty ones (for the overall
  // "complete record" gate) and collect the ones that qualify for a term board.
  const semesterCandidates: {
    termKey: string;
    termLabel: string;
    gwa: number;
    totalUnits: number;
  }[] = [];
  let nonEmptySemesters = 0;
  for (const sem of semesters) {
    const subs = Array.isArray(sem.subjects) ? sem.subjects : [];
    const { gwa: sGwa, totalUnits: sUnits } = computeGwa(subs);
    if (sUnits > 0) nonEmptySemesters++;
    if (sGwa === null || sUnits < LEADERBOARD_SEMESTER_MIN_UNITS) continue;
    const term = normalizeTerm(
      String(sem.schoolYear ?? ""),
      String(sem.semester ?? ""),
    );
    semesterCandidates.push({
      termKey: term.key,
      termLabel: term.label,
      gwa: sGwa,
      totalUnits: sUnits,
    });
  }

  // The overall board represents a complete academic summary — it needs both a
  // full semester count and a full unit load.
  const overallQualifies =
    gwa !== null &&
    totalUnits >= LEADERBOARD_MIN_UNITS &&
    nonEmptySemesters >= LEADERBOARD_MIN_SEMESTERS;

  if (!overallQualifies && semesterCandidates.length === 0) {
    throw new HttpsError(
      "failed-precondition",
      `To appear on the leaderboard, save a semester with at least ${LEADERBOARD_SEMESTER_MIN_UNITS} units — or complete ${LEADERBOARD_MIN_SEMESTERS} semesters and ${LEADERBOARD_MIN_UNITS} units for the overall board.`,
    );
  }

  const settingsRef = db.doc(`users/${uid}/leaderboard/settings`);
  const settingsSnap = await settingsRef.get();
  const existingHandle =
    settingsSnap.exists && typeof settingsSnap.data()?.handle === "string"
      ? (settingsSnap.data()!.handle as string)
      : null;
  const handle = existingHandle ?? (await assignHandle(db, uid));

  // Shared identity projection — never leaks uid/email; respects anonymity.
  const identity = {
    handle,
    schoolId,
    schoolName:
      typeof profile.schoolName === "string" ? profile.schoolName : schoolId,
    schoolType: profile.schoolType === "university" ? "university" : "college",
    program:
      typeof profile.program === "string" && profile.program.trim()
        ? profile.program.trim()
        : null,
    displayName: opts.isAnonymous
      ? null
      : typeof profile.displayName === "string"
        ? profile.displayName
        : null,
    photoURL: opts.isAnonymous
      ? null
      : typeof profile.photoURL === "string"
        ? profile.photoURL
        : null,
    isAnonymous: opts.isAnonymous,
  };

  // 1. Overall entry — only when the record is complete enough; otherwise drop
  //    any stale one so an incomplete record never lingers on the overall board.
  if (overallQualifies && gwa !== null) {
    await db.doc(`${SUMMARY_COLLECTION}/${handle}`).set({
      ...identity,
      gwa,
      totalUnits,
      honor: totalUnits >= HONOR_MIN_UNITS ? getLatinHonor(gwa) : null,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await db.doc(`${SUMMARY_COLLECTION}/${handle}`).delete();
  }

  // 2. Per-term entries — scholarship honors, one per qualifying semester.
  const semesterEntries = new Map<string, Record<string, unknown>>();
  for (const c of semesterCandidates) {
    semesterEntries.set(`${handle}__${c.termKey}`, {
      ...identity,
      gwa: c.gwa,
      totalUnits: c.totalUnits,
      honor: getAcademicHonor(c.gwa),
      termKey: c.termKey,
      termLabel: c.termLabel,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Reconcile the per-term entries (set new, drop stale).
  const existing = await db
    .collection(SEMESTER_COLLECTION)
    .where("handle", "==", handle)
    .get();
  const batch = db.batch();
  existing.forEach((doc) => {
    if (!semesterEntries.has(doc.id)) batch.delete(doc.ref);
  });
  for (const [docId, data] of semesterEntries) {
    batch.set(db.collection(SEMESTER_COLLECTION).doc(docId), data);
  }
  await batch.commit();

  await settingsRef.set(
    {
      optIn: true,
      handle,
      isAnonymous: opts.isAnonymous,
      updatedAt: FieldValue.serverTimestamp(),
      lastPublishedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { handle };
}

/**
 * Removes the caller from every public board (overall + all per-term entries)
 * and flips their settings to opt-out. Keeps the handle + registry entry so they
 * get the same handle back if they rejoin.
 */
export async function removeLeaderboardEntry(uid: string): Promise<void> {
  const db = getFirestore();
  const settingsRef = db.doc(`users/${uid}/leaderboard/settings`);
  const settingsSnap = await settingsRef.get();
  const handle =
    settingsSnap.exists && typeof settingsSnap.data()?.handle === "string"
      ? (settingsSnap.data()!.handle as string)
      : null;

  if (handle) {
    try {
      await db.doc(`${SUMMARY_COLLECTION}/${handle}`).delete();
      await deleteSemesterEntries(db, handle);
    } catch (err) {
      logger.warn("[leaderboard] failed to delete public entries (continuing)", {
        uid,
        err,
      });
    }
  }

  await settingsRef.set(
    { optIn: false, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
}

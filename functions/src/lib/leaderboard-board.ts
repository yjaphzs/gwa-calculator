import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

/**
 * One precomputed document per school, `leaderboardBoards/{schoolId}`, holding
 * the ranked overall and per-term entries. The leaderboard page reads this
 * single doc (1 Firestore read per view) instead of querying up to 400 entry
 * docs per viewer, which keeps busy boards inside the free daily read quota.
 *
 * It is rebuilt whenever a school's public entries change (publish, leave,
 * codename change, account deletion), so it mirrors the entry collections.
 */
export const BOARD_COLLECTION = "leaderboardBoards";
const SUMMARY_COLLECTION = "leaderboard";
const SEMESTER_COLLECTION = "leaderboardSemesters";

/** Same caps the page used when it queried the entry collections directly. */
const OVERALL_LIMIT = 100;
const TERMS_LIMIT = 300;

/** School ids are slugs from the client's curated list (see src/config/schools.ts). */
export const SCHOOL_ID_PATTERN = /^[a-z0-9-]{1,120}$/;

/** Recomputes one school's board from the entry collections and stores it. */
export async function rebuildSchoolBoard(schoolId: string): Promise<void> {
  const db = getFirestore();
  const [overall, terms] = await Promise.all([
    db
      .collection(SUMMARY_COLLECTION)
      .where("schoolId", "==", schoolId)
      .orderBy("gwa", "asc")
      .limit(OVERALL_LIMIT)
      .get(),
    db
      .collection(SEMESTER_COLLECTION)
      .where("schoolId", "==", schoolId)
      .orderBy("gwa", "asc")
      .limit(TERMS_LIMIT)
      .get(),
  ]);
  await db.doc(`${BOARD_COLLECTION}/${schoolId}`).set({
    schoolId,
    overall: overall.docs.map((d) => d.data()),
    terms: terms.docs.map((d) => d.data()),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Rebuilds every affected school's board. Best-effort: a stale board must never
 * fail the user's action, and the next change to that school rebuilds it.
 */
export async function rebuildSchoolBoards(schoolIds: Iterable<string>): Promise<void> {
  const unique = [...new Set(schoolIds)].filter((id) => SCHOOL_ID_PATTERN.test(id));
  await Promise.all(
    unique.map((id) =>
      rebuildSchoolBoard(id).catch((err) =>
        logger.error("[leaderboard] board rebuild failed", { schoolId: id, err }),
      ),
    ),
  );
}

/**
 * The schools a handle currently appears in (overall + per-term entries). Read
 * before entries are changed or deleted so the boards they leave get rebuilt.
 */
export async function schoolsOfHandle(handle: string): Promise<Set<string>> {
  const db = getFirestore();
  const [summary, semesters] = await Promise.all([
    db.doc(`${SUMMARY_COLLECTION}/${handle}`).get(),
    db.collection(SEMESTER_COLLECTION).where("handle", "==", handle).get(),
  ]);
  const schools = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value) schools.add(value);
  };
  add(summary.data()?.schoolId);
  semesters.forEach((doc) => add(doc.data().schoolId));
  return schools;
}

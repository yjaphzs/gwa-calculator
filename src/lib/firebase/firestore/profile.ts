import {
  doc,
  collection,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from './client';
import type { User } from './auth';
import type {
  CalculatorState,
  LeaderboardEntry,
  LeaderboardSemesterEntry,
  LeaderboardSettings,
  UserProfile,
} from '@/types';

// ── Document references ─────────────────────────────────────────────────────
export function userProfileRef(uid: string): DocumentReference {
  return doc(db, 'users', uid);
}

export function calculatorStateRef(uid: string): DocumentReference {
  return doc(db, 'users', uid, 'calculator', 'state');
}

// ── Profile ─────────────────────────────────────────────────────────────────
/** Reads the profile document once. Returns null if it doesn't exist yet. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userProfileRef(uid));
  return snap.exists() ? ({ uid, ...snap.data() } as UserProfile) : null;
}

/**
 * Creates the profile document on first sign-in if it's missing. Idempotent —
 * safe to call after every login. Returns nothing; the live subscription in the
 * AuthProvider picks up the change.
 */
export async function ensureUserProfile(user: User): Promise<void> {
  const ref = userProfileRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    email: user.email ?? '',
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Merges fields into the profile document. */
export async function updateUserProfile(
  uid: string,
  data: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'photoURL'
      | 'email'
      | 'schoolId'
      | 'schoolName'
      | 'schoolType'
      | 'program'
    >
  >,
): Promise<void> {
  await setDoc(
    userProfileRef(uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
/** Private per-user leaderboard settings doc (server-written, owner-readable). */
export function leaderboardSettingsRef(uid: string): DocumentReference {
  return doc(db, 'users', uid, 'leaderboard', 'settings');
}

/**
 * Live subscription to the caller's own leaderboard settings (opt-in state +
 * assigned handle). Returns the unsubscribe function. Yields null while no
 * settings doc exists yet (user has never opted in).
 */
export function subscribeLeaderboardSettings(
  uid: string,
  callback: (settings: LeaderboardSettings | null) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    leaderboardSettingsRef(uid),
    (snap) => callback(snap.exists() ? (snap.data() as LeaderboardSettings) : null),
    (err) => {
      console.error('[firestore] leaderboard settings snapshot error:', err);
      onError?.(err);
    },
  );
}

/**
 * Live subscription to a school's overall (cumulative) board, ranked by GWA
 * ascending (1.00 = best). Updates in realtime as participants' entries change.
 * Requires the composite index in firestore.indexes.json. Returns the
 * unsubscribe function.
 */
export function subscribeLeaderboard(
  schoolId: string,
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (err: Error) => void,
  max = 100,
): () => void {
  const q = query(
    collection(db, 'leaderboard'),
    where('schoolId', '==', schoolId),
    orderBy('gwa', 'asc'),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as LeaderboardEntry)),
    (err) => {
      console.error('[firestore] leaderboard snapshot error:', err);
      onError?.(err);
    },
  );
}

/**
 * Live subscription to a school's per-term entries (all terms), ranked by GWA
 * ascending. The caller groups them by `termKey` to build the per-semester
 * boards. Returns the unsubscribe function.
 */
export function subscribeSemesterLeaderboard(
  schoolId: string,
  callback: (entries: LeaderboardSemesterEntry[]) => void,
  onError?: (err: Error) => void,
  max = 300,
): () => void {
  const q = query(
    collection(db, 'leaderboardSemesters'),
    where('schoolId', '==', schoolId),
    orderBy('gwa', 'asc'),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) =>
      callback(snap.docs.map((d) => d.data() as LeaderboardSemesterEntry)),
    (err) => {
      console.error('[firestore] semester leaderboard snapshot error:', err);
      onError?.(err);
    },
  );
}

// ── Calculator state ─────────────────────────────────────────────────────────
const EMPTY_STATE: CalculatorState = {
  subjects: [],
  semesters: [],
  autosave: true,
};

/** Reads the calculator state once. Returns null when nothing is saved yet. */
export async function getCalculatorState(
  uid: string,
): Promise<CalculatorState | null> {
  const snap = await getDoc(calculatorStateRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    semesters: Array.isArray(data.semesters) ? data.semesters : [],
    autosave: typeof data.autosave === 'boolean' ? data.autosave : true,
  };
}

/**
 * Writes the calculator state. Accepts a partial so callers can persist only
 * some fields (e.g. semesters + autosave while leaving subjects untouched when
 * autosave is off) — the write is a merge, so omitted fields are preserved.
 */
export async function writeCalculatorState(
  uid: string,
  state: Partial<CalculatorState>,
): Promise<void> {
  await setDoc(
    calculatorStateRef(uid),
    { ...state, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export interface SnapshotMeta {
  /** True when this snapshot reflects this client's own un-acknowledged write
   *  (latency compensation) — i.e. an echo of a local change, not a remote one. */
  hasPendingWrites: boolean;
}

/**
 * Live subscription to the calculator state. Invokes `callback` with the
 * current state (or the empty default when no document exists yet) plus the
 * snapshot metadata, so callers can distinguish remote changes from the echo
 * of their own local writes.
 */
export function subscribeCalculatorState(
  uid: string,
  callback: (state: CalculatorState, meta: SnapshotMeta) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    calculatorStateRef(uid),
    (snap) => {
      const meta: SnapshotMeta = { hasPendingWrites: snap.metadata.hasPendingWrites };
      if (!snap.exists()) {
        callback(EMPTY_STATE, meta);
        return;
      }
      const data = snap.data();
      callback(
        {
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
          semesters: Array.isArray(data.semesters) ? data.semesters : [],
          autosave: typeof data.autosave === 'boolean' ? data.autosave : true,
        },
        meta,
      );
    },
    (err) => {
      console.error('[firestore] calculator snapshot error:', err);
      onError?.(err);
    },
  );
}

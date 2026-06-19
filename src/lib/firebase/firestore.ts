import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from './client';
import type { User } from './auth';
import type { CalculatorState, UserProfile } from '@/types';

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
  data: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'email'>>,
): Promise<void> {
  await setDoc(
    userProfileRef(uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
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

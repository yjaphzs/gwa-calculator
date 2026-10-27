import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '../client';
import type { CalculatorState } from '@/types';

const EMPTY_STATE: CalculatorState = {
  subjects: [],
  semesters: [],
  autosave: true,
};

export function calculatorStateRef(uid: string): DocumentReference {
  return doc(db, 'users', uid, 'calculator', 'state');
}

/** Coerce a stored document into a well-formed state (missing fields → defaults). */
function normalizeCalculatorState(data: DocumentData): CalculatorState {
  return {
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    semesters: Array.isArray(data.semesters) ? data.semesters : [],
    autosave: typeof data.autosave === 'boolean' ? data.autosave : true,
  };
}

/** Reads the calculator state once. Returns null when nothing is saved yet. */
export async function getCalculatorState(uid: string): Promise<CalculatorState | null> {
  const snap = await getDoc(calculatorStateRef(uid));
  return snap.exists() ? normalizeCalculatorState(snap.data()) : null;
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
  await setDoc(calculatorStateRef(uid), { ...state, updatedAt: serverTimestamp() }, { merge: true });
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
      callback(snap.exists() ? normalizeCalculatorState(snap.data()) : EMPTY_STATE, meta);
    },
    (err) => {
      console.error('[firestore] calculator snapshot error:', err);
      onError?.(err);
    },
  );
}

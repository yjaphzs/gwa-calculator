import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '../client';
import type { LeaderboardEntry, LeaderboardSemesterEntry, LeaderboardSettings } from '@/types';

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

/** A school's board in `collectionName`, ranked by GWA ascending (1.00 = best). */
function subscribeRanked<T>(
  collectionName: string,
  label: string,
  schoolId: string,
  callback: (entries: T[]) => void,
  onError: ((err: Error) => void) | undefined,
  max: number,
): () => void {
  const q = query(
    collection(db, collectionName),
    where('schoolId', '==', schoolId),
    orderBy('gwa', 'asc'),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as T)),
    (err) => {
      console.error(`[firestore] ${label} snapshot error:`, err);
      onError?.(err);
    },
  );
}

/**
 * Live subscription to a school's overall (cumulative) board. Updates in
 * realtime as participants' entries change. Requires the composite index in
 * firestore.indexes.json. Returns the unsubscribe function.
 */
export function subscribeLeaderboard(
  schoolId: string,
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (err: Error) => void,
  max = 100,
): () => void {
  return subscribeRanked('leaderboard', 'leaderboard', schoolId, callback, onError, max);
}

/**
 * Live subscription to a school's per-term entries (all terms). The caller
 * groups them by `termKey` to build the per-semester boards. Returns the
 * unsubscribe function.
 */
export function subscribeSemesterLeaderboard(
  schoolId: string,
  callback: (entries: LeaderboardSemesterEntry[]) => void,
  onError?: (err: Error) => void,
  max = 300,
): () => void {
  return subscribeRanked(
    'leaderboardSemesters',
    'semester leaderboard',
    schoolId,
    callback,
    onError,
    max,
  );
}

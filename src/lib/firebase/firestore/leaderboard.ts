import { doc, onSnapshot, type DocumentReference } from 'firebase/firestore';
import { db } from '../client';
import type { LeaderboardBoard, LeaderboardSettings } from '@/types';

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
 * Live subscription to a school's precomputed board (`leaderboardBoards/{id}`):
 * overall and per-term entries in one doc, rebuilt server-side whenever the
 * school's entries change. Yields null while the board doesn't exist yet (the
 * caller then asks the server to build it). Returns the unsubscribe function.
 */
export function subscribeLeaderboardBoard(
  schoolId: string,
  callback: (board: LeaderboardBoard | null) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, 'leaderboardBoards', schoolId),
    (snap) => callback(snap.exists() ? (snap.data() as LeaderboardBoard) : null),
    (err) => {
      console.error('[firestore] leaderboard board snapshot error:', err);
      onError?.(err);
    },
  );
}

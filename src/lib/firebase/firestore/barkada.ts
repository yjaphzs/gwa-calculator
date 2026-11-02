import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../client';
import type { BarkadaGroup } from '@/types';

/**
 * Live subscription to every barkada the user is in (at most 5, so at most 5
 * reads to open, plus one per change). The query must filter on memberUids:
 * the rules only let members read a group. Returns the unsubscribe function.
 */
export function subscribeMyBarkadas(
  uid: string,
  callback: (groups: BarkadaGroup[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    query(collection(db, 'barkadas'), where('memberUids', 'array-contains', uid)),
    (snap) => callback(snap.docs.map((d) => ({ ...(d.data() as Omit<BarkadaGroup, 'id'>), id: d.id }))),
    (err) => {
      console.error('[firestore] barkadas snapshot error:', err);
      onError?.(err);
    },
  );
}

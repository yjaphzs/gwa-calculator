import { doc, getDoc, serverTimestamp, setDoc, type DocumentReference } from 'firebase/firestore';
import { db } from '../client';
import type { User } from '../auth';
import type { UserProfile } from '@/types';

export function userProfileRef(uid: string): DocumentReference {
  return doc(db, 'users', uid);
}

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
      'displayName' | 'photoURL' | 'email' | 'schoolId' | 'schoolName' | 'schoolType' | 'program'
    >
  >,
): Promise<void> {
  await setDoc(userProfileRef(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

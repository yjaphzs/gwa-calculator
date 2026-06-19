import {
  signInWithEmailAndPassword,
  signOut as _signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as _updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { auth } from './client';

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return _signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/** Sends a "verify your email" link to the currently signed-in user. */
export async function sendVerificationEmail(user: User) {
  return sendEmailVerification(user);
}

/** Updates the signed-in user's display name and/or photo URL. */
export async function updateProfile(
  user: User,
  data: { displayName?: string | null; photoURL?: string | null },
) {
  return _updateProfile(user, data);
}

/**
 * Changes the signed-in user's password. Sensitive operations require a recent
 * login, so callers should `reauthenticate()` first when Firebase throws
 * `auth/requires-recent-login`.
 */
export async function changePassword(user: User, newPassword: string) {
  return updatePassword(user, newPassword);
}

/** Re-confirms the user's password — required before delete / change password. */
export async function reauthenticate(user: User, password: string) {
  if (!user.email) throw new Error('No email on this account to reauthenticate.');
  const credential = EmailAuthProvider.credential(user.email, password);
  return reauthenticateWithCredential(user, credential);
}

/** True when the account has at least one password (email/password) provider. */
export function hasPasswordProvider(user: User) {
  return user.providerData.some((p) => p.providerId === 'password');
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };

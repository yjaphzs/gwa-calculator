import { httpsCallable } from 'firebase/functions';
import { functions } from './client';

/**
 * Permanently deletes the signed-in user's account: their Firestore profile +
 * calculator data, their Storage avatar, and their Firebase Auth user. The
 * heavy lifting runs in the `deleteAccount` Cloud Function (Admin SDK) so the
 * cleanup is atomic and can remove the auth user itself.
 *
 * The caller should have re-authenticated recently; after this resolves, sign
 * the user out client-side.
 */
export const deleteAccount = httpsCallable<void, { success: boolean }>(
  functions,
  'deleteAccount',
);

/**
 * Sends a branded "verify your email" message to the signed-in user via the
 * Cloud Function (which generates the link and emails it over SMTP). The link
 * points at the in-app /auth/action handler.
 */
export const requestEmailVerification = httpsCallable<void, { submitted: boolean }>(
  functions,
  'sendVerificationEmail',
);

/**
 * Sends a branded password-reset email. Public (used from /forgot-password while
 * signed out). Always resolves with { submitted: true } — it never reveals
 * whether an account exists for the address.
 */
export const requestPasswordReset = httpsCallable<
  { email: string },
  { submitted: boolean }
>(functions, 'sendPasswordResetEmail');

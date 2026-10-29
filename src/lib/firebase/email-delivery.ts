import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

import { requestEmailVerification, requestPasswordReset } from './callable';
import { auth } from './client';

// Branded emails go out through the Cloud Functions (Resend). Resend's free
// plan caps sends at 100 a day, so on a busy day the functions signal a
// fallback and these helpers ask Firebase Auth to send its built-in email
// instead (free; plainer template, same /auth/action flow).

/** True when a callable error asks for Firebase's built-in email. */
function shouldFallBack(err: unknown): boolean {
  const details = (err as { details?: { fallback?: unknown } } | null)?.details;
  return details?.fallback === 'firebase';
}

/** Where the user lands after completing the emailed action. */
const continueTo = (path: string) => ({ url: `${window.location.origin}${path}` });

/** Sends the signed-in user a "verify your email" message. */
export async function deliverVerificationEmail(): Promise<void> {
  try {
    await requestEmailVerification();
  } catch (err) {
    const user = auth.currentUser;
    if (!shouldFallBack(err) || !user) throw err;
    await sendEmailVerification(user, continueTo('/account'));
  }
}

/**
 * Requests a password-reset email. Resolves the same way whether or not an
 * account exists, so the form never reveals which addresses are registered.
 */
export async function deliverPasswordReset(email: string): Promise<void> {
  const { data } = await requestPasswordReset({ email });
  if (!data.fallback) return;
  // Errors (e.g. no such account) are swallowed for the same reason.
  await sendPasswordResetEmail(auth, email, continueTo('/login')).catch(() => undefined);
}

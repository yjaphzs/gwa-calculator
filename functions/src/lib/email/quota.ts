import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Resend's free plan caps sends (100/day, 3,000/month). When it refuses a send
 * for quota reasons we remember it for a while and tell the client to fall back
 * to Firebase Auth's built-in emails, so verification and password resets keep
 * working on busy days instead of failing.
 *
 * Resend error name → how long to stop trying Resend, in seconds.
 */
const QUOTA_BACKOFF: Record<string, number> = {
  rate_limit_exceeded: 60,
  daily_quota_exceeded: 60 * 60,
  monthly_quota_exceeded: 6 * 60 * 60,
};

/** Server-only doc in the rate-limit collection, which the rules deny to clients. */
const QUOTA_DOC = "rateLimits/email_quota";

export class EmailQuotaError extends Error {
  constructor(readonly code: string) {
    super(`Email provider quota reached (${code}).`);
    this.name = "EmailQuotaError";
  }
}

/** The quota error for a Resend error name, or null for any other failure. */
export function quotaErrorFor(name: string | undefined): EmailQuotaError | null {
  return name && name in QUOTA_BACKOFF ? new EmailQuotaError(name) : null;
}

export async function isEmailQuotaExhausted(): Promise<boolean> {
  const until = (await getFirestore().doc(QUOTA_DOC).get()).data()?.exhaustedUntil;
  return until instanceof Timestamp && until.toMillis() > Date.now();
}

/** Best-effort: a failed write only means the next request tries Resend again. */
export async function markEmailQuotaExhausted(err: EmailQuotaError): Promise<void> {
  const seconds = QUOTA_BACKOFF[err.code] ?? 60 * 60;
  await getFirestore()
    .doc(QUOTA_DOC)
    .set({ code: err.code, exhaustedUntil: Timestamp.fromMillis(Date.now() + seconds * 1000) })
    .catch(() => undefined);
}

/**
 * Tells the client to send Firebase's built-in email instead. The client checks
 * `details.fallback === "firebase"` (see src/lib/firebase/email-delivery.ts).
 */
export function emailFallbackError(): HttpsError {
  return new HttpsError("unavailable", "Email service is busy.", { fallback: "firebase" });
}

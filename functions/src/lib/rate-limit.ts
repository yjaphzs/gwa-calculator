import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

const COLLECTION = "rateLimits";

export interface RateLimitOptions {
  /** Unique bucket key (e.g. `pwreset_email_<addr>` or `pwreset_ip_<ip>`). */
  key: string;
  /** Max allowed requests within the window. */
  max: number;
  /** Window length in seconds. */
  windowSec: number;
}

/**
 * Fixed-window rate limiter backed by Firestore. Throws `resource-exhausted`
 * once a bucket exceeds `max` requests within `windowSec`. Buckets carry an
 * `expireAt` field so a Firestore TTL policy can sweep them automatically.
 *
 * The `rateLimits` collection is server-only (Firestore rules deny all client
 * access); only the Admin SDK here touches it.
 */
export async function enforceRateLimit({
  key,
  max,
  windowSec,
}: RateLimitOptions): Promise<void> {
  const db = getFirestore();
  const docId = key.replace(/[/\s]+/g, "_").slice(0, 400);
  const ref = db.collection(COLLECTION).doc(docId);
  const windowMs = windowSec * 1000;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.exists
      ? (snap.data() as { count?: number; windowStart?: number })
      : null;

    if (data?.windowStart && now - data.windowStart < windowMs) {
      if ((data.count ?? 0) >= max) {
        throw new HttpsError(
          "resource-exhausted",
          "Too many requests. Please try again in a little while.",
        );
      }
      tx.update(ref, {
        count: FieldValue.increment(1),
        expireAt: new Date(data.windowStart + windowMs),
      });
    } else {
      tx.set(ref, {
        count: 1,
        windowStart: now,
        expireAt: new Date(now + windowMs),
      });
    }
  });
}

/** Best-effort client IP from a callable request (behind Google's proxy). */
export function getClientIp(request: CallableRequest<unknown>): string {
  const raw = request.rawRequest;
  const xff = raw?.headers?.["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  if (Array.isArray(xff) && xff.length) return String(xff[0]).trim();
  return raw?.ip ?? "unknown";
}

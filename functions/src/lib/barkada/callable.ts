import { logger } from "firebase-functions/v2";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

import { InputError } from "./validate";

/** The caller's uid; every barkada callable needs a signed-in user (a verified email isn't required). */
export function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "You must be signed in.");
  return uid;
}

/**
 * Lets intended errors through and turns bad input into `invalid-argument`;
 * anything else is logged and replaced with a friendly message.
 */
export function toHttpsError(err: unknown, where: string, uid: string, message: string): HttpsError {
  if (err instanceof HttpsError) return err;
  if (err instanceof InputError) return new HttpsError("invalid-argument", err.message);
  logger.error(`[${where}] failed`, { uid, err: err instanceof Error ? err.message : String(err) });
  return new HttpsError("internal", message);
}

import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { APP_URL, callableOptions } from "../../config";
import { buildInAppActionUrl } from "../../lib/action-links";
import { sendEmail } from "../../lib/email/send";
import { verificationEmailTemplate } from "../../lib/email/templates";
import { enforceRateLimit } from "../../lib/rate-limit";

/**
 * Sends a branded "verify your email" message to the signed-in user. Generates
 * a Firebase verification oobCode, rewrites the link to the in-app
 * /auth/action handler, and emails it over SMTP. No-op (still returns success)
 * if the address is already verified.
 */
export const sendVerificationEmail = onCall(callableOptions, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const email = request.auth?.token.email as string | undefined;
  if (!email) {
    throw new HttpsError(
      "failed-precondition",
      "This account has no email address to verify.",
    );
  }

  if (request.auth?.token.email_verified) {
    return { submitted: true };
  }

  // Cap how often a user can trigger verification emails to themselves.
  await enforceRateLimit({ key: `verify_${uid}`, max: 6, windowSec: 3600 });

  try {
    const firebaseLink = await getAuth().generateEmailVerificationLink(email, {
      url: `${APP_URL}/account`,
      handleCodeInApp: true,
    });
    const verifyUrl = buildInAppActionUrl(firebaseLink, APP_URL);
    const { subject, html, text } = verificationEmailTemplate(verifyUrl);
    await sendEmail({ to: email, subject, html, text });
  } catch (err) {
    logger.error("[sendVerificationEmail] failed:", err);
    throw new HttpsError("internal", "Couldn't send the verification email.");
  }

  return { submitted: true };
});

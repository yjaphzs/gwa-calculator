import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { APP_URL, callableOptions } from "../../config";
import { buildInAppActionUrl } from "../../lib/action-links";
import { sendEmail } from "../../lib/email/send";
import { passwordResetEmailTemplate } from "../../lib/email/templates";
import { enforceRateLimit, getClientIp } from "../../lib/rate-limit";

interface SendPasswordResetEmailData {
  email: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public callable (used from /forgot-password while signed out). Generates a
 * Firebase password-reset oobCode, rewrites the link to the in-app
 * /auth/action handler, and emails it over SMTP. Always returns
 * { submitted: true } so it never reveals whether an account exists.
 */
export const sendPasswordResetEmail = onCall<SendPasswordResetEmailData>(
  callableOptions,
  async (request) => {
    const email = (request.data?.email ?? "").trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new HttpsError(
        "invalid-argument",
        "A valid email address is required.",
      );
    }

    // Throttle abuse: cap per-IP (catches spraying many addresses) and
    // per-address (caps repeated requests to one inbox). Applied before any
    // existence check so it never leaks whether the account exists.
    await enforceRateLimit({
      key: `pwreset_ip_${getClientIp(request)}`,
      max: 15,
      windowSec: 3600,
    });
    await enforceRateLimit({
      key: `pwreset_email_${email}`,
      max: 5,
      windowSec: 3600,
    });

    try {
      const user = await getAuth()
        .getUserByEmail(email)
        .catch(() => null);

      if (user) {
        const firebaseLink = await getAuth().generatePasswordResetLink(email, {
          url: `${APP_URL}/login`,
          handleCodeInApp: true,
        });
        const resetUrl = buildInAppActionUrl(firebaseLink, APP_URL);
        const { subject, html, text } = passwordResetEmailTemplate(resetUrl);
        await sendEmail({ to: email, subject, html, text });
      }
    } catch (err) {
      // Swallow errors so the response is identical whether or not the email
      // exists (prevents account enumeration). Failures are logged for ops.
      logger.error("[sendPasswordResetEmail] failed to send:", err);
    }

    return { submitted: true };
  },
);

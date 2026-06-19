import { logger } from "firebase-functions/v2";
import { APP_NAME } from "../../config";
import { getResend } from "./client";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Subject prefix marking non-production sends. Anything that isn't explicitly
 * `production` gets a bracketed env tag so staging/dev emails are unmistakable.
 * Reads `FUNCTIONS_ENV` (set from NEXT_PUBLIC_APP_ENV at deploy).
 */
function envSubjectPrefix(): string {
  const env = (process.env.FUNCTIONS_ENV ?? "").trim().toLowerCase();
  if (!env || env === "production" || env === "prod") return "";
  return `[${env.toUpperCase()}] `;
}

/** Sends a transactional email via Resend (https://resend.com/docs/send-with-nodejs). */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<void> {
  const fromName = process.env.EMAIL_FROM_NAME ?? APP_NAME;
  // Falls back to Resend's shared test sender (only delivers to your own
  // account email until your domain is verified in Resend).
  const fromEmail = process.env.EMAIL_FROM_EMAIL ?? "onboarding@resend.dev";
  const from = `${fromName} <${fromEmail}>`;
  const finalSubject = `${envSubjectPrefix()}${subject}`;

  if (!process.env.RESEND_API_KEY) {
    logger.error("[email] RESEND_API_KEY is not set — cannot send email.");
    throw new Error("Email service is not configured.");
  }

  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject: finalSubject,
    html,
    text,
  });

  if (error) {
    logger.error(`[email] FAILED → to=${to} subject="${finalSubject}"`, error);
    throw new Error(`Email send failed: ${error.message ?? "unknown error"}`);
  }

  logger.info(
    `[email] sent → to=${to} subject="${subject}" id=${data?.id ?? "?"}`,
  );
}

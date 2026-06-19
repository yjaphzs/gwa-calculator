import Handlebars from "handlebars";

import { APP_NAME, APP_URL } from "../../config";
import {
  PASSWORD_RESET_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
} from "./generated-templates";

// Templates are pre-compiled at module load — Handlebars fills in the variables
// ({{actionUrl}}, {{appName}}, {{appUrl}}, {{year}}) at render time. The HTML is
// produced from the .hbs sources by `npm run generate:emails` (mailwind inlines
// the Tailwind classes into `generated-templates.ts`).
const verifyTpl = Handlebars.compile(VERIFY_EMAIL_TEMPLATE);
const resetTpl = Handlebars.compile(PASSWORD_RESET_TEMPLATE);

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function baseContext() {
  return {
    appName: APP_NAME,
    appUrl: APP_URL,
    year: new Date().getFullYear(),
  };
}

/** Verification email — doubles as a warm welcome on sign-up. */
export function verificationEmailTemplate(verifyUrl: string): RenderedEmail {
  const subject = `Verify your email for ${APP_NAME}`;
  const html = verifyTpl({ ...baseContext(), actionUrl: verifyUrl });
  const text = [
    `Welcome to ${APP_NAME}!`,
    "",
    "Confirm your email address to finish setting up your account and sync your data across devices:",
    verifyUrl,
    "",
    "If you didn't create this account, you can safely ignore this email.",
  ].join("\n");
  return { subject, html, text };
}

/** Password reset email. */
export function passwordResetEmailTemplate(resetUrl: string): RenderedEmail {
  const subject = `Reset your password for ${APP_NAME}`;
  const html = resetTpl({ ...baseContext(), actionUrl: resetUrl });
  const text = [
    `Reset your ${APP_NAME} password`,
    "",
    "We received a request to reset your password. Use this link to choose a new one:",
    resetUrl,
    "",
    "If you didn't request this, you can safely ignore this email.",
  ].join("\n");
  return { subject, html, text };
}

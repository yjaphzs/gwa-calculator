import { Resend } from "resend";

// Lazily constructed so a missing key at cold-start doesn't crash the module
// load; the API key is read on first send, by which point the function's
// environment is populated. Set RESEND_API_KEY in functions/.env (local) or via
// the deploy workflow (production).
let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

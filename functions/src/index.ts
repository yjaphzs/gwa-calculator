import { initializeApp, getApps } from "firebase-admin/app";

// Initialize the Admin SDK once. Each callable below calls getAuth()/
// getFirestore()/getStorage() lazily at request time, by which point this has
// run during the cold-start module load.
if (getApps().length === 0) {
  initializeApp();
}

// ── Callable functions ───────────────────────────────────────────────────────
// Region + instance caps are set per-function via `callableOptions` (config.ts).
export { deleteAccount } from "./callable/account/delete-account";
export { sendVerificationEmail } from "./callable/auth/send-verification-email";
export { sendPasswordResetEmail } from "./callable/auth/send-password-reset-email";

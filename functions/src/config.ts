// Shared Cloud Functions configuration.

/** Co-located with Firestore for low-latency reads/writes. */
export const REGION = "asia-southeast1";

/** Public app URL — used to build in-app auth-action links inside emails. */
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

/** Product name used in email copy. */
export const APP_NAME = process.env.APP_NAME ?? "GWA Calculator";

/**
 * Shared options applied to every callable. Setting region per-function (rather
 * than only via setGlobalOptions) avoids ordering pitfalls when functions are
 * re-exported from index.ts. App Check is left unenforced so the app works
 * without a reCAPTCHA key; flip `enforceAppCheck` on once one is configured.
 */
export const callableOptions = {
  region: REGION,
  maxInstances: 5,
};

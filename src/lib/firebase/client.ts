import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();

  // During SSR / static generation (no window) the NEXT_PUBLIC_* vars may be
  // absent. All Firebase services are browser-only (used inside useEffect /
  // event handlers), so it's safe to skip initialization on the server.
  if (typeof window === 'undefined') return null!;

  // In the browser the vars must be baked in by the build. If any are missing
  // the build was done without the required env vars — throw now rather than
  // crashing silently later in onAuthStateChanged.
  const CONFIG_KEY_TO_ENV: Record<string, string> = {
    apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
  };

  // measurementId is optional; the rest are required for auth + data to work.
  const missing = Object.entries(firebaseConfig)
    .filter(([k, v]) => k !== 'measurementId' && !v)
    .map(([k]) => CONFIG_KEY_TO_ENV[k] ?? k);

  if (missing.length) {
    throw new Error(
      `[Firebase] Missing environment variables baked into bundle:\n  ${missing.join('\n  ')}\n` +
        'Ensure all NEXT_PUBLIC_FIREBASE_* values are set in .env.local (local dev) ' +
        'or in the GitHub environment that ran the build (deploy).',
    );
  }

  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// ── App Check (optional) ───────────────────────────────────────────────────
// Verifies requests come from this app. Browser-only; no-op without a key.
export let appCheck: AppCheck | undefined;

function initAppCheck(): void {
  if (typeof window === 'undefined') return;
  if (appCheck) return; // HMR-safe: don't double-initialize

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_KEY;
  if (!siteKey) return;

  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  if (debugToken) {
    const scope = self as unknown as {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean;
    };
    scope.FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken === 'true' ? true : debugToken;
  }

  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code !== 'appcheck/already-initialized') {
      console.error('[firebase] App Check initialization failed:', err);
    }
  }
}

initAppCheck();

export const auth = app ? getAuth(app) : null!;
export const db = app ? getFirestore(app) : null!;
export const storage = app ? getStorage(app) : null!;
export const functions = app
  ? getFunctions(
      app,
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? 'asia-southeast1',
    )
  : null!;
export default app;

"use client";

import { useEffect } from "react";

/**
 * The previous (Vite) build shipped a PWA service worker. The Next.js app ships
 * none, but an old service worker can stay registered in returning users'
 * browsers and keep serving the stale, precached app on a normal refresh (a
 * hard refresh bypasses it — which is exactly the "old app comes back" symptom).
 *
 * This unregisters any leftover service workers and clears their caches once on
 * load. After it runs, normal refreshes serve the live app. It's a no-op once
 * there are no registrations left.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        if (registrations.length === 0) return;
        registrations.forEach((registration) => registration.unregister());
        if ("caches" in window) {
          caches
            .keys()
            .then((keys) => keys.forEach((key) => caches.delete(key)))
            .catch(() => undefined);
        }
      })
      .catch(() => undefined);
  }, []);

  return null;
}

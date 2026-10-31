import { useSyncExternalStore } from "react";

import { applyFavicon } from "@/features/appearance/lib/favicon";
import { ACCENT_KEY, SCHEME_CSS_KEY, SCHEME_KEY, SCHEME_STYLE_ID } from "@/features/appearance/lib/scheme-keys";
import { cssForChoice, DEFAULT_SCHEME, isValidChoice, type SchemeChoice } from "@/features/appearance/lib/schemes";

const DEFAULT_CHOICE: SchemeChoice = { scheme: DEFAULT_SCHEME };

function readStored(): SchemeChoice {
  try {
    const scheme = localStorage.getItem(SCHEME_KEY);
    const accent = localStorage.getItem(ACCENT_KEY) ?? undefined;
    const choice = scheme ? { scheme, ...(accent ? { accent } : {}) } : DEFAULT_CHOICE;
    return isValidChoice(choice) ? choice : DEFAULT_CHOICE;
  } catch {
    return DEFAULT_CHOICE;
  }
}

let current: SchemeChoice | null = null;
const listeners = new Set<() => void>();

export function getScheme(): SchemeChoice {
  if (current === null) current = typeof window === "undefined" ? DEFAULT_CHOICE : readStored();
  return current;
}

/** Puts the scheme's stylesheet and `data-scheme` on the page. */
function applyToDocument(choice: SchemeChoice, css: string | null): void {
  const root = document.documentElement;
  let style = document.getElementById(SCHEME_STYLE_ID);
  if (!css) {
    delete root.dataset.scheme;
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = SCHEME_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
  root.dataset.scheme = choice.scheme;
}

function persist(choice: SchemeChoice, css: string | null): void {
  try {
    localStorage.setItem(SCHEME_KEY, choice.scheme);
    if (choice.accent) localStorage.setItem(ACCENT_KEY, choice.accent);
    else localStorage.removeItem(ACCENT_KEY);
    if (css) localStorage.setItem(SCHEME_CSS_KEY, css);
    else localStorage.removeItem(SCHEME_CSS_KEY);
  } catch {
    /* private mode or full storage: the scheme still applies for this visit */
  }
}

/** Switches the color scheme now, remembers it on this device, and notifies subscribers. */
export function setScheme(choice: SchemeChoice): void {
  const next = isValidChoice(choice) ? choice : DEFAULT_CHOICE;
  const css = cssForChoice(next);
  applyToDocument(next, css);
  applyFavicon(next);
  persist(next, css);
  current = next;
  listeners.forEach((listener) => listener());
}

/**
 * Re-applies the stored choice from the current scheme definitions, so a
 * stylesheet saved by an older version of the app is refreshed.
 */
export function refreshScheme(): void {
  setScheme(getScheme());
}

export const sameChoice = (a: SchemeChoice, b: SchemeChoice) =>
  a.scheme === b.scheme && (a.accent ?? "").toLowerCase() === (b.accent ?? "").toLowerCase();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useScheme(): SchemeChoice {
  return useSyncExternalStore(subscribe, getScheme, () => DEFAULT_CHOICE);
}

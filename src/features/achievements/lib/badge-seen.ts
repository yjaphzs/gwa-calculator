// Which earned badges the user has seen (on this device), and how many are
// new. The count is kept apart so the nav's dot can read it on any page
// without loading calculator data (for signed-in users that would cost reads).
const SEEN_KEY = "gwa_badges_seen";
const UNSEEN_KEY = "gwa_badges_unseen";
const EVENT = "gwa-badges-unseen";

export function readSeen(): Set<string> {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return new Set(Array.isArray(ids) ? ids.map(String) : []);
  } catch {
    return new Set();
  }
}

export function setUnseen(count: number): void {
  try {
    localStorage.setItem(UNSEEN_KEY, String(count));
  } catch {
    // Storage blocked: the dot just won't show.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Everything earned so far counts as seen (kept even if a badge is later lost). */
export function markSeen(ids: string[]): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...readSeen(), ...ids])]));
  } catch {
    // Storage blocked: nothing to remember.
  }
  setUnseen(0);
}

export function getUnseen(): number {
  try {
    return Number(localStorage.getItem(UNSEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function subscribeUnseen(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

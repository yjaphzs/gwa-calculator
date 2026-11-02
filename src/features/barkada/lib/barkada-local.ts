// The badge count the user's barkadas have for them, per account on this
// device. Absent when they're in no barkada, so the badge sync never calls the
// server for people who don't use the feature.
const key = (uid: string) => `gwa_barkada_badges_${uid}`;

export function readSentBadges(uid: string): number | null {
  try {
    const value = localStorage.getItem(key(uid));
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
}

/** null: not in any barkada. -1: the groups disagree, so the next sync sends the count. */
export function writeSentBadges(uid: string, count: number | null): void {
  try {
    if (count === null) localStorage.removeItem(key(uid));
    else localStorage.setItem(key(uid), String(count));
  } catch {
    // Storage blocked: the count syncs on the next join or update instead.
  }
}

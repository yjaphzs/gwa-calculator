/**
 * App changelog shown in the "What's new" dialog.
 *
 * Keep entries newest-first. When you ship a release, add an entry at the top
 * with the new `version` (matching package.json) — users who haven't seen that
 * version will get a dot on the "What's new" button until they open it.
 */

export type ChangeType = "new" | "improved" | "fixed";

export interface ChangelogChange {
  type: ChangeType;
  text: string;
}

export interface ChangelogEntry {
  version: string;
  /** Human-readable date, e.g. "June 19, 2026". */
  date: string;
  title?: string;
  changes: ChangelogChange[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.2.1",
    date: "June 20, 2026",
    title: "Custom codenames & fixes",
    changes: [
      { type: "new", text: "Choose your own anonymous leaderboard codename instead of the auto-generated one." },
      { type: "fixed", text: "Saved semesters no longer briefly appear then disappear — they now persist and sync reliably when you're signed in." },
      { type: "fixed", text: "Refreshing no longer occasionally loads an old version of the app; it now always serves the latest." },
    ],
  },
  {
    version: "2.2.0",
    date: "June 20, 2026",
    title: "Leaderboards",
    changes: [
      { type: "new", text: "Opt in to per-school leaderboards: per-semester boards rank any term with 12+ units, plus an overall board for complete academic summaries (8+ semesters, 120+ units)." },
      { type: "new", text: "Boards update in realtime: your standing refreshes automatically whenever you save a semester, and rankings update live as you watch." },
      { type: "new", text: "Nothing is shared without your permission — a first-visit note explains your choices, and you stay private until you choose to join." },
      { type: "new", text: "Stay private: join anonymously with a generated handle, or share your name and photo — your choice, and you can leave anytime." },
      { type: "new", text: "Pick your school from a directory of Philippine universities and colleges; participation needs a verified email, and only signed-in users can view the boards." },
    ],
  },
  {
    version: "2.1.0",
    date: "June 20, 2026",
    title: "Printable grade reports",
    changes: [
      { type: "new", text: "Export a Semester Report — print or save a single semester's grades as a PDF." },
      { type: "new", text: "Export an Academic Summary — all your saved semesters with a cumulative GWA and Latin honors (Cum Laude, Magna, Summa), in one printable document." },
      { type: "new", text: "Both documents are a personal-reference copy of the data you enter — not an official academic record." },
    ],
  },
  {
    version: "2.0.0",
    date: "June 19, 2026",
    title: "Accounts & cloud sync",
    changes: [
      { type: "new", text: "Create a free account to save your subjects and semesters." },
      { type: "new", text: "Sync your data automatically across all your devices." },
      { type: "new", text: "Sign in with email and password or with Google." },
      { type: "new", text: "Add a display name and profile photo to your account." },
      { type: "new", text: "This “What's new” changelog, so you never miss an update." },
      { type: "improved", text: "Rebuilt on Next.js for a faster, more reliable experience." },
      { type: "improved", text: "The calculator still works fully offline — no account required." },
    ],
  },
  {
    version: "1.2.0",
    date: "November 2025",
    title: "Share & encourage",
    changes: [
      { type: "new", text: "QR code transfer to move your data between devices." },
      { type: "new", text: "Encouraging message when your GWA isn't on the honor list yet." },
      { type: "fixed", text: "Fixed a bug in the import/export options." },
    ],
  },
  {
    version: "1.1.0",
    date: "November 2025",
    title: "Semesters",
    changes: [
      { type: "new", text: "Save semesters to archive your subjects and GWA over time." },
      { type: "improved", text: "Search and pagination for long subject lists." },
    ],
  },
  {
    version: "1.0.0",
    date: "November 2025",
    title: "First release",
    changes: [
      { type: "new", text: "Compute your GWA from subjects, grades, and units." },
      { type: "new", text: "Academic honor detection (University/College Scholar, Dean's Lister)." },
      { type: "new", text: "Import and export your data as a file." },
      { type: "new", text: "Light and dark mode." },
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0]?.version ?? "0.0.0";

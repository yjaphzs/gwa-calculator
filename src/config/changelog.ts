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
    version: "2.1.0",
    date: "June 20, 2026",
    title: "Printable grade reports",
    changes: [
      { type: "new", text: "Export a Semester Report — print or save a single semester's grades as a PDF." },
      { type: "new", text: "Export an Academic Summary — all your saved semesters with a cumulative GWA, in one printable document." },
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

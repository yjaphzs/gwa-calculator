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
    version: "2.5.0",
    date: "October 30, 2026",
    title: "Made for phones",
    changes: [
      { type: "new", text: "A phone-friendly layout: forms, menus, and What's new slide up from the bottom of the screen." },
      { type: "new", text: "An Add subject button that stays within reach on a phone." },
      { type: "new", text: "On a phone, tap a subject to see its details, then edit or delete it." },
      { type: "improved", text: "On a phone, navigation sits in a tab bar at the bottom of the screen." },
      { type: "improved", text: "The GWA-by-semester chart stays readable on small screens, and you can tap a point to see its term and GWA." },
      { type: "improved", text: "Choosing your school on a phone opens a searchable list the keyboard can't cover." },
      { type: "improved", text: "Autosave is now a single on/off switch in the subject menu." },
    ],
  },
  {
    version: "2.4.0",
    date: "October 28, 2026",
    title: "Planner, trends & navigation",
    changes: [
      { type: "new", text: "Mark a subject as not counted (like NSTP or PE) or as INC, DRP, W, or IP (in progress, for courses that continue next term). It stays on your list and reports without changing your GWA." },
      { type: "new", text: "Edit a subject inside a saved semester, for example to fill in the final grade for an INC or IP course." },
      { type: "new", text: "Plan your next semester: see the GWA you need to keep Cum Laude, Magna Cum Laude, or Summa Cum Laude." },
      { type: "new", text: "A GWA-by-semester chart on the Semesters tab." },
      { type: "new", text: "Undo right after deleting a subject." },
      { type: "improved", text: "Your GWA card now shows the units it counts and how close you are to the next honor." },
      { type: "improved", text: "Navigation at the top of every page: Calculator, How it works, and Leaderboard." },
      { type: "improved", text: "The Semesters tab is always visible, and saving a semester now takes one step." },
      { type: "improved", text: "The app now uses its intended fonts, with clearer numbers." },
      { type: "fixed", text: "The search shortcut now matches its hint: Ctrl+K, or ⌘K on a Mac." },
      { type: "fixed", text: "Leaving a subject's code or title blank fills in a numbered default instead of saving placeholder text." },
    ],
  },
  {
    version: "2.3.0",
    date: "October 28, 2026",
    title: "GWA guide & new reports",
    changes: [
      { type: "new", text: "A How GWA is computed guide: the formula, a worked example, a try-it calculator, grade equivalents, honors, and common questions." },
      { type: "improved", text: "Semester Reports and Academic Summaries have a fresh design: headline figures, grade × units totals, a GWA-by-semester chart, and page numbers." },
      { type: "improved", text: "Reports include your school and college or program when you've saved them to your profile." },
      { type: "fixed", text: "Adding a subject right after editing one now opens an empty form instead of the subject you just edited." },
      { type: "fixed", text: "The honor badge no longer lingers after you delete all your subjects." },
      { type: "fixed", text: "QR transfers now check the received data before importing it, the same way file imports do." },
    ],
  },
  {
    version: "2.2.1",
    date: "June 20, 2026",
    title: "Custom codenames & fixes",
    changes: [
      { type: "new", text: "Choose your own anonymous leaderboard codename instead of the auto-generated one." },
      { type: "fixed", text: "Saved semesters no longer briefly appear then disappear. They now persist and sync reliably when you're signed in." },
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
      { type: "new", text: "Nothing is shared without your permission. A first-visit note explains your choices, and you stay private until you choose to join." },
      { type: "new", text: "Stay private: join anonymously with a generated handle, or share your name and photo. It's your choice, and you can leave anytime." },
      { type: "new", text: "Pick your school from a directory of Philippine universities and colleges; participation needs a verified email, and only signed-in users can view the boards." },
    ],
  },
  {
    version: "2.1.0",
    date: "June 20, 2026",
    title: "Printable grade reports",
    changes: [
      { type: "new", text: "Export a Semester Report: print or save a single semester's grades as a PDF." },
      { type: "new", text: "Export an Academic Summary: all your saved semesters with a cumulative GWA and Latin honors (Cum Laude, Magna, Summa), in one printable document." },
      { type: "new", text: "Both documents are a personal-reference copy of the data you enter, not an official academic record." },
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
      { type: "improved", text: "The calculator still works fully offline, no account required." },
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

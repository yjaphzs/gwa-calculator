import type { FieldValue, Timestamp } from "firebase/firestore";

import type { SubjectMark } from "@/lib/academic";

export type { SubjectMark };

export interface Subject {
    id: string;
    code: string;
    title: string;
    /** Ignored by the GWA when the subject is excluded or carries a mark. */
    grade: number;
    units: number;
    /** Left out of the GWA by school policy (e.g. NSTP). Omitted when false. */
    excluded?: boolean;
    /** INC / DRP / W / IP instead of a final grade. Omitted when graded. */
    mark?: SubjectMark;
}

export interface Semester {
    id: string;
    schoolYear: string;
    semester: string;
    subjects: Subject[];
}

/**
 * The full calculator state that is persisted — to localStorage for guests, or
 * to Firestore (`users/{uid}/calculator/state`) for signed-in users.
 */
export interface CalculatorState {
    subjects: Subject[];
    semesters: Semester[];
    autosave: boolean;
}

/** Whether a curated school is a full university or a standalone college. */
export type SchoolType = "university" | "college";

/** Profile document stored at `users/{uid}`. */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    /** Curated-school id (slug) the user belongs to — the leaderboard group key. */
    schoolId?: string | null;
    /** Display name of the chosen school (denormalized from the curated list). */
    schoolName?: string | null;
    schoolType?: SchoolType | null;
    /** Optional free-text college/program within the school (e.g. "College of Engineering"). */
    program?: string | null;
    createdAt: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}

/**
 * Public leaderboard projection at `leaderboard/{handle}`. Readable by any
 * signed-in user and written ONLY by Cloud Functions. Deliberately carries no
 * `uid`/`email` — the doc id is the anonymous handle so identity isn't leaked.
 */
export interface LeaderboardEntry {
    handle: string;
    schoolId: string;
    schoolName: string;
    schoolType: SchoolType;
    program: string | null;
    /** Real name, or null when the user opted to appear anonymously. */
    displayName: string | null;
    /** Real photo URL, or null when anonymous. */
    photoURL: string | null;
    isAnonymous: boolean;
    /** Cumulative GWA across all saved semesters (ascending — 1.00 is best). */
    gwa: number;
    totalUnits: number;
    /** Latin (graduation) honor, gated by the minimum-units rule. */
    honor: string | null;
    updatedAt: Timestamp | FieldValue;
}

/**
 * Public per-term leaderboard projection at
 * `leaderboardSemesters/{handle}__{termKey}` — one doc per student per saved
 * semester. Same identity/privacy shape as {@link LeaderboardEntry}, plus the
 * normalized term it belongs to. `honor` here is a scholarship honor
 * (University/College Scholar, Dean's Lister) rather than a Latin honor.
 */
export interface LeaderboardSemesterEntry extends LeaderboardEntry {
    /** Stable term key (e.g. "2024-1") — the per-term board id. */
    termKey: string;
    /** Display label for the term (e.g. "AY 2024–2025 · 1st Sem"). */
    termLabel: string;
}

/**
 * Precomputed board for one school at `leaderboardBoards/{schoolId}`, rebuilt by
 * Cloud Functions whenever that school's entries change. The page reads this one
 * doc instead of querying the entry collections (1 read per view, not up to 400).
 */
export interface LeaderboardBoard {
    schoolId: string;
    /** Top overall entries, best GWA first (max 100). */
    overall: LeaderboardEntry[];
    /** Top per-term entries across all terms, best GWA first (max 300). */
    terms: LeaderboardSemesterEntry[];
}

/**
 * Per-user private leaderboard state at `users/{uid}/leaderboard/settings`.
 * Owner-readable, written ONLY by Cloud Functions (so the assigned handle and
 * opt-in flag can't be tampered with client-side).
 */
export interface LeaderboardSettings {
    optIn: boolean;
    /** Stable anonymous handle (e.g. "anonymous2421"), assigned once and reused. */
    handle: string | null;
    isAnonymous: boolean;
    updatedAt?: Timestamp | FieldValue;
    lastPublishedAt?: Timestamp | FieldValue;
}

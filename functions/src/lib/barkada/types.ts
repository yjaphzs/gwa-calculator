import type { FieldValue, Timestamp } from "firebase-admin/firestore";

import type { GwaInput } from "../academic";

/** The group's goal: every member at this honor or better for the term. */
export type BarkadaGoal = "deans-lister" | "college-scholar" | "university-scholar";
export const BARKADA_GOALS: readonly BarkadaGoal[] = ["deans-lister", "college-scholar", "university-scholar"];

/** How much of a member's GWA the group sees: none, the whole number ("1.**"), or all of it. */
export type GwaShown = "hidden" | "masked" | "exact";
export const GWA_SHOWN: readonly GwaShown[] = ["hidden", "masked", "exact"];

/** graded: 12+ units saved for the term; short: under 12; waiting: no semester saved for it yet. */
export type MemberStatus = "graded" | "short" | "waiting";

export const MAX_MEMBERS = 10;
export const MAX_GROUPS = 5;
/** The app has 16 badges; the count is reported by the member's own app. */
export const MAX_BADGES = 16;

/** What the server works out from a member's saved semester for the group's term. */
export interface MemberResult {
  status: MemberStatus;
  /** Semester honor band, or null. */
  honor: string | null;
  /** Null unless the member shows it; only the whole number when masked. */
  gwa: number | null;
}

export interface BarkadaMember extends MemberResult {
  nickname: string;
  gwaShown: GwaShown;
  badges: number;
  joinedAt: Timestamp | FieldValue;
}

/** `barkadas/{groupId}`: one doc per group, readable by its members, written only here. */
export interface BarkadaDoc {
  name: string;
  /** Invite code: 8 characters with no look-alikes. */
  code: string;
  ownerUid: string;
  goal: BarkadaGoal;
  term: { key: string; label: string };
  /** Member uids (max 10): the read rule and the "my groups" query use it. */
  memberUids: string[];
  members: Record<string, BarkadaMember>;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/** A saved semester as stored in `users/{uid}/calculator/state`. */
export interface StoredSemester {
  schoolYear?: string;
  semester?: string;
  subjects?: GwaInput[];
}

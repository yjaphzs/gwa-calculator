import { normalizeTerm, type NormalizedTerm } from "../term";
import {
  BARKADA_GOALS,
  GWA_SHOWN,
  MAX_BADGES,
  type BarkadaGoal,
  type GwaShown,
} from "./types";

/** Invite-code alphabet: no 0/O, 1/I/L, so a code read aloud or typed can't be mistaken. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_LENGTH = 8;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);
const GROUP_ID_PATTERN = /^[A-Za-z0-9]{1,40}$/;

/**
 * Bad input from the app, worded for the user. The callables turn it into an
 * `invalid-argument` error (`toHttpsError`). A plain Error keeps this file free of
 * Firebase imports, so the root `npm test` can run it without functions/node_modules.
 */
export class InputError extends Error {}

const invalid = (message: string) => new InputError(message);

/** Trimmed text with control characters removed and runs of spaces collapsed. */
function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function boundedText(value: unknown, min: number, max: number, what: string): string {
  const text = cleanText(value);
  if (text.length < min || text.length > max) {
    throw invalid(`${what} should be ${min}–${max} characters.`);
  }
  return text;
}

export const parseName = (value: unknown) => boundedText(value, 2, 30, "The barkada's name");
export const parseNickname = (value: unknown) => boundedText(value, 1, 24, "Your nickname");

/** An invite code, forgiving case, spaces and dashes ("k7p2-qx9m"). */
export function parseCode(value: unknown): string {
  const code = typeof value === "string" ? value.toUpperCase().replace(/[\s-]/g, "") : "";
  if (!CODE_PATTERN.test(code)) throw invalid("That invite code doesn't look right.");
  return code;
}

export function parseGroupId(value: unknown): string {
  if (typeof value !== "string" || !GROUP_ID_PATTERN.test(value)) throw invalid("Unknown barkada.");
  return value;
}

export function parseGoal(value: unknown): BarkadaGoal {
  if (!BARKADA_GOALS.includes(value as BarkadaGoal)) throw invalid("Pick a goal for the barkada.");
  return value as BarkadaGoal;
}

/** Hidden unless the member picks otherwise. */
export function parseGwaShown(value: unknown): GwaShown {
  if (value === undefined) return "hidden";
  if (!GWA_SHOWN.includes(value as GwaShown)) throw invalid("Choose how your GWA shows.");
  return value as GwaShown;
}

/** The member's own badge count, clamped to what the app can award. */
export function parseBadges(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.min(MAX_BADGES, Math.max(0, n));
}

/** The challenge's term from the app's school year and semester pickers. */
export function parseTerm(schoolYear: unknown, semester: unknown): NormalizedTerm {
  const year = boundedText(schoolYear, 4, 20, "The school year");
  const term = boundedText(semester, 1, 20, "The semester");
  return normalizeTerm(year, term);
}

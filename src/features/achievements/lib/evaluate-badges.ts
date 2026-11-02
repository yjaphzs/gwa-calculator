import { BADGES, type Badge, type BadgeId } from "@/features/achievements/content/badges";
import { badgeStats, longestRun, type BadgeStats } from "@/features/achievements/lib/badge-stats";
import { ACADEMIC_HONOR_BANDS } from "@/lib/academic";
import type { Semester, Subject } from "@/types";

export interface BadgeProgress {
  current: number;
  target: number;
  /** "2 of 3 in a row", shown under a locked badge. */
  label: string;
}

export interface BadgeStatus {
  badge: Badge;
  earned: boolean;
  progress: BadgeProgress;
}

const COMEBACK_JUMP = 0.25;
const TOP_HONOR = ACADEMIC_HONOR_BANDS[0].name;

const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const toward = (value: number, target: number, unit = ""): BadgeProgress => {
  const current = Math.min(value, target);
  return { current, target, label: `${num(current)} of ${target}${unit && ` ${unit}`}` };
};
const maxUnits = (s: BadgeStats) => Math.max(0, ...s.terms.map((t) => t.units));
const bestJump = (s: BadgeStats) => Math.max(0, ...s.jumps.map((j) => j ?? 0));

const RULES: Record<BadgeId, (s: BadgeStats) => BadgeProgress> = {
  "first-steps": (s) => toward(s.subjects, 1, "subject"),
  "semester-one": (s) => toward(s.terms.length, 1, "semester"),
  uno: (s) => toward(s.unos, 1),
  "on-the-list": (s) => toward(s.terms.filter((t) => t.honor).length, 1),
  "full-load": (s) => toward(maxUnits(s), 21, "units"),
  "clean-sheet": (s) => toward(s.terms.filter((t) => t.clean).length, 1),
  comeback: (s) => ({
    current: Math.min(bestJump(s), COMEBACK_JUMP),
    target: COMEBACK_JUMP,
    label: `Best jump so far: ${bestJump(s).toFixed(2)}`,
  }),
  "top-band": (s) => toward(s.terms.filter((t) => t.honor === TOP_HONOR).length, 1),
  survivor: (s) => toward(maxUnits(s), 24, "units"),
  "uno-collector": (s) => toward(s.unos, 5),
  steady: (s) => toward(s.terms.length, 4, "semesters"),
  "scholar-streak": (s) => toward(longestRun(s.terms.map((t) => t.honor !== null)), 3, "in a row"),
  "glow-up": (s) => toward(longestRun(s.jumps.map((j) => j !== null && j > 0)), 3, "in a row"),
  halfway: (s) => toward(s.cumulativeUnits, 60, "units"),
  "latin-track": (s) => ({ current: s.latinHonor ? 1 : 0, target: 1, label: s.latinHonor ?? "Not yet" }),
  "home-stretch": (s) => toward(s.cumulativeUnits, 120, "units"),
};

/** Every badge with whether it's earned and how close it is, from the user's own data. */
export function evaluateBadges(subjects: Subject[], semesters: Semester[]): BadgeStatus[] {
  const stats = badgeStats(subjects, semesters);
  return BADGES.map((badge) => {
    const progress = RULES[badge.id](stats);
    return { badge, progress, earned: progress.current >= progress.target };
  });
}

import { ACADEMIC_HONOR_BANDS } from "@/lib/academic";
import type { BarkadaGoal, BarkadaMember } from "@/types";

/** Each goal names the lowest band that counts ("or better"). */
export const GOALS: { value: BarkadaGoal; band: string; label: string }[] = [
  { value: "deans-lister", band: "Dean's Lister", label: "Everyone Dean's Lister or better" },
  { value: "college-scholar", band: "College Scholar", label: "Everyone College Scholar or better" },
  { value: "university-scholar", band: "University Scholar", label: "Everyone University Scholar" },
];

export const goalLabel = (goal: BarkadaGoal) => GOALS.find((g) => g.value === goal)?.label ?? GOALS[0].label;

type Standing = Pick<BarkadaMember, "status" | "honor">;

const bandIndex = (member: Standing) =>
  member.status === "graded" && member.honor ? ACADEMIC_HONOR_BANDS.findIndex((b) => b.name === member.honor) : -1;

/**
 * Lower is better: the honor bands in order, then graded without an honor,
 * then under 12 units, then waiting for grades.
 */
export function standingRank(member: Standing): number {
  const band = bandIndex(member);
  if (band >= 0) return band;
  const after = ACADEMIC_HONOR_BANDS.length;
  return member.status === "graded" ? after : member.status === "short" ? after + 1 : after + 2;
}

export function meetsGoal(member: Standing, goal: BarkadaGoal): boolean {
  const band = bandIndex(member);
  const target = ACADEMIC_HONOR_BANDS.findIndex((b) => b.name === GOALS.find((g) => g.value === goal)?.band);
  return band >= 0 && band <= target;
}

export interface RankedMember {
  uid: string;
  member: BarkadaMember;
  /** 1-based; tied members share a place (1, 2, 2, 4). */
  place: number;
}

/**
 * Members by standing, then by badges. GWA never decides the order, so a
 * hidden GWA can't be worked out from someone's place.
 */
export function rankMembers(members: Record<string, BarkadaMember>): RankedMember[] {
  const list = Object.entries(members).map(([uid, member]) => ({ uid, member, rank: standingRank(member) }));
  list.sort(
    (a, b) => a.rank - b.rank || b.member.badges - a.member.badges || a.member.nickname.localeCompare(b.member.nickname),
  );
  let place = 0;
  return list.map(({ uid, member, rank }, i) => {
    const prev = list[i - 1];
    if (!prev || prev.rank !== rank || prev.member.badges !== member.badges) place = i + 1;
    return { uid, member, place };
  });
}

export interface GoalProgress {
  made: number;
  waiting: number;
  total: number;
  /** Everyone made it, in a group of two or more. */
  reached: boolean;
}

export function goalProgress(members: Record<string, BarkadaMember>, goal: BarkadaGoal): GoalProgress {
  const list = Object.values(members);
  const made = list.filter((m) => meetsGoal(m, goal)).length;
  return {
    made,
    waiting: list.filter((m) => m.status === "waiting").length,
    total: list.length,
    reached: list.length >= 2 && made === list.length,
  };
}

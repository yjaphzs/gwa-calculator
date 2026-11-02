import { describe, expect, it } from "vitest";

import type { BarkadaMember } from "@/types";
import { goalProgress, meetsGoal, rankMembers, standingRank } from "./barkada-rank";
import { defaultNickname, defaultTerm, termFromKey } from "./default-term";
import { formatCode, inviteUrl, parseInviteCode } from "./invite";

const member = (nickname: string, status: BarkadaMember["status"], honor: string | null, badges = 0): BarkadaMember => ({
  nickname,
  status,
  honor,
  badges,
  gwaShown: "hidden",
  gwa: null,
  joinedAt: null,
});

describe("rankMembers", () => {
  it("orders by band, then no honor, under 12 units, and waiting", () => {
    const ranked = rankMembers({
      w: member("Waiting", "waiting", null),
      s: member("Short", "short", null),
      n: member("None", "graded", null),
      d: member("Dean", "graded", "Dean's Lister"),
      u: member("Uni", "graded", "University Scholar"),
      c: member("College", "graded", "College Scholar"),
    });
    expect(ranked.map((r) => r.member.nickname)).toEqual(["Uni", "College", "Dean", "None", "Short", "Waiting"]);
    expect(ranked.map((r) => r.place)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("breaks ties by badges, and equal ones share a place", () => {
    const ranked = rankMembers({
      a: member("Ana", "graded", "Dean's Lister", 3),
      b: member("Ben", "graded", "Dean's Lister", 5),
      c: member("Cai", "graded", "Dean's Lister", 3),
      d: member("Dan", "waiting", null, 9),
    });
    expect(ranked.map((r) => [r.member.nickname, r.place])).toEqual([
      ["Ben", 1],
      ["Ana", 2],
      ["Cai", 2],
      ["Dan", 4],
    ]);
  });

  it("never lets an honor count while grades are missing", () => {
    expect(standingRank(member("x", "short", "Dean's Lister"))).toBeGreaterThan(standingRank(member("y", "graded", null)));
  });
});

describe("goals", () => {
  it("counts a band or better", () => {
    expect(meetsGoal(member("a", "graded", "University Scholar"), "deans-lister")).toBe(true);
    expect(meetsGoal(member("a", "graded", "Dean's Lister"), "college-scholar")).toBe(false);
    expect(meetsGoal(member("a", "graded", "College Scholar"), "college-scholar")).toBe(true);
    expect(meetsGoal(member("a", "waiting", null), "deans-lister")).toBe(false);
  });

  it("tracks progress, and a goal is reached only by a group of two or more", () => {
    const pair = { a: member("a", "graded", "Dean's Lister"), b: member("b", "waiting", null) };
    expect(goalProgress(pair, "deans-lister")).toEqual({ made: 1, waiting: 1, total: 2, reached: false });
    const done = { ...pair, b: member("b", "graded", "College Scholar") };
    expect(goalProgress(done, "deans-lister").reached).toBe(true);
    expect(goalProgress({ a: pair.a }, "deans-lister").reached).toBe(false);
  });
});

describe("invites", () => {
  it("builds and reads invite links and codes", () => {
    const url = inviteUrl("K7P2QX9M", "https://gwa-calculator.yjaphzs.xyz");
    expect(url).toBe("https://gwa-calculator.yjaphzs.xyz/leaderboard/?join=K7P2QX9M");
    expect(parseInviteCode(url)).toBe("K7P2QX9M");
    expect(parseInviteCode(" k7p2-qx9m ")).toBe("K7P2QX9M");
    expect(parseInviteCode("K7P2QX9O")).toBeNull();
    expect(parseInviteCode("hello")).toBeNull();
    expect(formatCode("K7P2QX9M")).toBe("K7P2-QX9M");
  });
});

describe("defaultTerm", () => {
  it("follows the usual Philippine calendar", () => {
    expect(defaultTerm(new Date(2026, 10, 2))).toEqual({ schoolYear: "2026-2027", semester: "First" });
    expect(defaultTerm(new Date(2027, 1, 14))).toEqual({ schoolYear: "2026-2027", semester: "Second" });
    expect(defaultTerm(new Date(2027, 5, 20))).toEqual({ schoolYear: "2026-2027", semester: "Third" });
    expect(defaultTerm(new Date(2026, 7, 1))).toEqual({ schoolYear: "2026-2027", semester: "First" });
  });
});

describe("termFromKey and defaultNickname", () => {
  it("turns a stored term key back into the pickers' values", () => {
    expect(termFromKey("2026-1", new Date(2026, 10, 2))).toEqual({ schoolYear: "2026-2027", semester: "First" });
    expect(termFromKey("2025-3", new Date(2026, 10, 2))).toEqual({ schoolYear: "2025-2026", semester: "Third" });
    expect(termFromKey("odd-term", new Date(2026, 10, 2))).toEqual({ schoolYear: "2026-2027", semester: "First" });
  });

  it("starts the nickname from the first word of the profile name", () => {
    expect(defaultNickname("  Jan Paolo Bautista ")).toBe("Jan");
    expect(defaultNickname(null)).toBe("");
  });
});

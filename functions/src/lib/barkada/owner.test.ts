import { describe, expect, it } from "vitest";

import { nextOwner } from "./owner";
import type { BarkadaDoc } from "./types";

const at = (millis: number) => ({ toMillis: () => millis });
const group = (owner: string, joined: Record<string, number>) =>
  ({
    ownerUid: owner,
    memberUids: Object.keys(joined),
    members: Object.fromEntries(Object.entries(joined).map(([uid, t]) => [uid, { joinedAt: at(t) }])),
  }) as unknown as BarkadaDoc;

describe("nextOwner", () => {
  it("keeps the owner when someone else leaves", () => {
    expect(nextOwner(group("a", { a: 1, b: 2, c: 3 }), "b")).toBe("a");
  });

  it("passes the group to the earliest member when the owner leaves", () => {
    expect(nextOwner(group("a", { a: 1, c: 2, b: 3 }), "a")).toBe("c");
  });

  it("has no owner left when the last member goes", () => {
    expect(nextOwner(group("a", { a: 1 }), "a")).toBeNull();
  });
});

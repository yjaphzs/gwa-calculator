import { describe, expect, it } from "vitest";

import { safeRedirect, withRedirect } from "./redirect";

describe("safeRedirect", () => {
  it("keeps same-site paths, query strings included", () => {
    expect(safeRedirect("/leaderboard/?join=K7P2QX9M")).toBe("/leaderboard/?join=K7P2QX9M");
    expect(safeRedirect("/account")).toBe("/account");
  });

  it("falls back to the default for anything else", () => {
    for (const bad of [null, undefined, "", "leaderboard", "//evil.example", "/\\evil.example","https://evil.example", "javascript:alert(1)", "/\t/evil.example", "/\n/evil.example"]) {
      expect(safeRedirect(bad)).toBe("/");
    }
  });
});

describe("withRedirect", () => {
  it("carries a safe destination, encoded", () => {
    expect(withRedirect("/register", "/leaderboard/?join=AB")).toBe("/register?redirect=%2Fleaderboard%2F%3Fjoin%3DAB");
    expect(withRedirect("/register", null)).toBe("/register");
    expect(withRedirect("/login", "//evil.example")).toBe("/login?redirect=%2F");
  });
});

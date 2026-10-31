import { describe, expect, it, vi } from "vitest";

import type { MenuGroup } from "@/components/shared/menu-types";
import { buildSubjectMenuGroups, type SubjectMenuOptions } from "@/features/calculator/lib/subject-menu-groups";

function options(overrides: Partial<SubjectMenuOptions> = {}): SubjectMenuOptions {
  return {
    actions: {
      onAdd: vi.fn(),
      onReset: vi.fn(),
      onSaveSemester: vi.fn(),
      onImport: vi.fn(),
      onExport: vi.fn(),
      onQrTransfer: vi.fn(),
      onSemesterReport: vi.fn(),
      onAcademicSummary: vi.fn(),
      onSave: vi.fn(),
      onShare: vi.fn(),
    },
    hasSemesters: true,
    autosave: true,
    onAutosaveChange: vi.fn(),
    ...overrides,
  };
}

const ids = (groups: MenuGroup[]) => groups.flatMap((group) => group.items.map((item) => item.id));

describe("buildSubjectMenuGroups", () => {
  it("lists the desktop menu without headings or Reset", () => {
    const groups = buildSubjectMenuGroups(options());

    expect(groups.map((group) => group.id)).toEqual(["semester", "share", "transfer", "reports", "saving"]);
    expect(groups.every((group) => group.label === undefined)).toBe(true);
    expect(ids(groups)).toEqual([
      "save-semester",
      "share",
      "import",
      "export",
      "qr",
      "semester-report",
      "summary",
      "save",
      "autosave",
    ]);
  });

  it("adds headings and a destructive Reset for the phone sheet", () => {
    const onRequestReset = vi.fn();
    const groups = buildSubjectMenuGroups(options({ onRequestReset }));
    const last = groups.at(-1)!;

    expect(groups.slice(0, 5).every((group) => typeof group.label === "string")).toBe(true);
    expect(last.items).toEqual([expect.objectContaining({ id: "reset", destructive: true, onSelect: onRequestReset })]);
  });

  it("drops QR Transfer and Academic Summary when they don't apply", () => {
    const base = options({ hasSemesters: false });
    const groups = buildSubjectMenuGroups({ ...base, actions: { ...base.actions, onQrTransfer: undefined } });

    expect(ids(groups)).not.toContain("qr");
    expect(ids(groups)).not.toContain("summary");
  });

  it("exposes Autosave as a toggle bound to the current setting", () => {
    const onAutosaveChange = vi.fn();
    const toggle = buildSubjectMenuGroups(options({ autosave: false, onAutosaveChange }))
      .flatMap((group) => group.items)
      .find((item) => item.id === "autosave");

    expect(toggle).toMatchObject({ kind: "toggle", checked: false });
    if (toggle?.kind === "toggle") toggle.onCheckedChange(true);
    expect(onAutosaveChange).toHaveBeenCalledWith(true);
  });
});

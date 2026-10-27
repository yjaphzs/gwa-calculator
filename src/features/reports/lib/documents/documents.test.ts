import { describe, expect, it } from "vitest";

import { buildAcademicSummary } from "@/features/reports/lib/documents/academic-summary";
import { buildSemesterReport } from "@/features/reports/lib/documents/semester-report";
import type { Semester, Subject } from "@/types";

const NOW = new Date(2026, 9, 28);
const identity = { appName: "GWA Calculator", appUrl: "https://gwa-calculator.yjaphzs.xyz" };

const subject = (id: string, grade: number, units: number, code = `C${id}`, title = `Subject ${id}`): Subject => ({
  id,
  code,
  title,
  grade,
  units,
});

const semester = (id: string, term: string, schoolYear: string, subjects: Subject[]): Semester => ({
  id,
  semester: term,
  schoolYear,
  subjects,
});

// The guide's worked example: 24.25 ÷ 16 = 1.516 → College Scholar.
const fiveSubjects = [
  subject("1", 1.25, 3),
  subject("2", 1.75, 4),
  subject("3", 1.5, 3),
  subject("4", 1.0, 3),
  subject("5", 2.0, 3),
];

describe("buildSemesterReport", () => {
  it("shows totals, the division, the GWA, and the honor", () => {
    const { html } = buildSemesterReport({ ...identity, subjects: fiveSubjects }, NOW);
    expect(html).toContain("24.25");
    expect(html).toContain("GWA = 24.25 ÷ 16 = <strong class=\"mono\">1.516</strong>");
    expect(html).toContain("College Scholar");
  });

  it("escapes user-entered text everywhere", () => {
    const evil = "<script>alert(1)</script>";
    const { html } = buildSemesterReport(
      {
        ...identity,
        studentName: evil,
        schoolName: `"School" & <b>`,
        program: evil,
        periodLabel: evil,
        subjects: [subject("1", 1.0, 3, evil, evil)],
      },
      NOW,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&quot;School&quot; &amp; &lt;b&gt;");
  });

  it("omits empty identity rows for guests", () => {
    const { html } = buildSemesterReport({ ...identity, subjects: fiveSubjects }, NOW);
    expect(html).not.toContain("<dt>Student</dt>");
    expect(html).not.toContain("<dt>School</dt>");
    expect(html).toContain("<dt>Generated</dt>");
  });

  it("includes school and program when set", () => {
    const { html } = buildSemesterReport(
      { ...identity, studentName: "Juan", schoolName: "Adamson University", program: "Engineering", subjects: fiveSubjects },
      NOW,
    );
    expect(html).toContain("<dd>Adamson University</dd>");
    expect(html).toContain("<dd>Engineering</dd>");
  });

  it("always carries the personal-copy disclaimer and footer", () => {
    const { html } = buildSemesterReport({ ...identity, subjects: fiveSubjects }, NOW);
    expect(html).toContain("not</strong> an official academic record");
    expect(html).toContain("Personal copy");
    expect(html).toContain("Personal reference copy, not an official record");
    expect(html).toContain("gwa-calculator.yjaphzs.xyz");
  });

  it("lists excluded and INC subjects but leaves them out of the totals", () => {
    const { html } = buildSemesterReport(
      {
        ...identity,
        subjects: [
          subject("1", 1.0, 12),
          { ...subject("2", 1.5, 3, "NSTP1", "NSTP 1"), excluded: true },
          { ...subject("3", 0, 3, "ENG9", "English 9"), mark: "INC" },
        ],
      },
      NOW,
    );
    expect(html).toContain("GWA = 12.00 ÷ 12 = <strong class=\"mono\">1.000</strong>");
    expect(html).toContain('<span class="tag">Not counted</span>');
    expect(html).toContain('<span class="tag">Incomplete</span>');
    expect(html).toContain('<td class="num">INC</td>');
    expect(html).toContain("2 not counted");
  });

  it("explains a missing honor below 12 units", () => {
    const { html } = buildSemesterReport({ ...identity, subjects: [subject("1", 1.0, 3)] }, NOW);
    expect(html).toContain("Needs 12+ units");
  });

  it("uses the period in the title (the PDF file name)", () => {
    expect(buildSemesterReport({ ...identity, periodLabel: "First Semester, S.Y. 2025-2026", subjects: [] }, NOW).title).toBe(
      "Semester Report, First Semester, S.Y. 2025-2026",
    );
  });
});

describe("buildAcademicSummary", () => {
  const sems = [
    semester("b", "Second", "2024-2025", [subject("b1", 2.0, 24)]),
    semester("a", "First", "2024-2025", [subject("a1", 1.0, 12)]),
  ];

  it("lists semesters oldest first and computes the unit-weighted cumulative", () => {
    const { html } = buildAcademicSummary({ ...identity, semesters: sems }, NOW);
    expect(html.indexOf("First Semester, S.Y. 2024-2025")).toBeLessThan(
      html.indexOf("Second Semester, S.Y. 2024-2025"),
    );
    expect(html).toContain("1.667"); // (12×1 + 24×2) / 36, not (1 + 2) / 2
  });

  it("draws the trend chart only with two or more semesters", () => {
    expect(buildAcademicSummary({ ...identity, semesters: sems }, NOW).html).toContain("<svg viewBox=\"0 0 680");
    expect(buildAcademicSummary({ ...identity, semesters: sems.slice(0, 1) }, NOW).html).not.toContain("GWA by semester");
  });

  it("shows Latin honors on the cumulative standing", () => {
    const honors = [semester("x", "First", "2025-2026", [subject("x1", 1.0, 15)])];
    expect(buildAcademicSummary({ ...identity, semesters: honors }, NOW).html).toContain("Summa Cum Laude");
  });

  it("escapes free-text school years in labels and the chart", () => {
    const evil = [
      semester("e1", "First", "<img src=x>", [subject("1", 1.5, 12)]),
      semester("e2", "Second", "<img src=x>", [subject("2", 1.5, 12)]),
    ];
    const { html } = buildAcademicSummary({ ...identity, semesters: evil }, NOW);
    expect(html).not.toContain("<img src=x>");
  });
});

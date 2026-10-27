---
name: gwa-domain-rules
description: The GWA Calculator's academic rules — GWA formula and rounding, the grade and unit options, semester honor bands (University Scholar, College Scholar, Dean's Lister), Latin honors, the 12-unit gate, and leaderboard eligibility. Use whenever code or copy computes, displays, explains, or tests a GWA or honor — the calculator, semesters, reports, the how-to-compute guide page, the leaderboard, or functions/.
---

# GWA domain rules

## Single source of truth

All client math lives in **`src/lib/academic.ts`**. Use its exports — never re-implement:

| Export | Meaning |
|---|---|
| `computeGwa(subjects)` | `{ gwa, totalUnits }`; `gwa = Σ(grade × units) ÷ Σ units`, rounded to **3 decimals** (`toFixed(3)`); `null` when units = 0 |
| `getHonorFor(subjects)` | semester honor with the unit gate applied |
| `getAcademicHonor(gwa)` | semester bands (no gate) |
| `getLatinHonor(gwa)` | graduation bands — cumulative standing only |
| `HONOR_MIN_UNITS` | `12` — no honor shown below this many units |
| `ACADEMIC_HONOR_BANDS`, `LATIN_HONOR_BANDS` | band tables used to render honors in the UI/guide |
| `GRADE_OPTIONS`, `UNIT_OPTIONS` | what the subject form offers |
| `countsTowardGwa`, `SUBJECT_MARKS` | excluded / INC / DRP / W / IP subjects are skipped by every GWA |
| `src/lib/gwa-insights.ts` | `honorProgress`, `describeHonorProgress`, `requiredTermGwa` (client-only) |

## The rules

- **Scale:** 1.00 is the best, 5.00 is failing. Lower GWA = better.
- **Grades offered:** 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00.
  **Units:** whole numbers 1–10 in the form (imports may carry decimals).
- **Semester honors** (needs ≥ 12 units):
  University Scholar 1.00–1.50 · College Scholar >1.50–1.75 · Dean's Lister >1.75–2.00.
- **Latin honors** (cumulative, Academic Summary only):
  Summa Cum Laude 1.00–1.20 · Magna Cum Laude >1.20–1.45 · Cum Laude >1.45–1.75.
- **Not counted:** `excluded: true` (school policy, e.g. NSTP) or `mark: "INC" | "DRP" | "W" | "IP"`.
  IP (in progress) is for courses that continue into the next term; the final grade is usually
  entered in the semester the course is completed, or edited into the saved semester
  (`updateSemesterSubject`) when a school back-fills it.
  These subjects stay listed but contribute neither grade nor units. Marked subjects store
  `grade: 0`.
- **Cumulative GWA** is unit-weighted across **all** subjects of all semesters
  (`computeGwa(allSubjects)`), **not** the average of semester GWAs.
- Band edges are inclusive on the upper bound (`<=`), exclusive on the lower (`>`), except
  the first band which starts at `>= 1.00`.

## Server copy — keep in sync

`functions/src/lib/academic.ts` duplicates `computeGwa`, the bands, and `HONOR_MIN_UNITS`
because the functions package can't import from `src/`. Any change to bands, rounding,
`countsTowardGwa`, or the gate must be made in **both** files (and redeployed). It also defines leaderboard gates:
`LEADERBOARD_MIN_UNITS = 120`, `LEADERBOARD_MIN_SEMESTERS = 8`,
`LEADERBOARD_SEMESTER_MIN_UNITS = 12`.

## Places that must agree with these rules

- Calculator GWA card and celebration dialog (`src/features/calculator/`)
- Semester tiles (`src/features/semesters/`)
- Printable reports (`src/features/reports/`) — semester honors per section, Latin on the cumulative
- The guide page `/how-to-compute-gwa` (`src/features/guide/`) — renders bands from the tables,
  and its worked example is computed with `computeGwa` (1.516 → College Scholar)
- Leaderboard (`functions/src/lib/leaderboard.ts`)
- Tests: `src/lib/academic.test.ts` — extend it for any rule change.

## Wording

Say "General Weighted Average (GWA)". Grade descriptions/percent equivalents vary by school —
present them as typical, and tell users to confirm with their registrar.

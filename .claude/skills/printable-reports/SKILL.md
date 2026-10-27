---
name: printable-reports
description: How the GWA Calculator's printable documents (Semester Report, Academic Summary) are built and printed, and the legal/disclaimer rules they must follow. Use when editing anything in src/features/reports/, changing what a report shows, its styling, print behavior, or names, or when touching the Terms/Privacy wording about reports.
---

# Printable reports

Two documents, printed or saved as PDF from the browser:

- **Semester Report:** one semester (or the current working set). Subjects, units, grades,
  GWA, and honor.
- **Academic Summary:** every saved semester, oldest first. Includes an overview table, a
  GWA trend chart (shown when there are 2 or more semesters), per-semester sections, and a
  cumulative GWA with Latin honors.

## Non-negotiable rules

1. **They are personal-reference copies, not official records.** Every document must render
   the disclaimer (`blocks/disclaimer.ts`), the "PERSONAL COPY" chip, and the running footer.
   Don't add anything that makes a document look school-issued: no crests, signatures, seals,
   or "certified" or "official" wording.
2. **Never use registrar names.** The documents are not called "COG", "TOR",
   "Certificate of Grades", or "Transcript".
3. **Keep the legal pages in sync.** If you change a document's name, or what personal data it
   contains (name, school, program), update both of these and their "Last updated" dates:
   - `src/app/(legal)/terms-and-conditions/page.tsx` §2 and §5
   - `src/app/(legal)/privacy-policy/page.tsx` §9
4. **Escape all user input.** That means subject codes and titles, the student name, school,
   program, and term labels. Use `escapeHtml` from `lib/format.ts`. The documents are raw
   HTML strings.
5. **Not-counted subjects stay listed.** Rows for excluded and INC/DRP/W subjects are muted,
   tagged, and show "Not counted" in place of Grade × units. Totals and the division use
   only counted subjects (`weightedSum`, `computeGwa`).
6. **No em dashes in report text.** Write empty values as "N/A" or "None".
7. **Compute GWA and honors only with `@/lib/academic`.** Semester sections use
   `getAcademicHonor` with the 12-unit gate. The cumulative uses `getLatinHonor`.

## How it's built

`src/features/reports/lib/` builds a **self-contained HTML string**: inline CSS, an inline SVG
logo, and no external fonts or images. It prints that string through a **hidden iframe**, so
the document is isolated from the app's Tailwind and dark mode.

```
index.ts                  public API: printSemesterReport(opts), printAcademicSummary(opts)
format.ts                 escapeHtml, formatGrade/Units/Gwa, formatDate, displayHost
theme.ts                  print color tokens (zinc-900 band, amber stripe, inks) and font stacks
styles/                   base (frame + running footer), components, print (@page, breaks); index joins them
blocks/chrome.ts          header band + inline SVG logo, running footer, disclaimer
blocks/summary.ts         student details, stat tiles, honor pill, section head, cumulative panel
blocks/tables.ts          subjects table (Grade × units, totals, formula line), semester overview
blocks/trend-chart.ts     GWA-by-semester SVG line (≥ 2 semesters; 1.00 at the top)
documents/                semester-report, academic-summary (compose blocks), shared (options, honor tile)
render-document.ts        <!doctype> shell + page frame + <title> (the browser uses it as the PDF name)
print-html.ts             iframe printer: waits for fonts + a frame, prints, cleans up on afterprint
```

The options take `appName`, `appUrl` and `subjects` or `semesters`, plus these optional
fields: `studentName`, `schoolName`, `program` and `periodLabel`. Guests have no profile,
so every optional row must disappear cleanly when its value is empty. The callers live in
`src/features/reports/hooks/use-report-actions.ts`.

**Preview without printing:** the `buildSemesterReport` / `buildAcademicSummary` builders
in `documents/` return `{ title, html }`. Write that HTML to a file and open it in a browser,
or print it to PDF headlessly, to check the layout.

## Print constraints

- Use `print-color-adjust: exact` (with the `-webkit-` prefix) on every element that relies on
  a background: the header band, tiles and zebra rows. Without it, Chrome drops backgrounds
  when "Background graphics" is off.
- Don't set a fixed `@page size`. The layout must fit A4, Letter and long bond.
- The running footer repeats on every page through the `thead`/`tfoot` spacer frame and a
  fixed footer.
- Page numbers come from `@page` margin boxes as progressive enhancement. In Chromium, these
  also hide the browser's own about:blank header and footer.
- Table rows avoid breaking, headings stay with their table, and long tables can break
  across pages (`thead` repeats).
- Never print on a fixed timer. Wait for the iframe `load` event and `document.fonts.ready`.

## Verify

- `npm test` runs the `documents/*.test.ts` checks: escaping, omitted empty rows, totals,
  disclaimer present, order and chart gating.
- Print preview in Chrome or Edge and in Firefox:
  - with background graphics on and off
  - on A4 and Letter
  - with a semester long enough to span two pages
  - as a guest, and signed in with a school and program set

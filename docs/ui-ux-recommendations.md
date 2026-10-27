# UI/UX recommendations

A prioritized proposal from the v2.3.0 audit. **Status as of v2.4.0: every item except #15 is
implemented.** Each section keeps the original rationale and adds what was built.

**Impact** is how much users notice or benefit. **Effort** is S (under an hour), M (half a day) or
L (a day or more).

## At a glance

| # | Recommendation | Impact | Effort | Status |
|---|---|---|---|---|
| 1 | Fix the fonts that never load | High | S | Done |
| 2 | Label the GWA card and show progress toward honors | High | M | Done |
| 3 | Undo for deleting a subject | High | S | Done |
| 4 | Fix the search shortcut hint (shows ⌘K, actually Ctrl/⌘+F) | Medium | S | Done |
| 5 | Validate subject code and title; stop saving placeholders as data | Medium | S | Done |
| 6 | Keep the GWA readout from overflowing on small phones | Medium | S | Done |
| 7 | Shared top navigation: Calculator · Guide · Leaderboard | High | M | Done |
| 8 | Show the Semesters tab before the first save, with an empty state | Medium | S | Done |
| 9 | One-step "Save as semester" | Medium | M | Done |
| 10 | GWA trend chart in the Semesters tab | Medium | M | Done |
| 11 | Accessibility gaps (leaderboard honor badge, fireworks overlay, logo link) | Medium | S | Done |
| 12 | Honor and status color tokens | Low | S | Done |
| 13 | Exclude-from-GWA toggle (NSTP/PE) and INC/DRP/W marks | High | L | Done |
| 14 | Target-GWA planner | High | L | Done |
| 15 | Per-school grading and honor rules | Medium | L | Deferred |
| 16 | SEO and sharing: sitemap, robots, OG image, manifest | Medium | S | Done |

## 1. Fix the fonts that never load *(do this first)*

**Done in v2.4.0.** Moved the font variables to `<html>` in `src/app/layout.tsx`. Roboto, Martian Mono, and Roboto Serif now load everywhere.

`src/app/layout.tsx` puts the `next/font` variables (`--font-roboto`, `--font-martian-mono`,
`--font-roboto-serif`) on `<body>`. `globals.css` then reads them on `:root`
(`--font-sans: var(--font-roboto), …`).

At `:root` those variables don't exist yet, so `--font-sans` and its siblings resolve to nothing.
**The whole app renders in the system UI font**: Roboto, Martian Mono and Roboto Serif never
apply. I confirmed this in the browser: computed `--font-sans` is empty, and `.font-mono` elements
use `system-ui`.

- **Fix:** move the three `.variable` classes from `<body>` to `<html>` in `layout.tsx`.
- **Watch:**
  - Martian Mono is a wide face. After the fix, check the `text-6xl` GWA readout at 320px
    (see #6) and the leaderboard rows.
  - The how-to-compute guide already uses `font-serif` headings and `font-mono` figures, so it
    picks up its intended look automatically.

## 2. Label the GWA card and show progress toward honors

**Done in v2.4.0.** `GwaSummary` shows units and subjects counted, the honor badge, and a progress line from `honorProgress` / `describeHonorProgress` (`src/lib/gwa-insights.ts`), shared with the guide's try-it widget.

The GWA card (`features/calculator/components/gwa-summary.tsx`) shows a bare number. It reads "0"
when empty and has no label or unit count.

- Add a label and context: "GWA", then "· 21 units · 7 subjects" in muted text.
- Add a progress line under the number, for example:
  - "Add 3 more units to qualify for honors"
  - "0.08 from College Scholar"
  - "Dean's Lister · next band at 1.75"
- `features/guide/components/interactive/formula-breakdown.tsx` already computes "units short".
  Extract that into `lib/academic.ts` (e.g. `honorProgress(subjects)`) and reuse it, so the guide
  and the calculator agree.
- **Why:** the 12-unit rule is invisible today. Users with 9 units see a great GWA and no honor,
  with no explanation.

## 3. Undo for deleting a subject

**Done in v2.4.0.** Deleting a subject shows a toast with **Undo** that restores it at its original position (`use-subject-actions.ts`).

Deleting a subject is instant and irreversible (`subject-list-item.tsx` → `deleteSubject`). Reset
and semester delete both confirm first.

- Rather than adding a confirm dialog, show a toast with an **Undo** action. `sonner` supports
  `toast("Deleted MATH101", { action: { label: "Undo", onClick } })`.
- Restore the subject at its original index.

## 4. Fix the search shortcut hint

**Done in v2.4.0.** The shortcut is now Ctrl/⌘ + K (`useFocusShortcut("k")`), and the hint shows Ctrl or ⌘ per platform (`useIsMac`).

- **The mismatch:** the search box shows a ⌘ + K hint (`subjects-search-bar.tsx`), but the
  shortcut is Ctrl/⌘ + F (`calculator-view.tsx` → `useFocusShortcut("f")`).
- **Why the current key is risky:** it also hijacks the browser's own find.
- **Fix:** switch to `/` or Ctrl/⌘ + K, and show Ctrl on Windows and Linux.

## 5. Validate subject code and title

**Done in v2.4.0.** Code and title are trimmed and length-limited; blank fields fall back to the numbered default shown as the placeholder instead of being pre-filled.

- `subject-form.tsx` validates with `z.string()` only, so an empty code or title saves fine.
- New subjects are pre-filled with "CODE0001" / "Subject 1" as **values**, so users often save
  the placeholders.
- **Fix:** use `.trim().min(1)`, and move the generated text into `placeholder`.

## 6. Keep the GWA readout from overflowing

**Done in v2.4.0.** Readout is `text-5xl sm:text-6xl` with `px-5 sm:px-8`; the toolbar wraps on phones (verified at 375px, no horizontal scroll).

`text-6xl font-mono`, plus the copy button and `px-8`, overflows at about 320–360px. This gets
worse with Martian Mono after #1.

- **Fix:** `text-5xl sm:text-6xl` and `px-5 sm:px-8`, or stack the copy button under the number
  on mobile.

## 7. Shared top navigation

**Done in v2.4.0.** One `SiteHeader` now frames every page except the auth screens (via `AppShell`). It's wider than the reading column (max-w-5xl), with the brand left, `MainNav` (Calculator, How it works, Leaderboard) centered, and actions right. Below md the nav becomes an icon tab bar. The version moved to the footer, and the duplicate `AppHeader` / `SubpageHeader` were removed.

The calculator header (`components/layout/site-header.tsx`) has no links. Other pages use the
mini `SubpageHeader`.

- **Leaderboard:** only reachable from the signed-in avatar menu, so guests never discover it.
- **Guide:** only linked from the GWA card and the footer.
- **Fix:** add a compact nav — Calculator · How it works · Leaderboard — to `SiteHeader` and
  `SubpageHeader`. On mobile, use a sheet or a bottom bar. Leaderboard can show guests a teaser
  that asks them to sign in.

## 8. Show the Semesters tab before the first save

**Done in v2.4.0.** Both tabs always render; `SemestersPanel` shows an empty state with "Save current subjects as a semester".

The tab list only appears after the first semester is saved (`calculator-view.tsx`), so the
feature is invisible to new users.

- **Fix:** always render both tabs. Give the Semesters tab an empty state that explains semesters
  and offers "Save current subjects as a semester".

## 9. One-step "Save as semester"

**Done in v2.4.0.** The ⋯ menu item opens the form directly, and a visible **Save as semester** button appears once there are 12+ counted units.

Saving takes four steps: ⋯ menu → confirm dialog → a second form dialog → save
(`save-semester-menu-item.tsx` → `SemesterEditorDialog`).

- **Fix:** drop the confirm and open the form directly. The form already previews the subjects
  being archived. Also surface the action as a visible button once there are 12 or more units.

## 10. GWA trend chart in the Semesters tab

**Done in v2.4.0.** `SemesterTrendChart` shares `src/lib/trend-geometry.ts` with the report chart and adds a hover/focus tooltip.

The Academic Summary now has a GWA-by-semester line (`features/reports/lib/blocks/trend-chart.ts`).

- **Fix:** bring the same chart into the Semesters tab as a small React SVG. Follow the same
  rules: single hue, 1.00 at the top, first and last points labeled, and a hover tooltip on
  screen.
- **Why:** it's the most motivating view for returning users.

## 11. Accessibility gaps

**Done in v2.4.0.** `HonorBadge` keeps the honor name for screen readers when compact; fireworks are fixed, click-through, and skipped under reduced motion; the header logo links home. Also fixed: `FormSelectField` selects had no accessible name (FormControl now wraps the trigger).

- **Leaderboard honor badge** (`ranked-list-item.tsx`): on mobile it's icon-only with no
  accessible name. Add `<span className="sr-only">` text.
- **Fireworks overlay** (`calculator-view.tsx`): it is `absolute inset-0` inside a non-positioned
  root, so it only covers the first viewport. Use `fixed inset-0 pointer-events-none`, and skip
  it under `prefers-reduced-motion`.
- **Logo link:** the header logo (`app-header.tsx`) links to the external personal site, while
  every other page's logo goes home. Make both go to `/`, and move the personal link to the
  footer credit, which already has it.
- **Already fixed in this refactor:**
  - icon buttons in subject rows now have labels (they used to say "Media controls")
  - the delete-account confirm input and the switches are labeled

## 12. Honor and status color tokens

**Done in v2.4.0.** Added `--honor*`, `--chart-line`, and `--status-*` tokens (light and dark) and the shared `HonorBadge`; changelog dots use the status tokens.

Honors use ad-hoc colors: an amber medal, and amber pills in reports. "What's new" uses raw
emerald and sky classes.

- **Fix:** add `--honor` and `--status-new` / `--status-improved` tokens to `globals.css` (light
  and dark), so badges, reports and the changelog share one palette. See
  [design-system.md](design-system.md).

## 13. Exclude-from-GWA toggle and INC/DRP/W marks

**Done in v2.4.0.** Subjects carry optional `excluded` and `mark` (INC/DRP/W), set from a "Counts toward GWA?" select. `computeGwa` skips them via `countsTowardGwa`, mirrored in `functions/src/lib/academic.ts`; lists and reports show them muted and tagged.

The guide tells users to leave out NSTP, PE and incomplete marks. The calculator can't represent
them, so users delete those subjects and lose the record.

- **Data model:** add `Subject.excluded?: boolean` and `Subject.mark?: "INC" | "DRP" | "W"`.
  `computeGwa` skips excluded or marked rows. Reports show them greyed out with a note.
- **Touches:**
  - `src/lib/academic.ts` **and** `functions/src/lib/academic.ts` (keep them in sync)
  - import validation (`features/transfer/lib/calculator-io.ts`)
  - the leaderboard trigger
- Bump the minor version and add a changelog entry.

## 14. Target-GWA planner

**Done in v2.4.0.** `TargetPlanner` on the Semesters tab uses `requiredTermGwa` against the Latin honor cutoffs.

"What do I need next semester to reach Cum Laude?" Given the cumulative units and GWA, plus
next term's planned units, solve for the needed term GWA. All the math is in `lib/academic.ts`.

- **Where:** a card in the Semesters tab, or a section of the guide.
- **Why:** high-value and easy to share.

## 15. Per-school grading and honor rules

**Deferred.** Deferred until the rules for specific schools are available.

- **Today:** bands are hard-coded to one common scheme. The guide and reports already say "your
  school may differ".
- **Option:** let a school in `config/schools.ts` carry optional band overrides and a
  percentage scale.
- **Pre-requisite:** honor and GWA logic must stay in sync with `functions/`. Do #13 first.

## 16. SEO and sharing

**Done in v2.4.0.** Added `sitemap.ts`, `robots.ts`, a static `public/og-image.png` (large card), a filled-in manifest, a canonical URL for `/`, and FAQPage JSON-LD on the guide.

- **`/` metadata:** `page.tsx` is now a server component, so it can export `metadata`
  (title and description).
- **Sitemap and robots:** add `src/app/sitemap.ts` and `robots.ts` with
  `export const dynamic = "force-static"`.
- **OG image:** add `opengraph-image.tsx`, or a static PNG in `public/`, showing the brand and
  the formula.
- **Manifest:** `public/site.webmanifest` has an empty `name` / `short_name` and a white
  `theme_color`. Set the app name and `#18181b` / `#FBB217`.
- **Guide JSON-LD:** add `FAQPage` structured data (`features/guide/content/faqs.ts` already
  holds the Q&A).

## Suggested bundles

- **Quick polish (a day):** #1, #3, #4, #5, #6, #11, #16
- **Onboarding and navigation (2–3 days):** #2, #7, #8, #9
- **Big update (a week or more):** #10, #13, #14, then #15

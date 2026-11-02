# Architecture

GWA Calculator is a **Next.js 16 static export** (`output: "export"`, built into `out/`) on
Firebase Hosting, using Auth, Firestore, Storage and Cloud Functions.

- There is no app server. Everything interactive is a Client Component, and pages are
  pre-rendered at build time.
- Because of this, **server actions, route handlers, cookies, `headers()`, middleware, and
  runtime data fetching are unavailable**.

## Source layout

```
src/
├─ app/                       Routes only. Thin page.tsx / layout.tsx files that compose
│  │                          feature components, export metadata, and apply guards.
│  ├─ page.tsx                /                    → CalculatorView
│  ├─ (guides)/               /how-to-compute-gwa  (ContentPageLayout, serif headings)
│  ├─ (legal)/                /terms-and-conditions, /privacy-policy
│  ├─ (auth)/                 /login, /register, /forgot-password   (GuestGuard)
│  ├─ auth/action/            Firebase email-action links (verify email, reset password)
│  ├─ achievements/           /achievements (public: badges from the user's own data)
│  ├─ account/                /account      (AuthGuard)
│  └─ leaderboard/            /leaderboard  (AuthGuard; My school and Barkada tabs)
├─ features/
│  ├─ calculator/             working subjects: view, GWA card, toolbar/, list, form, editor dialog, what-if/
│  ├─ semesters/              saved semesters: list, card, form, editor dialog; lib/semesters.ts
│  ├─ persistence/            useCalculatorData + guest/cloud stores, merge dialog
│  ├─ transfer/               JSON import/export, QR transfer (codec in lib/qr-frames.ts)
│  ├─ reports/                printable Semester Report / Academic Summary (lib/ builds HTML)
│  ├─ share/                  share images: studio, templates (classic, receipt, card, pass), moods + seasons, captions
│  ├─ achievements/           badges: definitions (content/), rules, seen tracking, the page
│  ├─ wrapped/                GWA Wrapped: year summary (lib/), story slides, viewer, banner
│  ├─ barkada/                barkada challenges: board, goal, ranking, invites, dialogs
│  ├─ appearance/             color schemes + mode: dialog, derivation, store, pre-paint script
│  ├─ guide/                  the how-to-compute guide: content/ data + sections + try-it widget
│  ├─ leaderboard/            boards, school picker, settings subscription
│  ├─ account/                profile, security cards, leaderboard opt-in settings
│  ├─ auth/                   forms, guards, split layout, action handler
│  └─ changelog/              "What's new" dialog
├─ components/
│  ├─ ui/                     shadcn primitives (generated)
│  ├─ layout/                 site header/footer, subpage header, content layout, brand + mark
│  └─ shared/                 form-dialog, form-select-field, paginator, pagination-summary, …
├─ hooks/                     generic hooks (local storage, latest ref, editor dialog, focus shortcut, …)
├─ lib/                       academic.ts (GWA + honors), pagination, initials, firebase/
├─ config/                    app name/URL, changelog, schools (+ school-names data), routes
├─ context/                   AuthProvider (user + live profile)
└─ types/                     Subject, Semester, CalculatorState, UserProfile, leaderboard types
```

Every source file is at most 200 lines of code and has one responsibility; see
[conventions.md](conventions.md).

## Data flow: the calculator

```
CalculatorView
 ├─ useCalculatorData()            ← persistence facade (same API whether signed in or not)
 │   ├─ useGuestCalculatorStore()     localStorage (gwa_subjects / gwa_semesters / gwa_autosave)
 │   └─ useCloudCalculatorStore()     Firestore users/{uid}/calculator/state
 │        ├─ live onSnapshot (skips own echoes via hasPendingWrites)
 │        ├─ useDebouncedCloudWriter (600 ms; explicit actions write immediately)
 │        └─ first sign-in reconciliation → MergeDialog (merge / keep cloud / keep local)
 ├─ computeGwa / getHonorFor        ← src/lib/academic.ts (useMemo)
 ├─ useSubjectFilter                 search + pagination
 ├─ useSubjectActions / useSemesterActions
 ├─ useFileTransfer / QrTransferDialog
 └─ useReportActions → features/reports/lib → hidden-iframe print
```

The persistence invariants are documented in `.claude/skills/calculator-persistence`. Read it
before changing anything in `features/persistence/`.

## GWA and honors

`src/lib/academic.ts` is the single source of truth for the client:

- `computeGwa` computes Σ(grade × units) ÷ Σ units, rounded to 3 decimals.
- Honors use the band tables `ACADEMIC_HONOR_BANDS` and `LATIN_HONOR_BANDS`, with a
  `HONOR_MIN_UNITS = 12` gate.
- The form options are `GRADE_OPTIONS` and `UNIT_OPTIONS`.

The calculator, semester tiles, reports and the guide page all read from it.
`functions/src/lib/academic.ts` is a deliberate server-side copy and must be kept in sync.

## Printable reports

`features/reports/lib` builds a self-contained HTML string (inline CSS and SVG, escaped input)
and prints it through a hidden iframe. Blocks (`blocks/`) are composed by `documents/`; the
public API is `printSemesterReport` and `printAcademicSummary` in `index.ts`. The rules
(disclaimer, naming, legal-page sync, print CSS) are in `.claude/skills/printable-reports`.
Their brand colors follow the user's color scheme (`lib/palette.ts`, `--report-*` variables).

## Share images

`features/share` builds a `ShareContent` from one scope (the working set, a saved semester, or
all semesters, with `getHonorFor` / `getLatinHonorFor`), applies the user's options (format,
mood, what to show, subject filter), and renders the template to a PNG on the device with
`modern-screenshot` (loaded on first use). Sharing uses the Web Share API with the file (the
phone's share sheet reaches Instagram, Facebook, X…); otherwise the image downloads. Site
links (X, Threads, Facebook) carry the caption and app link only. The studio opens from the
Congratulations dialog, the GWA card, the subjects menu, a semester's menu, and "Share overall".

## Achievements

`features/achievements` judges 16 badges (`content/badges.ts`) from the user's own subjects and
saved semesters (`lib/badge-stats.ts`, `lib/evaluate-badges.ts`; GWA and honors only through
`lib/academic.ts` and `lib/gwa-insights.ts`). `useBadges` runs on the calculator (a toast and a
buzz for badges earned during a visit) and on `/achievements` (marks them seen). The nav's
new-badge dot reads only a localStorage count (`lib/badge-seen.ts`), so other pages never load
calculator data for it.

## GWA Wrapped

`features/wrapped` sums up a school year once it has two saved semesters (`lib/wrapped.ts`:
`wrappedYears`, `buildWrapped`). The viewer shows six 1080×1920 slides, scaled with the share
preview, and each slide exports through the same `renderShareImage` / `shareImage` path as
share images. It opens from the Semesters tab, the achievements page, and a March–June banner
on the Current tab (hidden per school year).

## Barkada challenges

`features/barkada` is the Leaderboard page's Barkada tab. A barkada is one Firestore doc,
`barkadas/{groupId}`, readable only by its members (`memberUids`) and written only by Cloud
Functions (`functions/src/callable/barkada/`, logic in `functions/src/lib/barkada/`):

- **Entries** come from each member's saved semester for the group's term, matched through
  `normalizeTerm`. The server stores the status (graded, under 12 units, waiting), the semester
  honor, and the GWA only as the member chooses: none, the whole number, or all of it.
- **Updates:** `onCalculatorStateWritten` recomputes a member's entries when their saved
  semesters change; changing the term recomputes everyone. The badge count is reported by the
  member's app (`useBarkadaBadgeSync`, only for users known to be in a barkada).
- **Client:** `subscribeMyBarkadas` is one `array-contains` query (at most 5 reads to open).
  `lib/barkada-rank.ts` ranks by honor band, then badges (never GWA), and works out the goal.
- **Invites:** `/leaderboard/?join=CODE` (`useLeaderboardTab`). `AuthGuard` sends the query
  string through sign-in, and `safeRedirect` (`features/auth/lib/redirect.ts`) only follows
  same-site paths.

## Appearance

`features/appearance` keeps the color scheme in a small store (`lib/scheme-store.ts`): it sets
`data-scheme` and the scheme's stylesheet on `<html>`, saves to localStorage, and an inline
script in the root layout restores both before paint. `AppearanceSync` (in the root layout)
applies the signed-in profile's `appearance` and adopts the device's choice for accounts that
have none. Firestore rules validate the field (scheme list, hex accent, mode).

## Firebase

| Piece | Where |
|---|---|
| Client SDK helpers | `src/lib/firebase/`. Firestore is split into `firestore/{profile,leaderboard,calculator,barkada}.ts` behind `firestore/index.ts`. `NEXT_PUBLIC_FIREBASE_EMULATORS=true` points them at the local emulators |
| Rules | `firestore.rules` (deny by default; users touch only their own `users/{uid}` subtree), `storage.rules` |
| Functions | `functions/`, a separate package (Node 24, `asia-southeast1`). Callables: `deleteAccount`, `sendVerificationEmail`, `sendPasswordResetEmail`, `setLeaderboardParticipation`, `setLeaderboardHandle`, `refreshLeaderboardStanding`, `ensureLeaderboardBoard`, and the barkada ones (`createBarkada`, `previewBarkada`, `joinBarkada`, `updateBarkadaMember`, `leaveBarkada`, `manageBarkada`). Trigger: `onCalculatorStateWritten` (republishes leaderboard entries and recomputes barkada entries). Every change to a school's entries rebuilds its `leaderboardBoards/{schoolId}` doc (`lib/leaderboard-board.ts`) |
| Emails | Handlebars `.hbs` templates, compiled into `generated-templates.ts` with `npm run generate:emails`, sent via Resend. When Resend's quota is used up, the client falls back to Firebase Auth's built-in emails (`src/lib/firebase/email-delivery.ts`) |

## Build, test, deploy

| Step | Command / place |
|---|---|
| Lint (includes `max-lines`) | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests (Vitest, pure logic) | `npm test` |
| Static export | `npm run build` → `out/` |
| CI | `.github/workflows/deploy.yml`. Every push runs lint, typecheck and tests. Pushes to `main` also deploy Functions → Hosting → Firestore indexes → rules → Storage |

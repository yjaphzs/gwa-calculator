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
│  ├─ account/                /account      (AuthGuard)
│  └─ leaderboard/            /leaderboard  (AuthGuard)
├─ features/
│  ├─ calculator/             working subjects: view, GWA card, toolbar/, list, form, editor dialog
│  ├─ semesters/              saved semesters: list, card, form, editor dialog; lib/semesters.ts
│  ├─ persistence/            useCalculatorData + guest/cloud stores, merge dialog
│  ├─ transfer/               JSON import/export, QR transfer (codec in lib/qr-frames.ts)
│  ├─ reports/                printable Semester Report / Academic Summary (lib/ builds HTML)
│  ├─ guide/                  the how-to-compute guide: content/ data + sections + try-it widget
│  ├─ leaderboard/            boards, school picker, settings subscription
│  ├─ account/                profile, security cards, leaderboard opt-in settings
│  ├─ auth/                   forms, guards, split layout, action handler
│  └─ changelog/              "What's new" dialog
├─ components/
│  ├─ ui/                     shadcn primitives (generated)
│  ├─ layout/                 site header/footer, subpage header, content layout, brand, theme toggle
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

## Firebase

| Piece | Where |
|---|---|
| Client SDK helpers | `src/lib/firebase/`. Firestore is split into `firestore/{profile,leaderboard,calculator}.ts` behind `firestore/index.ts` |
| Rules | `firestore.rules` (deny by default; users touch only their own `users/{uid}` subtree), `storage.rules` |
| Functions | `functions/`, a separate package (Node 24, `asia-southeast1`). Callables: `deleteAccount`, `sendVerificationEmail`, `sendPasswordResetEmail`, `setLeaderboardParticipation`, `setLeaderboardHandle`, `refreshLeaderboardStanding`. Trigger: `onCalculatorStateWritten` (republishes leaderboard entries) |
| Emails | Handlebars `.hbs` templates, compiled into `generated-templates.ts` with `npm run generate:emails`, sent via Resend |

## Build, test, deploy

| Step | Command / place |
|---|---|
| Lint (includes `max-lines`) | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests (Vitest, pure logic) | `npm test` |
| Static export | `npm run build` → `out/` |
| CI | `.github/workflows/deploy.yml`. Every push runs lint, typecheck and tests. Pushes to `main` also deploy Functions → Hosting → Firestore indexes → rules → Storage |

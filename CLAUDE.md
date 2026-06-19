# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository.

## What this is

**GWA Calculator** — a web app that computes a student's General Weighted
Average and flags academic-honor standing from the subjects, grades, and units
they enter. Live at <https://gwa-calculator.yjaphzs.xyz>.

The calculator is **fully usable without an account** (guest data lives in the
browser). Signing in saves data to Firestore and syncs it live across devices.

- **Framework:** Next.js 16 (App Router), React 19, TypeScript — built as a
  **static export** (`output: 'export'` in [next.config.ts](next.config.ts);
  output lands in `out/`).
- **Backend:** Firebase — Hosting, Authentication, Cloud Firestore, Cloud
  Storage, and Cloud Functions (a **separate npm package** under `functions/`).
- **UI:** Tailwind CSS v4 + shadcn/ui (Radix primitives), `next-themes` dark mode.
- Current app version: see `version` in [package.json](package.json) and the
  newest entry in [src/config/changelog.ts](src/config/changelog.ts) (keep them
  in sync — the changelog drives the in-app "What's new" dialog).

## Commands

Run from the repo root unless noted. **Package manager is `npm`** — never use
`pnpm` or `yarn`.

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build (static export → `out/`) | `npm run build` |
| Lint | `npm run lint` |
| Typecheck (root app only) | `npm run typecheck` |
| Functions build | `cd functions && npm run build` |
| Functions typecheck | `cd functions && npx tsc --noEmit` |
| Regenerate email HTML | `cd functions && npm run generate:emails` |
| Local Firebase emulators | `firebase emulators:start` |

Before committing, run `npm run lint` and `npm run typecheck`; if `functions/`
changed, also run its typecheck. CI runs lint + typecheck on every push.

## Architecture

### Routing (`src/app/`, App Router)

- `/` — the calculator. **Public**; login is optional.
- `(auth)/` route group — `/login`, `/register`, `/forgot-password`.
  **Guest-only** (redirects signed-in users away).
- `(legal)/` route group — `/terms-and-conditions`, `/privacy-policy`.
- `/account` — profile + security tabs. **Auth-only**.
- `/auth/action` — handles Firebase email-action links (verify email, reset
  password) in-app instead of via the default Firebase-hosted page.

Route policy lives in [src/config/routes.ts](src/config/routes.ts); guards are
[src/components/auth-guard.tsx](src/components/auth-guard.tsx) and
[guest-guard.tsx](src/components/guest-guard.tsx). Because the app is a static
export, **everything interactive is a Client Component** (`'use client'`) — there
is no server-side data fetching or runtime route handlers.

### Persistence — the most important piece

[src/hooks/use-calculator-data.ts](src/hooks/use-calculator-data.ts) is a single
hook that unifies guest and signed-in storage behind a `useState`-like API
(`subjects`, `setSubjects`, `semesters`, `setSemesters`, `autosave`, etc.):

- **Guest (signed out):** data is in `localStorage` (keys configurable via
  `NEXT_PUBLIC_APP_LOCAL_STORAGE_*` env vars, default `gwa_subjects` /
  `gwa_semesters` / `gwa_autosave`).
- **Signed in:** data lives in Firestore at `users/{uid}/calculator/state` with a
  live `onSnapshot` subscription and **debounced** writes (600 ms). Own-write
  echoes are skipped via `snapshot.metadata.hasPendingWrites` (latency
  compensation) so concurrent edits aren't clobbered.
- **First sign-in reconciliation:** if both local and cloud have data, the user
  is prompted (merge / keep cloud / keep local) via
  [merge-dialog.tsx](src/components/smart/merge-dialog.tsx). A per-account
  `gwa_reconciled_{uid}` localStorage flag ensures the prompt shows only once
  per device.
- **`autosave` off:** subjects are kept in memory and not persisted until an
  explicit Save; semesters still persist (mirrors the guest behavior).

Touch this hook with care — the merge/echo/debounce logic is subtle and is the
core of cross-device correctness.

### GWA + honors logic

- Calculation lives inline in [src/app/page.tsx](src/app/page.tsx):
  `GWA = Σ(grade × units) / Σ(units)`, rounded to 3 decimals.
- Honor bands are in [src/lib/academic.ts](src/lib/academic.ts): University
  Scholar (1.00–1.50), College Scholar (>1.50–1.75), Dean's Lister (>1.75–2.00).
  Honors only apply when total units ≥ 12.

### Auth + profile

[src/context/auth-provider.tsx](src/context/auth-provider.tsx) wraps the app,
exposing `{ user, profile, loading }` via `useAuth()`. It subscribes live to the
profile doc `users/{uid}` and calls `ensureUserProfile` (idempotent) on sign-in.
Email/password + Google sign-in, email verification, and password reset are all
supported. Firebase client helpers are in
[src/lib/firebase/](src/lib/firebase/) (`auth`, `firestore`, `storage`,
`callable`, `errors`, `client`) and re-exported from `index.ts`.

### Firestore data model + rules

- `users/{uid}` — profile (`email`, `displayName`, `photoURL`, timestamps).
- `users/{uid}/calculator/state` — the synced `CalculatorState`
  (see [src/types/index.ts](src/types/index.ts)).
- `rateLimits/{bucketId}` — server-only buckets for the Cloud Functions.

[firestore.rules](firestore.rules) is **deny-by-default**; users can only read/
write their own subtree. Profile deletion is `false` for clients — it goes
through the `deleteAccount` Cloud Function (Admin SDK) so Auth/Firestore/Storage
cleanup stays atomic.

### Cloud Functions (`functions/`)

Separate npm package, Node 24, region `asia-southeast1`
([functions/src/config.ts](functions/src/config.ts), `maxInstances: 5`). Callables
exported from [functions/src/index.ts](functions/src/index.ts):

- `deleteAccount` — wipes Firestore docs, Storage objects, and the Auth user.
- `sendVerificationEmail`, `sendPasswordResetEmail` — generate the Firebase
  action link, rewrite it to the in-app `/auth/action` handler, and send branded
  HTML via [Resend](https://resend.com). Both are rate-limited
  ([functions/src/lib/rate-limit.ts](functions/src/lib/rate-limit.ts)).

Email HTML is compiled from Handlebars `.hbs` templates in
`functions/src/lib/email/templates/` into the committed `generated-templates.ts`
via `npm run generate:emails` (mailwind inlines the Tailwind styles). **Edit the
`.hbs` source and regenerate — don't hand-edit `generated-templates.ts`.**

### Other notable pieces

- **QR transfer** — [qr-transfer-dialog.tsx](src/components/smart/qr-transfer-dialog.tsx)
  uses `qrcode.react` + `html5-qrcode` with `lz-string` compression to move data
  between devices.
- **Import/Export** — JSON file in/out, handled in `page.tsx`
  (`handleExport` / `handleImport`, with per-field validation).
- **Profile photo** — cropped/compressed client-side
  ([avatar-cropper-field.tsx](src/components/avatar-cropper-field.tsx),
  [src/lib/image-compression.ts](src/lib/image-compression.ts)) and stored in
  Cloud Storage (`storage.rules`).

### Component layout

- `src/components/ui/` — shadcn/ui primitives (mostly generated; avoid heavy edits).
- `src/components/smart/` — feature components (forms, lists, dialogs, toolbar).
- `src/components/dom/` — DOM-specific widgets (e.g. the Ko-fi button).

## Environment

Copy `.env.local.example` → `.env.local` and fill the `NEXT_PUBLIC_*` values
(app config + Firebase Web SDK config + optional App Check reCAPTCHA key). For
local function emails, copy `functions/.env.example` → `functions/.env`
(`RESEND_API_KEY`, `EMAIL_FROM_EMAIL`, `APP_URL`). **Never commit `.env*` files,
service-account JSON, `node_modules/`, `.next/`, `out/`, or `functions/lib/`.**

## Deployment / CI

[.github/workflows/deploy.yml](.github/workflows/deploy.yml):

- Push to **`development`** → lint + typecheck only (CI gate).
- Push to **`main`** → lint + typecheck, then build the static export and deploy
  in order: **Functions → Hosting → Firestore rules → Storage rules** to the
  single Firebase project.
- Markdown / `docs/` / `LICENSE` / `.claude/` changes are `paths-ignore`d.

GitHub repo config: every `NEXT_PUBLIC_*` value (+ `EMAIL_FROM_*`) is a repo
**Variable**; `GOOGLE_APPLICATION_CREDENTIALS_BASE64` and `RESEND_API_KEY` are
**Secrets**. There is one Firebase project (no staging alias).

## Conventions

- **Branches:** `development` (staging) → `main` (production). Open work targets
  `development`; promote to `main` via PR.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) —
  `type(scope): summary`. Helper slash commands exist:
  [`/github-commit-develop`](.claude/commands/github-commit-develop.md) and
  [`/github-pr-develop-release`](.claude/commands/github-pr-develop-release.md).
  > Note: those two command files describe a different project (`carinotailorshop`)
  > in their "Project context" — the *workflow* applies here, but the project facts
  > (scopes, route names) do not. Use this repo's actual structure.
- Common scopes: `app`, `firebase`, `functions`, `auth`, `account`, `ui`,
  `config`, `ci`.

## Printable grade documents

Users can print / save-as-PDF two documents (deliberately **not** branded as the
official registrar documents "COG"/"TOR"):

- **Semester Report** — one semester's subjects, units, grades, GWA, and honor.
- **Academic Summary** — all saved semesters plus a cumulative GWA, with Latin
  (graduation) honors on the overall standing.

Implementation:

- [src/lib/grade-report.ts](src/lib/grade-report.ts) builds a self-contained HTML
  document (inline `<style>`, escaped user input) and prints it via a **hidden
  iframe** — no dependency, isolated from the app's Tailwind/dark mode. Public
  API: `printSemesterReport(...)`, `printAcademicSummary(...)`.
- GWA/honor come from the shared helpers in
  [src/lib/academic.ts](src/lib/academic.ts) (`computeGwa`, `getAcademicHonor`,
  `HONOR_MIN_UNITS = 12`). Per-semester sections use the scholarship honors
  (`getAcademicHonor`: University/College Scholar, Dean's Lister); the Academic
  Summary's cumulative standing uses Latin honors (`getLatinHonor`: Summa
  1.00–1.20 / Magna 1.21–1.45 / Cum Laude 1.46–1.75).
- Entry points: the toolbar "More options" menu
  ([subjects-toolbar.tsx](src/components/smart/subjects-toolbar.tsx)) for the
  current working set + Academic Summary, and per-semester / Academic-Summary
  actions in [semester-list.tsx](src/components/smart/semester-list.tsx). Handlers
  live in [page.tsx](src/app/page.tsx) (`handleSemesterReport`,
  `handleExportSemester`, `handleAcademicSummary`) and read the signed-in user's
  display name via `useAuth()`.

**This is a personal-reference copy only — not an official record.** Every
document renders that disclaimer, and the wording is kept consistent with the
legal pages: see
[terms-and-conditions/page.tsx](<src/app/(legal)/terms-and-conditions/page.tsx>)
(sections 2 and 5) and
[privacy-policy/page.tsx](<src/app/(legal)/privacy-policy/page.tsx>) (section 9).
If you change the document names or what they contain, update those pages too.

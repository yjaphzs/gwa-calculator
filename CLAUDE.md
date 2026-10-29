# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository.

## What this is

**GWA Calculator** is a web app that computes a student's General Weighted Average and flags
academic-honor standing from the subjects, grades, and units they enter. Live at
<https://gwa-calculator.yjaphzs.xyz>.

The calculator is **fully usable without an account**: guest data lives in the browser. Signing
in saves data to Firestore and syncs it live across devices.

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, built as a **static export**
  (`output: 'export'` in [next.config.ts](next.config.ts); output lands in `out/`).
- **Backend:** Firebase Hosting, Authentication, Cloud Firestore, Cloud Storage, and Cloud
  Functions. Functions are a **separate npm package** under `functions/`.
- **UI:** Tailwind CSS v4 + shadcn/ui (Radix primitives), `next-themes` dark mode.
- **Version:** `version` in [package.json](package.json) and the newest entry in
  [src/config/changelog.ts](src/config/changelog.ts). Keep them in sync; the changelog drives the
  in-app "What's new" dialog.

Deeper docs live in [docs/](docs/):
- [architecture.md](docs/architecture.md)
- [conventions.md](docs/conventions.md)
- [design-system.md](docs/design-system.md)
- [ui-ux-recommendations.md](docs/ui-ux-recommendations.md)

## Hard rules

- **Static export.** Server actions, route handlers, cookies, `headers()`, middleware, and
  runtime data fetching are unavailable. Ignore framework or skill advice that assumes a server.
  Interactive code is a Client Component (`"use client"`).
- **Size and focus.** At most **200 lines of code per file** under `src/` (blank lines and
  comments excluded), one responsibility per file. ESLint `max-lines` enforces this as an
  **error**, and CI runs lint. Exempt: `src/components/ui/**`, the vendored `use-local-storage.ts`,
  legal prose pages, `config/school-names.ts`, and tests. Split recipes are in
  [docs/conventions.md](docs/conventions.md).
- **GWA and honor math.** Use only `src/lib/academic.ts`, plus `src/lib/gwa-insights.ts` for
  derived display logic (honor progress, the target planner). Never inline it.
- **Copy.** No em dashes ("—") in user-facing text. En dashes appear only in number ranges.
  See [docs/conventions.md](docs/conventions.md).
- **Package manager.** `npm` only; never `pnpm` or `yarn`.

## Commands

Run from the repo root unless noted.

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build (static export → `out/`) | `npm run build` |
| Lint (includes the 200-line rule) | `npm run lint` |
| Typecheck (root app only) | `npm run typecheck` |
| Unit tests (Vitest, pure logic) | `npm test` (`npm run test:watch` to iterate) |
| Functions build | `cd functions && npm run build` |
| Functions typecheck | `cd functions && npx tsc --noEmit` |
| Regenerate email HTML | `cd functions && npm run generate:emails` |
| Local Firebase emulators | `firebase emulators:start` |

Before committing, run `npm run lint`, `npm run typecheck`, and `npm test`. If `functions/`
changed, also run its typecheck. CI runs lint, typecheck, and tests on every push.

## Project skills

`.claude/skills/` holds repo-specific skills. Load the matching one before working in its area:

| Skill | Use for |
|---|---|
| `component-architecture` | Creating, moving, or splitting any file under `src/` |
| `gwa-domain-rules` | Anything that computes or explains a GWA or honor |
| `calculator-persistence` | `features/persistence/`, or anything calling the `useCalculatorData` setters |
| `printable-reports` | `features/reports/` and the legal wording about reports |
| `release-changelog` | Version bumps and the "What's new" changelog |
| `functions-and-emails` | `functions/`, callables, and email templates |

The shadcn and Next.js skills are also installed. The Firebase and frontend-design plugins are
enabled in `.claude/settings.json`, and the shadcn MCP server is configured in `.mcp.json`.

## Architecture

### Layout

- `src/app/` holds **routes only**: thin `page.tsx` / `layout.tsx` files that compose feature
  components.
- Feature code lives in `src/features/<feature>/{components,hooks,lib}`. The features are:
  `calculator`, `semesters`, `persistence`, `transfer`, `reports`, `guide`, `leaderboard`,
  `account`, `auth`, `changelog`.
- Shared UI lives in `src/components/{ui,layout,shared}`.
- Generic hooks go in `src/hooks/`, and cross-feature logic in `src/lib/`.
- The full map is in [docs/architecture.md](docs/architecture.md).

### Routing

| Route | Access | Notes |
|---|---|---|
| `/` | Public; login optional | The calculator (`features/calculator/components/calculator-view.tsx`) |
| `/how-to-compute-gwa` | Public | `(guides)` route group: formula, worked example, try-it widget, grade scale, honors, FAQ |
| `(legal)/` | Public | `/terms-and-conditions`, `/privacy-policy`. Shares `ContentPageLayout` with guides |
| `(auth)/` | Guest-only (`GuestGuard`) | `/login`, `/register`, `/forgot-password` |
| `/account` | Auth-only (`AuthGuard`) | Profile, leaderboard opt-in, and security |
| `/leaderboard` | Auth-only (`AuthGuard`) | Per-school overall and per-semester boards |
| `/auth/action` | Public | Handles Firebase email-action links in-app |

- **Guards** live in `src/features/auth/components/`. The layouts apply them, not
  `src/config/routes.ts`.
- **Page frame:** `components/layout/app-shell.tsx` renders the shared `SiteHeader` (brand,
  `MainNav`: Calculator / How it works / Leaderboard, and actions) above a centered content
  column. Every page uses it except the auth split screens. Below `md`, the nav moves to a
  fixed bottom tab bar (`MainNav variant="bar"`, rendered by `AppShell`).
- **Overlays:** on phones, tasks (forms, menus, pickers) open as bottom sheets via
  `components/shared/responsive-dialog.tsx` and `responsive-menu.tsx`; confirmations stay
  `AlertDialog`s. See "Overlays and the mobile shell" in [docs/design-system.md](docs/design-system.md).
- **Site footer:** `components/layout/site-footer.tsx` (full / compact / minimal variants) links
  to the guide and the legal pages.
- **SEO:** `src/app/sitemap.ts` and `robots.ts` (`force-static`), and the share image at
  `public/og-image.png`.

### Persistence (the most important piece)

`useCalculatorData` (`src/features/persistence/hooks/use-calculator-data.ts`) unifies guest and
signed-in storage behind a `useState`-like API. It is a facade over two stores:

- **`useGuestCalculatorStore`** keeps data in `localStorage`. The keys are configurable through
  `NEXT_PUBLIC_APP_LOCAL_STORAGE_*` env vars; the defaults are `gwa_subjects`, `gwa_semesters`,
  and `gwa_autosave`.
- **`useCloudCalculatorStore`** keeps data in Firestore at `users/{uid}/calculator/state`.
  - It uses a live `onSnapshot` subscription.
  - It skips own-write echoes via `hasPendingWrites`.
  - Writes are debounced (600 ms, `useDebouncedCloudWriter`). Explicit actions write immediately
    and cancel any pending debounced write.
- **First sign-in:** when both local and cloud have data, `MergeDialog` asks the user to merge,
  keep cloud, or keep local. A per-account `gwa_reconciled_{uid}` flag makes the prompt show once
  per device.
- **Autosave off:** subjects stay in memory until Save. Semesters still persist.

The pure helpers (`mergeStates`, `sameState`, …) are in `features/persistence/lib/calculator-state.ts`
and have unit tests. **Read the `calculator-persistence` skill before changing any of this.**

### GWA and honors

`src/lib/academic.ts` covers:
- `computeGwa`: Σ(grade × units) ÷ Σ units, rounded to 3 decimals, over subjects that
  `countsTowardGwa`. A subject is skipped when it is `excluded` (e.g. NSTP) or carries a `mark`
  (INC / DRP / W / IP, where IP means in progress); its units don't count either
- `getHonorFor`, which applies the `HONOR_MIN_UNITS = 12` gate
- the band tables `ACADEMIC_HONOR_BANDS` and `LATIN_HONOR_BANDS`
- `GRADE_OPTIONS` and `UNIT_OPTIONS`

The bands:
- **Semester honors:** University Scholar 1.00–1.50, College Scholar >1.50–1.75,
  Dean's Lister >1.75–2.00.
- **Latin honors** (cumulative only): Summa 1.00–1.20, Magna >1.20–1.45, Cum Laude >1.45–1.75.

`functions/src/lib/academic.ts` duplicates this for the leaderboard. **Keep the two files in
sync.**

### Auth and profile

- **App Check** starts on demand (`ensureAppCheck` in `src/lib/firebase/client.ts`): once a
  user is signed in, or on the auth pages. Guests never load reCAPTCHA, whose free tier is
  10,000 assessments a month. Don't start it at import time.
- [src/context/auth-provider.tsx](src/context/auth-provider.tsx) exposes
  `{ user, profile, loading }` via `useAuth()`. It subscribes live to `users/{uid}` and calls
  `ensureUserProfile` (idempotent) on sign-in.
- Supported flows: email/password, Google, email verification, and password reset.
- Firebase client helpers live in [src/lib/firebase/](src/lib/firebase/). Firestore is split into
  `firestore/{profile,leaderboard,calculator}.ts` behind `firestore/index.ts`.

### Firestore data model and rules

| Path | Contents |
|---|---|
| `users/{uid}` | Profile: `email`, `displayName`, `photoURL`, optional `schoolId` / `schoolName` / `schoolType` / `program`, timestamps |
| `users/{uid}/calculator/state` | The synced `CalculatorState` ([src/types/index.ts](src/types/index.ts)). A `Subject` may carry optional `excluded` / `mark`; omit these keys when unset, since Firestore rejects `undefined` (see `buildSubject`) |
| `users/{uid}/leaderboard/settings` | Opt-in and handle. Server-written, owner-readable |
| `leaderboard/*`, `leaderboardSemesters/*` | Published board entries (server-written) |
| `leaderboardBoards/{schoolId}` | Precomputed board per school: top overall + per-term entries in one doc. Rebuilt by Functions whenever that school's entries change; the leaderboard page reads only this (1 read per view) |
| `rateLimits/{bucketId}` | Server-only buckets for the Cloud Functions |

- [firestore.rules](firestore.rules) is **deny-by-default**: users can only read and write their
  own subtree.
- Clients cannot delete a profile. Deletion goes through the `deleteAccount` Cloud Function.

### Cloud Functions (`functions/`)

- **Runtime:** Node 24, region `asia-southeast1`, `maxInstances: 5`
  ([functions/src/config.ts](functions/src/config.ts)).
- **Callables:** `deleteAccount`, `sendVerificationEmail`, `sendPasswordResetEmail` (both
  rate-limited and sent via Resend), `setLeaderboardParticipation`, `setLeaderboardHandle`,
  `refreshLeaderboardStanding`, and `ensureLeaderboardBoard` (builds a missing school board on
  first view).
- **Email quota fallback:** when Resend's free quota (100/day) is used up, the email callables
  signal a fallback and `src/lib/firebase/email-delivery.ts` sends Firebase Auth's built-in
  email instead. Send verification/reset emails through those helpers, not the raw callables.
- **Trigger:** `onCalculatorStateWritten` republishes leaderboard entries.
- **Email HTML** compiles from `.hbs` templates into the committed `generated-templates.ts`.
  **Edit the `.hbs` source and regenerate; don't hand-edit the generated file.**

### Other notable pieces

- **QR transfer:** `features/transfer/`. The frame codec and validation are in
  `lib/qr-frames.ts`, and received data is validated like a file import.
- **Import/Export:** `features/transfer/hooks/use-file-transfer.ts`, with validation in
  `lib/calculator-io.ts`.
- **Profile photo:** cropped and compressed client-side, stored in Cloud Storage
  (`storage.rules`).

## Printable grade documents

Users can print or save as PDF two documents. They are deliberately **not** branded as the
official registrar documents "COG" and "TOR".

- **Semester Report:** one semester's subjects, units, grades, Grade × units, GWA, and honor.
- **Academic Summary:** a semester overview, a GWA-by-semester trend chart, every semester's
  subjects, and the cumulative GWA with Latin honors.

How they're built:
- [src/features/reports/lib/](src/features/reports/lib/) builds a self-contained HTML document
  (inline CSS and SVG, escaped input) and prints it through a hidden iframe.
- `blocks/` holds the parts: header band, details, tiles, tables, chart, running footer, and
  disclaimer. `documents/` composes them.
- The public API is `printSemesterReport` / `printAcademicSummary`, called from
  `features/reports/hooks/use-report-actions.ts`.
- The documents show the signed-in user's name, school, and program when set.

**These are personal-reference copies only, not official records.** Every document renders the
disclaimer and "Personal copy" marks, and the wording matches the legal pages: Terms §2 and §5,
and Privacy §9. If you change the document names or what they contain, update those pages too.
See the `printable-reports` skill.

## Environment

Copy `.env.local.example` to `.env.local` and fill in the `NEXT_PUBLIC_*` values: app config, the
Firebase Web SDK config, and the optional App Check reCAPTCHA key. For local function emails,
copy `functions/.env.example` to `functions/.env` (`RESEND_API_KEY`, `EMAIL_FROM_EMAIL`,
`APP_URL`).
To run the Firebase CLI locally, copy `.firebaserc.example` to `.firebaserc` and set your
project ID. `.firebaserc` is gitignored; CI deploys with `--project` from a repo Variable.

**Never commit** `.env*` files, service-account JSON, `node_modules/`, `.next/`, `out/`,
`functions/lib/`, or `.claude/settings.local.json`.

## Deployment / CI

[.github/workflows/deploy.yml](.github/workflows/deploy.yml):

- **Push to `development`:** lint, typecheck, and tests only (the CI gate).
- **Push to `main`:** the same checks, then it builds the static export and deploys, in order:
  **Functions → Hosting → Firestore indexes → Firestore rules → Storage rules**, to the single
  Firebase project.
- **Ignored paths:** changes to Markdown, `docs/`, `LICENSE`, and `.claude/` don't trigger the
  workflow (`paths-ignore`).

GitHub repo config:
- Every `NEXT_PUBLIC_*` value (and `EMAIL_FROM_*`) is a repo **Variable**.
- `GOOGLE_APPLICATION_CREDENTIALS_BASE64` and `RESEND_API_KEY` are **Secrets**.
- There is one Firebase project (no staging alias).

## Conventions

- **Branches:** `development` (integration) → `main` (production). Open work targets
  `development`; promote to `main` through a PR.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/),
  `type(scope): summary`.
  - Helper commands: [`/github-commit-develop`](.claude/commands/github-commit-develop.md) and
    [`/github-pr-develop-release`](.claude/commands/github-pr-develop-release.md).
  - The scope table is in the commit command.
- **Code style:** see [docs/conventions.md](docs/conventions.md).
  - Named exports.
  - 2-space indentation and double quotes in new or split files.
  - kebab-case file names.
  - Tests sit next to their module as `*.test.ts`.

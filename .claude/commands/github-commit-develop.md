---
description: Commit and push current work to the development branch with a Conventional Commits message
allowed-tools: Bash, Read, Edit, Glob, Grep
---

# github-commit-development

Commit and push the current work to the `development` branch using a clear, review-friendly commit message.

## Project context

This is **GWA Calculator** — a **Next.js 16 (static export) + Firebase** app. Key facts:
- Package manager: `npm`. Never use `pnpm` or `yarn`.
- App source lives under `src/`: routes in `src/app/`, feature code in `src/features/<feature>/`,
  shared UI in `src/components/{ui,layout,shared}/`, plus `src/lib/`, `src/hooks/`,
  `src/context/`, `src/config/`, `src/types/`. See `docs/architecture.md`.
- Cloud Functions live under `functions/` — a **separate** npm package with its own `package.json` and `tsconfig.json`.
- Firebase config: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`.
- CI/CD: `.github/workflows/deploy.yml` — every push runs lint + typecheck + tests; only `main` deploys
  (Functions → Hosting → Firestore indexes → rules → Storage rules) to the single Firebase project.
- Lint (root): `npm run lint` · Typecheck (root, excludes `functions/`): `npm run typecheck` · Tests: `npm test`
- Functions typecheck: `cd functions && npx tsc --noEmit`

## When this command runs

1. **Pre-commit checks**
   From the repo root run:
   ```
   npm run lint
   npm run typecheck
   npm test
   ```
   If any functions files changed, also run:
   ```
   cd functions && npx tsc --noEmit
   ```
   Report any errors. Do **not** proceed to commit if lint, type, or test errors exist — ask the user to resolve them first (or offer to fix them if clearly mechanical).

2. **Inspect the working tree**
   Run `git status` and briefly summarize what changed (files and nature of edits: feature, fix, refactor, config, chore, etc.).
   Call out which area is affected (e.g. `src/features/reports`, `functions/`, `firestore.rules`).

3. **Use the right branch**
   - If not on `development`, switch with `git switch development`.
   - If uncommitted changes would be lost by switching, stash them first (`git stash`) or commit on the current branch and say so.

4. **Stage and commit**
   - Stage all relevant tracked/untracked changes: `git add -A` for a full snapshot, or targeted `git add <paths>` when only a subset belongs in this commit.
   - **Never commit:** `.env*` files, `functions/.env`, `node_modules/`, `.next/`, `out/`, `functions/lib/`, Firebase service-account JSON files, `.claude/settings.local.json`, or any secrets.

5. **Commit message standards**
   Follow [Conventional Commits](https://www.conventionalcommits.org/) for the subject line:

   - **Format:** `type(scope): short imperative summary`
   - **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
   - **Scope:** use the affected area in kebab-case. Use multiple scopes comma-separated when several areas changed: `(reports,legal)`.
   - **Summary:** imperative mood, no period, ≤ 72 characters on the first line.

   **Body (description):** after one blank line, add 1–3 short bullet lines or paragraphs covering:
   - What changed at a high level.
   - Why it changed (if not obvious from the subject).
   - Any follow-ups, breaking changes, or notes relevant to deployment.

   **Scope tips:**
   | Change area | Suggested scope |
   |---|---|
   | `src/app/page.tsx`, `src/features/calculator/` | `calculator` |
   | `src/features/semesters/` | `semesters` |
   | `src/features/persistence/` (sync hook, merge dialog) | `persistence` |
   | `src/features/transfer/` (import/export, QR) | `transfer` |
   | `src/features/reports/` (Semester Report, Academic Summary) | `reports` |
   | `src/features/guide/`, `src/app/(guides)/` | `guide` |
   | `src/app/leaderboard/`, `src/features/leaderboard/` | `leaderboard` |
   | `src/app/account/`, `src/features/account/` | `account` |
   | `src/app/(auth)/`, `src/app/auth/`, `src/features/auth/` | `auth` |
   | `src/app/(legal)/` | `legal` |
   | `src/components/ui/`, `src/components/layout/`, `src/components/shared/` | `ui` |
   | `src/lib/firebase/`, `firestore.rules`, `storage.rules` | `firebase` |
   | `functions/` Cloud Functions | `functions` |
   | `src/config/`, `package.json`, `firebase.json`, `next.config.ts` | `config` |
   | `.github/workflows/` | `ci` |
   | `docs/`, `CLAUDE.md`, `.claude/` | `docs` |
   | `*.test.ts`, `vitest.config.mts` | `test` |

   Example:
   ```text
   feat(reports,legal): add branded header and running footer to reports

   Redesigns the Semester Report and Academic Summary with a branded header
   band, stat tiles, and a per-page footer. Terms §2 and Privacy §9 now
   mention that school and program appear when set.
   ```

6. **Push**
   Push to the remote development branch:
   ```
   git push origin development
   ```
   If the branch has no upstream yet: `git push -u origin development`.

7. **Confirm**
   Report the commit hash, branch name, and that the push succeeded.
   If rejected (non-fast-forward), rebase: `git pull --rebase origin development` then push again.

## Out of scope unless the user asks

Rewriting history, force-pushing `development`, or merging other branches.

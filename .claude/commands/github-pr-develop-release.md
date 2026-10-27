---
description: Open a PR from development into main (production) with the standard four-section template
allowed-tools: Bash, Read, Glob, Grep
---

# github-pr-development-main

Open a **pull request from `development` into `main`** to promote staged work to production. Pattern: **`development`** = integration (CI only), **`main`** = production.

## Project context

This is **GWA Calculator** — a **Next.js 16 (static export) + Firebase** app. Key facts:
- Routes in `src/app/`, feature code in `src/features/<feature>/`, shared UI in `src/components/`,
  plus `src/lib/`, `src/hooks/`, `src/context/`, `src/config/`, `src/types/`. See `docs/architecture.md`.
- Cloud Functions under `functions/` — standalone npm package (Node 24, region `asia-southeast1`).
- Firebase config: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`.
- CI/CD: `.github/workflows/deploy.yml` — pushes to `development` run lint + typecheck + tests only;
  merging to `main` builds the static export and deploys Functions → Hosting → Firestore indexes →
  Firestore rules → Storage rules to the **single** Firebase project (there is no staging alias).
- Branch strategy: `development` → `main` (two-branch workflow).
- Release: `package.json` `version` and the newest entry in `src/config/changelog.ts` must match —
  the changelog drives the in-app "What's new" dialog.

## When this command runs

1. **Sync and verify branches**
   ```
   git fetch origin
   ```
   Confirm `origin/development` and `origin/main` exist. Pull the current branch only if needed.

2. **Avoid duplicate PRs**
   Check for an open PR that already targets `main` from `development` using `gh pr list --base main --head development`.
   If one exists, link it and offer to update the description instead of creating a second PR.

3. **Collect merge metadata**
   Run from repo root:
   ```
   git log origin/main..origin/development --no-merges --pretty=format:"%h|%s|%b|%an|%ae|%cn|%ce%n---END---"
   git diff --stat origin/main...origin/development
   git diff --name-status origin/main...origin/development
   ```
   Use these to populate the PR sections below. Also check that `package.json` `version` matches the
   newest `src/config/changelog.ts` entry; flag it in the summary if not.

   **Scope rules for the Files table:**
   - `src/app/**` → routes; note the specific URL (e.g. `/`, `/how-to-compute-gwa`, `/leaderboard`).
   - `src/features/**` → feature code; name the feature (calculator, semesters, persistence, reports, …).
   - `src/features/persistence/**` → cross-device sync; always flag for QA (merge prompt, live sync, autosave).
   - `src/features/reports/**` and `src/app/(legal)/**` → printable documents and legal wording; flag if the
     disclaimer or document contents changed (they must stay consistent).
   - `src/components/ui/**` → shared UI primitives; flag if visual changes affect all pages.
   - `src/lib/firebase/**` → client SDK helpers; note if callable signatures changed.
   - `src/context/**` → React context providers; note consumer impact.
   - `functions/**` → Cloud Functions; flag if any callable/trigger signature changed or new function deployed.
   - `firestore.rules`, `storage.rules` → Security rules; always flag for QA.
   - `firebase.json`, `next.config.ts` → Hosting / build config.
   - `.github/workflows/**` → CI/CD pipeline changes.

4. **Draft the four PR sections** (see template below).

5. **PR title (required format)**
   Use today's date in **DD.MM.YYYY**:

   `Branch Management: PROD Deployment {DD.MM.YYYY}`

   Example: `Branch Management: PROD Deployment 16.05.2026`

6. **Create the pull request**
   - **Base:** `main`
   - **Head:** `development`

   Use `gh pr create --base main --head development --title "..." --body "{...}"`.

7. **PR description template**

   Use **exactly** these four sections:

   ```markdown
   ## Summary of Changes

   - Short bullets: what is being promoted from `development` to `main` (production) and why.
   - Call out any Firebase rule, Cloud Function, or deployment-config changes.
   - Note any repo Variable or Secret additions that must be set before the deploy succeeds.

   ## Files changed

   | File Path | Description |
   |-----------|-------------|
   | `path/to/file` | What changed and intent. For `firestore.rules` or `functions/` changes, note the security or API impact. |

   ## List of commits

   | Commit id | Title | Description | Authors | Committer |
   |-----------|-------|-------------|---------|-----------|
   | `abc1234` | Conventional subject | Body or `—` | Name / email | `—` if same as author |

   ## What is needed to be tested for QA

   - Numbered checklist tied to the files and commits above.
   - For `functions/` changes: test callable/trigger flows end-to-end with the emulators before promoting.
   - For `firestore.rules` / `storage.rules` changes: verify a user can read/write only their own
     `users/{uid}` subtree and that server-only collections (e.g. `rateLimits`) stay closed to clients.
   - For persistence changes: guest → sign-in merge prompt (merge / keep cloud / keep local), live sync
     across two tabs, autosave off + manual Save.
   - For report changes: print preview of the Semester Report and Academic Summary (disclaimer present).
   - Include specific pages, forms, or user flows affected.
   ```

8. **Confirm**
   Return the PR URL, PR number, and one-line confirmation: base = `main`, head = `development`.

## Out of scope unless the user asks

Merging the PR, tagging releases, deploying manually, or force-pushing `main` / `development`.

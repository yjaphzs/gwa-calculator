---
name: release-changelog
description: How to cut a GWA Calculator release — bump package.json version and add the matching entry to src/config/changelog.ts (which drives the in-app "What's new" dialog). Use when finishing a user-visible feature or fix, preparing a development → main PR, or when asked to bump the version or update the changelog.
---

# Release & changelog

The app version shown in the header (`v{APP_VERSION}`) comes from `package.json` `version`
(injected by `next.config.ts`). The "What's new" dialog (`src/features/changelog/`) reads
`src/config/changelog.ts` and shows a dot until the user has seen `LATEST_VERSION`.

## Rules

1. **Keep them in sync:** `package.json` `version` === `CHANGELOG[0].version`.
2. **Newest first:** add the new entry at the **top** of `CHANGELOG`.
3. **SemVer:** `MAJOR` breaking/data-model changes, `MINOR` new user-visible features,
   `PATCH` fixes only.
4. Entry shape:
   ```ts
   {
     version: "2.3.0",
     date: "October 28, 2026",          // human-readable, "Month D, YYYY"
     title: "Short headline",            // optional, ≤ ~5 words
     changes: [
       { type: "new", text: "…" },       // "new" | "improved" | "fixed"
       { type: "improved", text: "…" },
       { type: "fixed", text: "…" },
     ],
   }
   ```
5. Write `text` for **users**, not developers: what they can now do or what stopped going
   wrong. One sentence each, no file names, no jargon ("sync", "Firestore" → "your account").
6. Refactors, tests, CI, and docs are not changelog items unless users notice the effect.
7. Don't edit past entries except to fix typos.

## Steps

1. Decide the bump from the changes since the last version (`git log` since the previous
   version bump commit).
2. Update `package.json` `version` (don't touch `package-lock.json` by hand — run
   `npm install --package-lock-only` so its top-level version matches).
3. Prepend the changelog entry.
4. `npm run lint && npm run typecheck && npm test`.
5. Commit as `chore(config): release vX.Y.Z` (or fold into the feature commit), then
   promote with `/github-pr-develop-release`.

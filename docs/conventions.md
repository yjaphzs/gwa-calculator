# Conventions

How code is written and organized in this repo. The short version for agents lives in
`.claude/skills/component-architecture/SKILL.md`; this is the full reference.

## File size and responsibility

- **At most 200 lines of code per source file under `src/`.** Blank lines and comments don't
  count. ESLint enforces this (`max-lines` in `eslint.config.mjs`), so `npm run lint` and CI
  fail above the limit.
- **Exempt:** `src/components/ui/**` (generated shadcn primitives),
  `src/hooks/use-local-storage.ts` (vendored), `src/app/(legal)/**/page.tsx` (legal prose),
  `src/config/school-names.ts` (a data list), and `*.test.ts`.
- **One responsibility per file.** If describing a file needs "and", split it.
- Hitting the limit is a design signal, not a formatting problem. Don't delete useful comments,
  join lines, or add exemptions. Split the file using the recipes below.

### Split recipes

| Smell | Extract to |
|---|---|
| Pure computation, parsing, or formatting inside a component | `features/<f>/lib/*.ts`, plus a `*.test.ts` |
| Related `useState`, `useEffect` and handlers | `features/<f>/hooks/use-*.ts` that returns a small API |
| A JSX block with its own heading, dialog, or menu | A sibling component file |
| The same markup more than once | One component parameterized by props |
| A long prop list (about 8 or more), or props passed straight through | Group them into objects (`actions`, `filters`), or move the state down |
| Dialog open or confirm state that only the dialog uses | Keep it inside the dialog component |

After a split, the parent should read as a composition: hooks at the top, then a short JSX tree.

## Folder placement

```
src/app/                  Routes only: page.tsx and layout.tsx, metadata, guards.
src/features/<feature>/   components/  hooks/  lib/  (content/ for static copy and data)
src/components/ui/        shadcn primitives. Add with `npx shadcn@latest add <name>`.
src/components/layout/    App shell: site header/footer, brand, theme toggle, account menu, content layout
src/components/shared/    Generic reusable UI with no feature knowledge
src/hooks/                Generic hooks only
src/lib/                  Cross-feature pure logic (academic.ts, utils.ts, firebase/)
src/config/               App constants: app name/URL, changelog, schools, routes
src/context/              React context providers (auth)
src/types/                Shared domain types
```

**Import boundaries:**
- Features may import from `components/`, `hooks/`, `lib/`, `config/`, `context/`, `types/`,
  and from another feature's files by path.
- Nothing imports from `src/app/`.
- There are no barrel files, except `src/lib/firebase/firestore/index.ts`, which keeps
  `@/lib/firebase/firestore` stable.

## Code style

- **Exports:** named exports (`export function SemesterCard(…)`). Default exports appear only
  where Next.js requires them (`page.tsx`, `layout.tsx`).
- **Client components:** put `"use client"` at the top of any file that uses state, effects,
  refs, event handlers, or browser APIs. Static content stays a server component.
- **Static export** (`output: "export"`): there are no server actions, route handlers, cookies,
  `headers()`, middleware, or runtime data fetching. Ignore skill or framework advice that
  assumes a server.
- **Naming:** kebab-case file names; hooks are `use-*.ts`; components use PascalCase; props
  interfaces are named `XProps`.
- **Formatting:** 2-space indentation and double quotes. Older files with 4-space indentation
  convert when they're split.
- **Types:**
  - Import domain types from `@/types`; never redeclare `Subject` or `Semester`.
  - `any` is tolerated in form handlers, but prefer real types in new code.
- **Domain math:** GWA and honors go only through `@/lib/academic` (see
  `.claude/skills/gwa-domain-rules`).
- **Comments:** explain *why* (sync edge cases, print quirks, legal constraints), not *what*.
  Keep the existing explanatory comments in the persistence code.
- **Accessibility:** every icon-only button gets an `aria-label`, inputs have labels, and color
  is never the only signal.
- **List keys:** use stable `id`s, never `code` or an index.

## Writing user-facing copy

This covers UI text, toasts, the guide, legal pages, reports, the changelog, and metadata.

- **No em dashes ("—").** Use a period, comma, colon, or parentheses instead. Code comments and
  internal docs are exempt.
- **En dashes ("–") only between numbers** in ranges: 1.00–5.00, 97–100, 2024–25.
- **Empty values are words, not dashes:** "N/A", "None".
- **Sentence case**, active voice, and plain words. A button says exactly what it does.
- **Apostrophes:** in JSX text, prefer a plain `'` over `&apos;`. A text node that follows an
  inline tag and contains an entity can lose its leading space in the static build.

## Tests

- **Vitest**, pure logic only (`npm test`). Test files sit next to their module as `*.test.ts`.
- Add or extend tests whenever you change:
  - GWA or honor rules (`src/lib/academic.ts`)
  - persistence helpers (`features/persistence/lib`)
  - import or QR validation (`features/transfer/lib`)
  - report HTML builders (`features/reports/lib`)
- UI behavior is checked manually. The checklists are in the `calculator-persistence` and
  `printable-reports` skills.

## Before committing

```
npm run lint
npm run typecheck
npm test
cd functions && npx tsc --noEmit    # only if functions/ changed
```

## Git

- **Branches:** `development` is integration (CI only); `main` is production (deploys). Work
  targets `development` and is promoted through a PR (`/github-pr-develop-release`).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/),
  `type(scope): summary`. Scopes are listed in `.claude/commands/github-commit-develop.md`.
- Use `git mv` when moving a file wholesale, so history follows it.
- **Releases:** `package.json` version and the newest `src/config/changelog.ts` entry must
  match (see `.claude/skills/release-changelog`).

---
name: component-architecture
description: Where code goes in the GWA Calculator and how to keep it small. Use whenever creating, moving, splitting, or substantially editing a component, hook, page, or lib module under src/ — including when ESLint reports `max-lines`, when a file is approaching 200 lines, or when deciding between a component, a hook, or a lib function.
---

# Component architecture (GWA Calculator)

Full reference: `docs/conventions.md` and `docs/architecture.md`. This skill is the
checklist to apply while you work.

## The two hard rules

1. **≤ 200 lines of code per file** under `src/` (blank lines and comments don't count).
   Enforced by ESLint `max-lines` — `npm run lint` fails above the limit. Exempt:
   `src/components/ui/**` (shadcn), `src/hooks/use-local-storage.ts` (vendored),
   `src/app/(legal)/**/page.tsx` (prose), `src/config/school-names.ts` (data), `*.test.ts`.
   Never "fix" the limit by deleting useful comments, cramming lines, or adding exemptions —
   split the file.
2. **One responsibility per file.** A component renders one thing; a hook owns one piece of
   state/behavior; a lib module holds one cohesive set of pure functions. If you need "and"
   to describe a file, split it.

## Where files go

```
src/app/                  Routes only: page.tsx / layout.tsx, metadata, guards. Thin — compose
                          feature components; no business logic, no big JSX.
src/features/<feature>/   components/  hooks/  lib/   (+ content/ for static copy/data)
src/components/ui/        shadcn primitives — add via `npx shadcn@latest add <name>`; avoid edits
src/components/layout/    App shell: headers, footers, brand, theme toggle, account menu
src/components/shared/    Generic reusable UI with no feature knowledge (form-dialog, paginator)
src/hooks/                Generic hooks only (event listener, local storage, …)
src/lib/                  Cross-feature pure logic: academic.ts (GWA/honors), utils, firebase/
src/config/ context/ types/
```

Features: `calculator`, `semesters`, `persistence`, `transfer`, `reports`, `leaderboard`,
`account`, `auth`, `changelog`, `guide`. A feature may import from `components/`, `hooks/`,
`lib/`, `config/`, `types/`, and another feature's files by path. Never import from `src/app/`.

## Split recipes (pick the first that applies)

| Smell | Extract to |
|---|---|
| Pure computation / parsing / formatting inside a component | `features/<f>/lib/*.ts` (+ a `*.test.ts`) |
| `useState` + `useEffect` + handlers that belong together | `features/<f>/hooks/use-*.ts` returning a small API |
| A JSX block with its own heading, dialog, or menu | its own component file next to the parent |
| The same markup 2+ times | one component, parameterized by props |
| > ~8 props, or many props passed straight through | group into objects (`actions`, `filters`) or move state down |
| A dialog's open/confirm state only the dialog uses | keep that state inside the dialog component |

After a split the parent should read as a composition: hooks at the top, a short JSX tree.

## Code style for new or split files

- Named exports: `export function SubjectCard(props: SubjectCardProps)`. No default exports
  except Next.js `page.tsx` / `layout.tsx`.
- `"use client"` at the top of any file using state, effects, refs, browser APIs, or event
  handlers. The app is a **static export** — no server actions, route handlers, cookies,
  `headers()`, or middleware. Server components are fine for static content.
- kebab-case file names; hooks named `use-*.ts`; 2-space indent; double quotes.
- Types from `@/types`; don't redeclare `Subject`/`Semester` locally.
- GWA/honor math only through `@/lib/academic` (`computeGwa`, `getHonorFor`, …) — never inline.
- Comment the *why* (sync edge cases, print quirks), not the *what*.
- Accessible by default: `aria-label` on icon-only buttons, labels on inputs. In forms, wrap the
  `SelectTrigger` (not the `Select` root) in `FormControl`, so the label reaches the combobox.
- Copy: no em dashes in user-facing text (see `docs/conventions.md`).
- New forms, menus, or pickers: build on `ResponsiveDialog` / `ResponsiveMenu` (bottom sheets on
  phones) instead of a bare `Dialog` / `DropdownMenu`; confirmations stay `AlertDialog`s. See
  "Overlays and the mobile shell" in `docs/design-system.md`.

## Before you finish

```
npm run lint        # includes max-lines
npm run typecheck
npm test
```
Use `git mv` when moving a file wholesale so history follows it.

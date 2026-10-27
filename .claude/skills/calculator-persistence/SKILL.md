---
name: calculator-persistence
description: Invariants and test checklist for the GWA Calculator's guest/cloud persistence layer (useCalculatorData — localStorage for guests, Firestore live sync for signed-in users, first-sign-in merge prompt, autosave). Use before touching anything in src/features/persistence/, the Firestore calculator-state helpers, the merge dialog, import/QR replaceAll, or any code that calls setSubjects/setSemesters/removeSubjects/persistNow.
---

# Calculator persistence

`useCalculatorData()` (`src/features/persistence/hooks/use-calculator-data.ts`) gives the UI
a `useState`-like API — `subjects/setSubjects`, `semesters/setSemesters`, `autosave/setAutosave`,
`removeSubjects`, `replaceAll`, `persistNow`, `loading`, `isCloud`, `pendingMerge`,
`resolveMerge` — and hides where the data lives. This is the core of cross-device
correctness. **Change behavior only deliberately, and keep the explanatory comments.**

## Where data lives

- **Guest:** `localStorage` keys from `NEXT_PUBLIC_APP_LOCAL_STORAGE_{SUBJECTS,SEMESTERS,AUTOSAVE}_KEY`
  (defaults `gwa_subjects`, `gwa_semesters`, `gwa_autosave`).
- **Signed in:** Firestore `users/{uid}/calculator/state` via `subscribeCalculatorState` /
  `writeCalculatorState` in `src/lib/firebase/firestore/`.
- Pure helpers (merge, equality, reconcile flag) are in
  `src/features/persistence/lib/calculator-state.ts` and unit-tested.

## Invariants — do not break

1. **Both stores are always mounted.** The guest-store and cloud-store hooks are called
   unconditionally (rules of hooks); the facade picks one by `uid`.
2. **Debounced cloud writes (600 ms)** coalesce rapid edits. Explicit actions (`removeSubjects`,
   `replaceAll`, `persistNow`, `resolveMerge`) cancel the pending timer and write immediately.
3. **`removeSubjects` writes the FULL next state**, not `{ subjects: [] }` — "Save semester"
   adds a semester and resets subjects in the same tick; a partial write would lose the semester.
4. **Echo skip:** live snapshots with `metadata.hasPendingWrites` are ignored (latency
   compensation), so an edit between write and server-ack isn't clobbered.
5. **Autosave off:** subjects stay in memory and are **not** persisted until Save; semesters
   still persist. Cloud writes then omit `subjects`. Incoming snapshots keep in-memory subjects.
6. **First sign-in reconciliation** runs once per account per device (`gwa_reconciled_{uid}`):
   - cloud empty + local data → push local up;
   - both have different data → `pendingMerge` → `MergeDialog` (merge / keep cloud / keep local);
     `mergeStates` unions by `id`, local wins, autosave from cloud;
   - otherwise adopt cloud.
7. Subscriptions use refs (`lsRef`, `uidRef`, `autosaveRef`) so the callback doesn't
   re-subscribe on every edit. Don't add state to the subscribe effect's deps.
8. `loading` is true while auth resolves or until the first cloud snapshot — the UI shows
   `CalculatorSkeleton` instead of flashing an empty state.

## Manual test checklist (run after any change here)

- Guest: add/edit/delete subjects, reload → persisted. Autosave off → edits survive in memory,
  reload drops them, Save persists them. Save semester → semester kept, subjects cleared.
- Sign in with guest data on a fresh account → data pushed to cloud, no prompt.
- Sign in with different guest + cloud data → merge prompt; try all three choices (use a new
  account or clear `gwa_reconciled_{uid}` between runs). Prompt never reappears afterwards.
- Two tabs signed in → edits in one appear in the other; fast typing doesn't flicker/revert.
- Save semester while signed in, reload → semester and the cleared subjects both persisted.
- Import JSON / QR transfer → `replaceAll` replaces everything in the active store.
- `npm test` (calculator-state tests) passes.

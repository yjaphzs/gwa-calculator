---
name: functions-and-emails
description: Working in the GWA Calculator's Cloud Functions package (functions/) — callables, the Firestore leaderboard trigger, rate limiting, Resend emails built from Handlebars templates, region/config, and deploy order. Use when adding or changing anything under functions/, editing email templates, or changing a callable the client calls via src/lib/firebase/callable.ts.
---

# Cloud Functions & emails

`functions/` is a **separate npm package** (own `package.json`, `tsconfig.json`,
`node_modules`). Node **24**, region **`asia-southeast1`**, `maxInstances: 5`
(`functions/src/config.ts` → `callableOptions`). Root lint/typecheck **exclude** it.

## Layout

```
functions/src/
  index.ts                       re-exports every function (initializeApp once here)
  config.ts                      REGION, APP_URL, APP_NAME, callableOptions
  callable/account/              deleteAccount — wipes Firestore + Storage + Auth user (Admin SDK)
  callable/auth/                 sendVerificationEmail, sendPasswordResetEmail
  callable/leaderboard/          setLeaderboardParticipation, setLeaderboardHandle,
                                 refreshLeaderboardStanding
  trigger/                       onCalculatorStateWritten — republishes leaderboard entries
  lib/academic.ts                server copy of GWA/honor rules (keep in sync with src/lib/academic.ts)
  lib/leaderboard.ts, term.ts    leaderboard publishing, handles, term keys
  lib/rate-limit.ts              Firestore fixed-window limiter (rateLimits/{bucket}, server-only)
  lib/action-links.ts            rewrites Firebase action links to the in-app /auth/action
  lib/email/                     Resend client, send(), templates.ts, generated-templates.ts
```

## Rules

- Every callable spreads `callableOptions` (region + caps). Validate `request.auth` and input
  first; throw `HttpsError` with user-safe messages (the client maps codes in
  `src/lib/firebase/errors.ts`).
- Abuse-prone callables (anything that sends email) call `enforceRateLimit` per email **and**
  per IP.
- `rateLimits` and leaderboard docs are written only by the Admin SDK — `firestore.rules`
  denies clients. If you add a server-only collection, deny it in the rules too.
- Client wrappers for callables live in `src/lib/firebase/callable.ts`; keep names/payloads in
  sync with the function.
- Changing GWA/honor rules? Update `functions/src/lib/academic.ts` **and** `src/lib/academic.ts`
  (see the `gwa-domain-rules` skill).

## Email templates

Templates are Handlebars files in `functions/src/lib/email/templates/*.hbs`, styled with
Tailwind classes that mailwind inlines. **Edit the `.hbs`, then regenerate:**

```
cd functions && npm run generate:emails
```

This rewrites the committed `generated-templates.ts`. **Never hand-edit
`generated-templates.ts`.** Design language (shared with printable reports): dark `zinc-900`
header with an amber dot + app name, a 4px amber (`#eab308`) stripe, `zinc-50` callout and
footer `© {{year}} {{appName}}. {{appUrl}}`.

## Commands

| Task | Command |
|---|---|
| Typecheck | `cd functions && npx tsc --noEmit` |
| Build | `cd functions && npm run build` |
| Emulators | `firebase emulators:start` (copy `functions/.env.example` → `functions/.env`) |

Env: `RESEND_API_KEY` (secret), `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`, `APP_URL`, `APP_NAME`,
`FUNCTIONS_ENV`. CI writes `functions/.env` from repo Variables/Secrets on deploy.

## Deploy

Only pushes to `main` deploy, in order: **Functions → Hosting → Firestore indexes → Firestore
rules → Storage rules** (`.github/workflows/deploy.yml`). Functions go first so any callable or
trigger the new client needs already exists. Never deploy manually unless asked.

<img width="6336" height="1584" alt="Github_Banner - Repository" src="https://github.com/user-attachments/assets/2262b17d-78d0-40ec-b843-6d3116fd224d" />

# GWA Calculator

A web application for calculating your General Weighted Average (GWA) and determining academic honors. Built with **Next.js** (App Router), **Firebase**, and styled using **shadcn/ui** components.

The calculator is fully usable **without an account** (data is kept in your browser). Sign in to **save your progress and sync it across devices**.

![Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Made%20with-Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Made%20with-TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/Made%20with-shadcn/ui-111827?style=flat)

**Live Demo:**  
[https://gwa-calculator.yjaphzs.xyz](https://gwa-calculator.yjaphzs.xyz)

## Features

- Add, edit, and delete subjects with grades and units
- Automatic GWA calculation + academic honor detection (University/College Scholar, Dean's Lister)
- Add, edit, and delete semesters; pagination and search
- Import/export and QR transfer of your data
- Print or save as PDF a **Semester Report** (one semester) or **Academic
  Summary** (all semesters) — a personal-reference copy of your grades, *not* an
  official academic record
- Responsive design with dark mode support
- **Guest mode** — autosave to local storage, no account required
- **Optional accounts** — email/password + Google sign-in, password reset, email verification,
  profile photo, and live cross-device sync via Firestore

## Tech stack

- **Next.js** App Router, exported as a static site (`output: 'export'`)
- **Firebase**: Hosting, Authentication, Firestore, Storage, and Cloud Functions
  (`deleteAccount`, `sendVerificationEmail`, `sendPasswordResetEmail`)
- **Tailwind CSS v4** + **shadcn/ui**

## Getting Started

1. **Clone and install:**
   ```bash
   git clone https://github.com/yjaphzs/gwa-calculator.git
   cd gwa-calculator
   npm install
   ```

2. **Create a Firebase project** and a Web App in the [Firebase Console](https://console.firebase.google.com/), then enable:
   - **Authentication** → Sign-in methods: **Email/Password** and **Google**
   - **Firestore Database**
   - **Storage**
   - (optional) **App Check** with reCAPTCHA v3

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   # fill in the NEXT_PUBLIC_FIREBASE_* values from your Web App config
   ```

4. **Configure the email sender (Cloud Functions + Resend).** Auth emails
   (verification + password reset) are sent as branded HTML by Cloud Functions
   via [Resend](https://resend.com/docs/send-with-nodejs) — the functions
   generate the action link and rewrite it to the in-app `/auth/action` handler,
   so you don't need to customize the Firebase console action URL. Setup:
   add your domain in Resend, add the DKIM/SPF records it shows you in Namecheap,
   then create an API key. For local emulator testing:
   ```bash
   cp functions/.env.example functions/.env
   # fill in RESEND_API_KEY, EMAIL_FROM_EMAIL (e.g. no-reply@yjaphzs.xyz), APP_URL
   ```
   The email HTML is built from the `.hbs` sources in
   `functions/src/lib/email/templates/` via `npm run generate:emails` (mailwind
   inlines the styles into the committed `generated-templates.ts`).

5. **Run the dev server:**
   ```bash
   npm run dev
   ```

6. **Build the static export (production):**
   ```bash
   npm run build   # outputs ./out
   ```

## Local Firebase emulators (optional)

```bash
npm install -g firebase-tools
firebase emulators:start   # Auth, Firestore, Storage, Functions, Hosting
```

## Deployment

Pushing to **`main`** triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
lint + typechecks, builds the static export, and deploys **Functions → Hosting → Firestore rules →
Storage rules** to the single Firebase project. Pushes to `development` run lint + typecheck only.

Required GitHub repository configuration:

- **Variables** (`Settings → Secrets and variables → Actions → Variables`): every `NEXT_PUBLIC_*`
  value (app + Firebase). `NEXT_PUBLIC_FIREBASE_PROJECT_ID` also selects the deploy target.
  For email: `EMAIL_FROM_NAME`, `EMAIL_FROM_EMAIL`.
- **Secrets** (`… → Secrets`): `GOOGLE_APPLICATION_CREDENTIALS_BASE64` (a base64-encoded Firebase
  service-account JSON key with deploy permissions), plus `RESEND_API_KEY` for the email sender.
  The workflow writes these into `functions/.env` at deploy time.

Set the custom domain (`gwa-calculator.yjaphzs.xyz`) under Firebase Hosting → Custom domains.

## References

- **Ko-fi Button:**  
  [CostasAK/react-kofi-button](https://github.com/CostasAK/react-kofi-button)

- **Copy Button, Fireworks Background, & Hooks:**  
  [shadcn/ui](https://www.shadcn.io/)

- **Theme Switcher:**  
  [shadcnuikit](https://shadcnuikit.com/)

## Screenshots

<img width="1920" height="1045" alt="screencapture-yjaphzs-github-io-gwa-calculator-2025-11-26-01_03_34" src="https://github.com/user-attachments/assets/103e8ae1-a783-4f04-a8a7-e1bf067efc02" />
<img width="1920" height="1045" alt="screencapture-yjaphzs-github-io-gwa-calculator-2025-11-26-01_03_48" src="https://github.com/user-attachments/assets/23152f10-5d1c-45b9-8d9f-ac2c19772d47" />
<img width="1920" height="1273" alt="screencapture-yjaphzs-github-io-gwa-calculator-2025-11-25-22_25_45" src="https://github.com/user-attachments/assets/9bc70fe3-3840-4409-b4ca-6544adc660b6" />

## MIT License

Made with ❤️ using Next.js and shadcn/ui.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GWA Calculator handles your data — what we collect, how it's used, and your choices.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated: June 20, 2026</strong>
      </p>

      <p>
        This Privacy Policy explains how <strong>GWA Calculator</strong>&nbsp;(the
        &ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) handles
        information when you use it at{" "}
        <a href="https://gwa-calculator.yjaphzs.xyz">
          gwa-calculator.yjaphzs.xyz
        </a>
        . We&apos;ve tried to keep it short and honest: the Service is a free
        tool for computing your General Weighted Average, and we collect as
        little as possible.
      </p>

      <h2>1. Using the Service without an account</h2>
      <p>
        You can use the entire calculator <strong>without signing in</strong>.
        In this guest mode, your subjects, semesters, and settings are stored
        only in your browser&apos;s <strong>local storage</strong> on your
        device. This data never leaves your device, and we cannot see it.
        Clearing your browser data removes it.
      </p>

      <h2>2. Information we collect</h2>
      <p>
        We only collect personal information if you choose to{" "}
        <strong>create an account</strong> to save and sync your data across
        devices. In that case we process:
      </p>
      <ul>
        <li>
          <strong>Account details</strong> — your email address, an optional
          display name, and an optional profile photo you upload.
        </li>
        <li>
          <strong>Authentication data</strong> — managed by Firebase
          Authentication. If you sign in with Google, we receive your basic
          Google profile (name, email, and photo) to create your account. We
          never receive or store your password in readable form.
        </li>
        <li>
          <strong>Your calculator data</strong> — the subjects, grades, units,
          and semesters you save, so they can sync across your devices.
        </li>
        <li>
          <strong>Technical metadata</strong> — standard sign-in metadata such
          as account creation and last sign-in time, retained by Firebase
          Authentication.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> collect your school records, student number,
        or any official academic data — only the figures you type in yourself.
      </p>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To create and maintain your account.</li>
        <li>To save your calculator data and sync it across your devices.</li>
        <li>To display your profile (name and photo) within the app.</li>
        <li>
          To show your entry on the leaderboard — <strong>only if you opt
          in</strong> (see section 10).
        </li>
        <li>
          To send essential account emails (verification and password reset).
        </li>
        <li>To keep the Service secure and prevent abuse.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your data, show third-party
        advertising, or use your data for profiling.
      </p>

      <h2>4. Where your data is stored</h2>
      <p>
        Accounts and saved data are stored using{" "}
        <strong>Google Firebase</strong> (Authentication, Cloud Firestore, and
        Cloud Storage) on Google Cloud infrastructure. Google processes this
        data on our behalf as a service provider. See{" "}
        <a
          href="https://firebase.google.com/support/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Firebase&apos;s privacy practices
        </a>{" "}
        for details.
      </p>

      <h2>5. Cookies and local storage</h2>
      <p>
        We don&apos;t use tracking or advertising cookies. We use your
        browser&apos;s local storage to keep guest data and remember your theme
        preference, and Firebase Authentication uses local storage to keep you
        signed in. These are strictly functional.
      </p>

      <h2>6. Data retention and deletion</h2>
      <p>
        We keep your account data for as long as your account exists. You can
        delete your account at any time from the{" "}
        <strong>Account → Security</strong> page. Deleting your account{" "}
        <strong>permanently removes</strong> your profile, your saved
        subjects and semesters, your profile photo, and your authentication
        record. Guest data is removed by clearing your browser storage.
      </p>

      <h2>7. Security</h2>
      <p>
        Access to your saved data is restricted to your own account by
        server-side security rules, and data is transmitted over encrypted
        (HTTPS) connections. No method of transmission or storage is perfectly
        secure, but we take reasonable measures to protect your information.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>
        The Service is intended for college and university students. If you are
        below the age of digital consent in your jurisdiction, please use the
        Service only with the involvement of a parent or guardian. We do not
        knowingly collect data from children where prohibited by law; contact
        us if you believe a child has provided us personal information and we
        will delete it.
      </p>

      <h2>9. Your rights</h2>
      <p>You can, at any time:</p>
      <ul>
        <li>Access and edit your profile and saved data within the app.</li>
        <li>Export your data using the in-app Export feature.</li>
        <li>
          Generate a printable summary of your grades — a Semester Report (one
          semester) or an Academic Summary (all semesters) — for your own
          personal reference.
        </li>
        <li>Delete your account and all associated data.</li>
      </ul>
      <p>
        Any file you export, and any printable grade summary you generate (a
        Semester Report or Academic Summary), are created{" "}
        <strong>on your device</strong>, from data already on your device, at
        the moment you ask for them. The resulting file or printout is{" "}
        <strong>not uploaded to or stored by us</strong> — what you do with it,
        including saving, printing, or sharing it, is entirely up to you. These
        summaries are for personal reference only and are not official academic
        records; see our <a href="/terms-and-conditions">Terms and Conditions</a>.
      </p>
      <p>
        Depending on where you live, you may have additional rights under laws
        such as the Philippine Data Privacy Act or the GDPR. To exercise them,
        contact us using the details below.
      </p>

      <h2>10. Leaderboards (optional)</h2>
      <p>
        The leaderboard is <strong>strictly opt-in</strong>. By default, none of
        your data is shown to anyone else. If you choose to join from the{" "}
        <strong>Account</strong> page, we publish limited entries — visible only
        to other signed-in users — containing your school (and optional program),
        your overall and per-semester GWAs and honor standings, and{" "}
        <em>either</em> your display name and photo <em>or</em>, if you choose to
        stay anonymous, a randomly
        generated handle (for example <em>anonymous2421</em>) with no name or
        photo. We never expose your email address or account identifier on the
        leaderboard. Participation requires a <strong>verified email</strong>.
        You can switch between anonymous and named, refresh your standing, or
        leave the leaderboard at any time from the Account page — leaving removes
        your public entries. Deleting your account also removes them. The first time
        you open the leaderboard, we show a brief note explaining these choices so
        your consent is informed before you decide to take part.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes
        will be reflected by updating the &ldquo;Last updated&rdquo; date above.
        Continued use of the Service after changes means you accept the updated
        policy.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about this policy or your data? Email{" "}
        <a href="mailto:jan@yjaphzs.xyz">jan@yjaphzs.xyz</a>.
      </p>
    </>
  );
}

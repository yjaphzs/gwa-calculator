import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms that govern your use of GWA Calculator, including accounts, acceptable use, and disclaimers.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms and Conditions</h1>
      <p>
        <strong>Last updated: June 19, 2026</strong>
      </p>

      <p>
        These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of{" "}
        <strong>GWA Calculator</strong> (the &ldquo;Service&rdquo;) at{" "}
        <a href="https://gwa-calculator.yjaphzs.xyz">
          gwa-calculator.yjaphzs.xyz
        </a>
        . By using the Service — or by creating an account — you agree to these
        Terms. If you do not agree, please don&apos;t use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        GWA Calculator is a free tool that helps you compute your General
        Weighted Average and see an indicative academic-honor classification
        based on the grades and units you enter. It can be used without an
        account; creating one simply lets you save your data and sync it across
        devices.
      </p>

      <h2>2. Not official academic advice</h2>
      <p>
        Results are <strong>estimates for your personal reference only</strong>.
        The GWA and any honor indication are calculated from the data you input
        and a general grading scale; they are <strong>not</strong>&nbsp;official, and
        may differ from your school&apos;s computation, rounding rules, or
        eligibility requirements. Always verify your standing with your
        institution&apos;s registrar. We are not responsible for any decision
        made in reliance on the Service&apos;s output.
      </p>

      <h2>3. Accounts</h2>
      <p>
        To create an account you must provide a valid email address (or sign in
        with Google). You are responsible for keeping your credentials secure
        and for all activity under your account. Provide accurate information
        and notify us of any unauthorized use. You must be old enough to form a
        binding agreement in your jurisdiction, or have a parent or
        guardian&apos;s consent.
      </p>

      <h2>4. Your data and content</h2>
      <p>
        You retain ownership of the data you enter (subjects, grades, semesters,
        profile details). By using the Service with an account, you grant us
        permission to store, process, and sync that data solely to operate the
        Service for you, as described in our{" "}
        <a href="/privacy-policy">Privacy Policy</a>. You are responsible for the
        accuracy of the data you enter.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose.</li>
        <li>
          Attempt to gain unauthorized access to the Service, other
          users&apos; data, or our underlying infrastructure.
        </li>
        <li>
          Interfere with or disrupt the Service, including probing, scraping, or
          overloading it.
        </li>
        <li>
          Upload malicious content, or images that are unlawful, infringing, or
          inappropriate, as your profile photo.
        </li>
        <li>
          Reverse engineer or misuse the Service in ways that harm us or other
          users.
        </li>
      </ul>

      <h2>6. Availability and changes</h2>
      <p>
        The Service is provided free of charge on an &ldquo;as is&rdquo; and
        &ldquo;as available&rdquo; basis. We may modify, suspend, or discontinue
        any part of it at any time, and we don&apos;t guarantee uninterrupted or
        error-free operation. We may also update features, including how data is
        stored or synced.
      </p>

      <h2>7. Disclaimers and limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the Service is provided without
        warranties of any kind, whether express or implied, including fitness
        for a particular purpose and accuracy of results. To the maximum extent
        permitted by law, we will not be liable for any indirect, incidental, or
        consequential damages, or for any loss of data, arising from your use of
        — or inability to use — the Service.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time from
        the <strong>Account → Security</strong> page. We may suspend or
        terminate access if you violate these Terms or misuse the Service.
      </p>

      <h2>9. Changes to these Terms</h2>
      <p>
        We may revise these Terms from time to time. Material changes will be
        reflected by updating the &ldquo;Last updated&rdquo; date above.
        Continued use of the Service after changes means you accept the revised
        Terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Republic of the Philippines,
        without regard to its conflict-of-law rules. Any disputes will be
        subject to the exclusive jurisdiction of the competent courts located in
        the Philippines.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:yjaphzs@gmail.com">yjaphzs@gmail.com</a>.
      </p>
    </>
  );
}

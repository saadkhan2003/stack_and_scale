import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";
import { metadataForPath } from "../../src/seo";

export const metadata = metadataForPath(
  "/privacy",
  "Privacy Policy",
  "How Stack & Scale collects, uses, and protects your personal information.",
);

export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/privacy" />
      <article className="legal-page">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: 28 August 2026</em>
        </p>

        <h2>1. Who we are</h2>
        <p>
          Stack &amp; Scale (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) builds
          operational software for businesses. This privacy policy explains how we
          handle personal information when you visit our website, use our contact
          form, or engage our services.
        </p>
        <p>
          Data controller: Stack &amp; Scale.
          <br />
          Email:{" "}
          <a href="mailto:hello@stackandscale.com">hello@stackandscale.com</a>
        </p>

        <h2>2. Information we collect</h2>
        <p>
          <strong>Information you provide directly</strong> — when you submit a
          contact form, request a demo, or email us, we collect the details you
          send: your name, email address, phone number (if provided), and the
          content of your message.
        </p>
        <p>
          <strong>Server logs</strong> — our hosting infrastructure automatically
          records the IP address, browser type, pages visited, and timestamps of
          requests. These logs are used for security, debugging, and operational
          monitoring.
        </p>
        <p>
          <strong>Analytics</strong> — if you consent to analytics, we may collect
          anonymised page-view and interaction data. Analytics are off by default
          and only activated with your explicit consent.
        </p>

        <h2>3. How we use your information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>Respond to your enquiry or demo request.</li>
          <li>Manage our working relationship, including project communication.</li>
          <li>Operate and secure our website and infrastructure.</li>
          <li>Comply with legal obligations.</li>
        </ul>
        <p>
          We do not sell personal information to third parties. We do not use your
          data for profiling or automated decision-making.
        </p>

        <h2>4. Legal basis for processing</h2>
        <p>
          We process personal information under the following legal bases:
        </p>
        <ul>
          <li>
            <strong>Consent</strong> — when you submit a form or opt in to analytics.
          </li>
          <li>
            <strong>Contract</strong> — when processing is necessary to fulfil a
            contract with you or take steps at your request before entering into a
            contract.
          </li>
          <li>
            <strong>Legitimate interest</strong> — for security monitoring, fraud
            prevention, and improving our services, where these interests are not
            overridden by your rights.
          </li>
        </ul>

        <h2>5. Data sharing</h2>
        <p>We share personal information only with service providers who assist
          in operating our platform:</p>
        <ul>
          <li>
            <strong>Hosting</strong> — OVHcloud (server infrastructure).
          </li>
          <li>
            <strong>CDN and DNS</strong> — Cloudflare (content delivery and
            DDoS protection).
          </li>
          <li>
            <strong>Email delivery</strong> — Resend (transactional email).
          </li>
          <li>
            <strong>Identity</strong> — Keycloak (authentication, staff access
            only).
          </li>
        </ul>
        <p>
          Each provider is bound by their own data processing agreements. We
          ensure they provide adequate safeguards for your information.
        </p>

        <h2>6. Data retention</h2>
        <ul>
          <li>
            <strong>Contact and demo requests</strong> — retained for 2 years
            after the last communication, then deleted.
          </li>
          <li>
            <strong>Server logs</strong> — retained for 90 days.
          </li>
          <li>
            <strong>Analytics data</strong> — retained for 12 months in
            anonymised form.
          </li>
          <li>
            <strong>CRM records</strong> — retained for the duration of the
            business relationship plus 2 years.
          </li>
        </ul>

        <h2>7. Your rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Correct inaccurate or incomplete information.</li>
          <li>Request deletion of your personal information.</li>
          <li>Restrict or object to certain processing activities.</li>
          <li>Request portability of your data in a machine-readable format.</li>
          <li>Withdraw consent at any time (without affecting prior lawful processing).</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href="mailto:hello@stackandscale.com">hello@stackandscale.com</a>.
          We will respond within 30 days.
        </p>

        <h2>8. International transfers</h2>
        <p>
          Our servers are hosted in the United Kingdom. If you access our website
          from outside the UK, your information may be transferred to and stored
          in the UK. We ensure appropriate safeguards are in place for any such
          transfer.
        </p>

        <h2>9. Security</h2>
        <p>
          We implement industry-standard measures to protect your information,
          including encryption in transit (TLS), access controls, and regular
          security monitoring. No system is completely secure, but we work to
          protect your data against unauthorised access, loss, or misuse.
        </p>

        <h2>10. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The latest version will
          always be available at{" "}
          <a href="/privacy">stackandscale.org/privacy</a>. Continued use of our
          website after changes are posted constitutes acceptance of the updated
          policy.
        </p>

        <h2>11. Contact us</h2>
        <p>
          For questions about this privacy policy or how we handle your data,
          email{" "}
          <a href="mailto:hello@stackandscale.com">hello@stackandscale.com</a>.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}

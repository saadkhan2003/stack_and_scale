import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";
import { metadataForPath } from "../../src/seo";

export const metadata = metadataForPath(
  "/terms",
  "Terms of Service",
  "Terms governing the use of the Stack & Scale website and services.",
);

export default function TermsPage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/terms" />
      <article className="legal-page">
        <p className="eyebrow">Terms</p>
        <h1>Terms of Service</h1>
        <p>
          <em>Last updated: 28 August 2026</em>
        </p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By accessing or using the Stack &amp; Scale website
          (stackandscale.org) and our services, you agree to these terms. If you
          do not agree, please do not use our website or services.
        </p>

        <h2>2. About our services</h2>
        <p>
          Stack &amp; Scale provides custom software development, operational
          systems consulting, and related technology services. The specific
          scope, deliverables, and pricing of any engagement are agreed in a
          separate written agreement between you and Stack &amp; Scale.
        </p>

        <h2>3. Website use</h2>
        <p>
          You may use our website for lawful purposes only. You agree not to:
        </p>
        <ul>
          <li>
            Use the website in any way that violates applicable law or
            regulation.
          </li>
          <li>
            Attempt to gain unauthorised access to any part of the website or
            its systems.
          </li>
          <li>
            Interfere with or disrupt the website, servers, or networks
            connected to it.
          </li>
          <li>
            Submit false, misleading, or fraudulent information through contact
            or demo request forms.
          </li>
        </ul>

        <h2>4. Intellectual property</h2>
        <p>
          The website and its original content, design, and code are owned by
          Stack &amp; Scale and protected by copyright and other intellectual
          property laws. You may not reproduce, distribute, or create derivative
          works from any content on this website without our prior written
          consent.
        </p>
        <p>
          Any custom software, systems, or deliverables produced under a
          separate engagement are governed by the terms of that
          engagement&apos;s written agreement.
        </p>

        <h2>5. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Stack &amp; Scale shall not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages arising from or related to your use of the website or
          services.
        </p>
        <p>
          Our total liability for any claim arising from the website shall not
          exceed the amount you paid us (if any) in the 12 months preceding the
          claim.
        </p>

        <h2>6. Third-party links</h2>
        <p>
          Our website may contain links to third-party websites. We are not
          responsible for the content, privacy practices, or accuracy of
          external sites. Use of third-party websites is at your own risk.
        </p>

        <h2>7. Service availability</h2>
        <p>
          We aim to keep our website available at all times, but we do not
          guarantee uninterrupted access. We may suspend or restrict access for
          maintenance, security, or operational reasons without notice.
        </p>

        <h2>8. Termination</h2>
        <p>
          We reserve the right to restrict or terminate your access to the
          website at our discretion, without notice, for any conduct that we
          believe violates these terms or is harmful to us, other users, or
          third parties.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of England and Wales. Any dispute
          arising from these terms shall be subject to the exclusive
          jurisdiction of the courts of England and Wales.
        </p>

        <h2>10. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. The latest version will
          always be available at <a href="/terms">stackandscale.org/terms</a>.
          Continued use of the website after changes are posted constitutes
          acceptance of the updated terms.
        </p>

        <h2>11. Contact us</h2>
        <p>
          For questions about these terms, use our{" "}
          <a href="/contact">contact form</a>.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}

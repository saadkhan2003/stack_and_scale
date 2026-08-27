import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";
import { metadataForPath } from "../../src/seo";

export const metadata = metadataForPath(
  "/cookies",
  "Cookie Policy",
  "How Stack & Scale uses cookies on its website.",
);

export default function CookiesPage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/cookies" />
      <article className="legal-page">
        <p className="eyebrow">Cookies</p>
        <h1>Cookie Policy</h1>
        <p>
          <em>Last updated: 28 August 2026</em>
        </p>

        <h2>What are cookies</h2>
        <p>
          Cookies are small text files placed on your device when you visit a
          website. They help the site function correctly and can remember your
          preferences.
        </p>

        <h2>Cookies we use</h2>

        <h3>Essential cookies</h3>
        <p>
          These cookies are necessary for the website to function. They cannot be
          switched off.
        </p>
        <ul>
          <li>
            <strong>Session management</strong> — maintains your session state
            when you are signed in as a staff member. These cookies are set by
            our authentication system and are only present for authenticated
            users.
          </li>
          <li>
            <strong>Preview mode</strong> — if you are an authorised editor
            using CMS preview mode, a cookie is set to enable the preview
            functionality. This cookie is not set for public visitors.
          </li>
        </ul>

        <h3>Analytics cookies</h3>
        <p>
          Analytics cookies are <strong>off by default</strong>. They are only
          set if you explicitly consent to analytics tracking. If enabled, they
          help us understand how visitors use our website so we can improve it.
        </p>

        <h3>Third-party cookies</h3>
        <p>
          We do not use third-party advertising or social media cookies. Our CDN
          provider (Cloudflare) may set essential security cookies to protect
          against malicious traffic; these are strictly necessary and cannot be
          disabled.
        </p>

        <h2>Managing cookies</h2>
        <p>
          You can control and delete cookies through your browser settings. Most
          browsers allow you to block or remove cookies. Blocking essential
          cookies may prevent the website from functioning correctly, including
          staff sign-in and CMS preview.
        </p>
        <p>
          For guidance on managing cookies in your browser, visit{" "}
          <a
            href="https://www.allaboutcookies.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            allaboutcookies.org
          </a>
          .
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this cookie policy from time to time. The latest version
          will always be available at{" "}
          <a href="/cookies">stackandscale.org/cookies</a>.
        </p>

        <h2>Contact us</h2>
        <p>
          For questions about our use of cookies, email{" "}
          <a href="mailto:hello@stackandscale.com">hello@stackandscale.com</a>.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}

import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";
export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <article className="legal-page">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy, in plain language.</h1>
        <p>
          We only use details you choose to send us to reply to your request and
          manage our working relationship. This demonstration site does not
          include a public contact form or analytics implementation.
        </p>
        <p>
          For any privacy question, email{" "}
          <a href="mailto:hello@stackandscale.com">hello@stackandscale.com</a>.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}

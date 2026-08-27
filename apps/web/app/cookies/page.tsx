import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";
export default function CookiesPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <article className="legal-page">
        <p className="eyebrow">Cookies</p>
        <h1>Cookie notice.</h1>
        <p>
          This public demonstration does not set non-essential analytics or
          advertising cookies. Essential platform cookies may be used if preview
          mode is enabled by an authorised editor.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}

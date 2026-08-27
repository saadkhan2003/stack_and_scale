import { SiteFooter } from "../src/site-footer";
import { SiteHeader } from "../src/site-header";

export default function NotFound() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="status-page">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p>It may have moved, or it may not be published yet.</p>
        <a className="button button-primary" href="/">
          Return home <span aria-hidden="true">→</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}

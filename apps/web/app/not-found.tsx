import { SiteFooter } from "../src/site-footer";
import { SiteHeader } from "../src/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="status-page">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p>It may have moved, or it may not be published yet.</p>
        <Button render={<a href="/" />}>
          Return home <span aria-hidden="true">→</span>
        </Button>
      </section>
      <SiteFooter />
    </main>
  );
}

import { SiteHeader } from "../../src/site-header";
import { SiteFooter } from "../../src/site-footer";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/maintenance" />
      <div className="status-page">
        <p className="eyebrow">Planned maintenance</p>
        <h1>We&apos;ll be back shortly.</h1>
        <p>
          We are upgrading our systems for enhanced performance and security.
          For urgent inquiries, please reach out to us.
        </p>
        <Button render={<a href="/" />}>
          Return to home <span aria-hidden="true">→</span>
        </Button>
      </div>
      <SiteFooter />
    </main>
  );
}

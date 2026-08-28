import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";
import { metadataForPath } from "../../src/seo";
import { LeadForm } from "../../src/lead-form";
export const metadata = metadataForPath(
  "/contact",
  "Contact",
  "Start a conversation about a more useful operational system.",
);
export default function ContactPage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/contact" />
      <section className="page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Let&apos;s make the next system useful from day one.</h1>
        <p>
          Tell us what needs to work better. We will begin with the context, not
          a pitch deck.
        </p>
      </section>
      <section className="contact-options">
        <LeadForm />
        <p>
          Use the form to tell us what you need. We will reply using the email
          address you provide.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}

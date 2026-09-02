import type { Metadata } from "next";

import { designSystemCatalog } from "../../src/design-system-catalog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Design system | Stack & Scale",
  robots: { index: false },
};

export default function DesignSystemPage() {
  return (
    <main className="design-system-page">
      <p className="eyebrow">Local review surface</p>
      <h1>{designSystemCatalog.title}</h1>
      <p className="design-system-intro">
        A working reference for the approved tokens, controls and focus
        treatment. It is deliberately excluded from search indexing.
      </p>
      <section aria-labelledby="component-preview-heading">
        <h2 id="component-preview-heading">Component preview</h2>
        <div className="design-system-grid">
          <article className="design-system-card">
            <h3>{designSystemCatalog.components[0]}</h3>
            <Button render={<a href="/#contact" />}>
              Book a demo
            </Button>
          </article>
          <article className="design-system-card">
            <h3>{designSystemCatalog.components[1]}</h3>
            <Button render={<a href="/solutions" />} variant="secondary">
              Explore solutions
            </Button>
          </article>
          <article className="design-system-card design-system-card--dark">
            <h3>{designSystemCatalog.components[2]}</h3>
            <p>
              Dark operational surfaces keep supporting detail calm and clear.
            </p>
          </article>
          <article className="design-system-card">
            <h3>{designSystemCatalog.components[3]}</h3>
            <a className="text-link" href="/approach">
              Tab to this link to review the visible focus ring.
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}

import { approachPageModel } from "../../src/approach-content";
import { SiteHeader } from "../../src/site-header";
import { SiteFooter } from "../../src/site-footer";
import { Button } from "@/components/ui/button";

export default function ApproachPage() {
  return (
    <main className="approach-page">
      <SiteHeader currentPath="/approach" />

      <section className="approach-hero">
        <h1>{approachPageModel.heading}</h1>
        <p>{approachPageModel.description}</p>
        <Button render={<a href="/#contact" />}>
          {approachPageModel.action} <span aria-hidden="true">→</span>
        </Button>
      </section>

      <div className="approach-steps">
        {approachPageModel.steps.map((step) => (
          <article className="approach-step" key={step.number}>
            <span>{step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </article>
        ))}
      </div>

      <section className="approach-close">
        <h2>Ready to build something dependable?</h2>
        <Button render={<a href="/contact" />}>
          Start a conversation <span aria-hidden="true">→</span>
        </Button>
      </section>

      <SiteFooter />
    </main>
  );
}

import { solutionsPageModel } from "../../src/solutions-content";
import { SiteHeader } from "../../src/site-header";
import { SiteFooter } from "../../src/site-footer";
import { Button } from "@/components/ui/button";

export default function SolutionsPage() {
  return (
    <main className="site-shell solutions-page">
      <SiteHeader currentPath="/solutions" />

      <section className="solutions-hero" aria-labelledby="solutions-heading">
        <p className="eyebrow">Solutions</p>
        <h1 id="solutions-heading">{solutionsPageModel.heading}</h1>
        <p>{solutionsPageModel.description}</p>
      </section>

      <section
        className="solutions-list"
        aria-label="Stack and Scale solutions"
      >
        {solutionsPageModel.solutions.map((solution) => (
          <article className="solution-row" key={solution.number}>
            <span>{solution.number}</span>
            <div>
              <p className="eyebrow">{solution.type}</p>
              <h2>{solution.title}</h2>
            </div>
            <div className="solution-summary">
              <p>{solution.description}</p>
              <a className="text-link" href={solution.href}>
                {solution.action} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="solutions-cta">
        <p className="eyebrow">Not sure where to begin?</p>
        <h2>We can help you find the most useful next step.</h2>
        <Button render={<a href="/#contact" />}>
          Discuss your needs <span aria-hidden="true">→</span>
        </Button>
      </section>
      <SiteFooter />
    </main>
  );
}

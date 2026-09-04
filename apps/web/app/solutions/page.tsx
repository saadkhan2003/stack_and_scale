import { solutionsPageModel } from "../../src/solutions-content";
import { SiteHeader } from "../../src/site-header";
import { SiteFooter } from "../../src/site-footer";
import { Button } from "@/components/ui/button";

export default function SolutionsPage() {
  return (
    <main className="solutions-page">
      <SiteHeader currentPath="/solutions" />

      <section className="solutions-hero">
        <h1>{solutionsPageModel.heading}</h1>
        <p>{solutionsPageModel.description}</p>
        <div className="solutions-hero-actions">
          <Button render={<a href="/#contact" />}>
            {solutionsPageModel.productAction} <span aria-hidden="true">→</span>
          </Button>
          <Button render={<a href="/#contact" />} variant="secondary">
            {solutionsPageModel.serviceAction}
          </Button>
        </div>
      </section>

      <div className="solutions-list">
        {solutionsPageModel.solutions.map((solution) => (
          <article className="solution-row" key={solution.number}>
            <span>{solution.number}</span>
            <div>
              <span className="solution-type">{solution.type}</span>
              <h2>{solution.title}</h2>
              <p>{solution.description}</p>
            </div>
            <Button
              render={<a href={solution.href} />}
              variant="secondary"
              size="sm"
            >
              {solution.action} <span aria-hidden="true">→</span>
            </Button>
          </article>
        ))}
      </div>

      <SiteFooter />
    </main>
  );
}

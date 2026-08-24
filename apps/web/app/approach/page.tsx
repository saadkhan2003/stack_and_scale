import { approachPageModel } from "../../src/approach-content";

export default function ApproachPage() {
  return (
    <main className="site-shell approach-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Stack & Scale home">
          <img
            src="/brand/stack-and-scale-logo.jpeg"
            alt="Stack & Scale Technologies"
          />
        </a>
        <nav aria-label="Main navigation">
          <a href="/solutions">Solutions</a>
          <a href="/approach" aria-current="page">
            Approach
          </a>
          <a href="/#contact">Contact</a>
        </nav>
        <a className="header-cta" href="/#contact">
          Book a demo <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="approach-hero" aria-labelledby="approach-heading">
        <p className="eyebrow">How we work</p>
        <h1 id="approach-heading">{approachPageModel.heading}</h1>
        <p>{approachPageModel.description}</p>
      </section>

      <section className="approach-steps" aria-label="Delivery process">
        {approachPageModel.steps.map((step) => (
          <article className="approach-step" key={step.number}>
            <span>{step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </article>
        ))}
      </section>

      <section className="approach-close">
        <p className="eyebrow">Ready when you are</p>
        <h2>Start with the problem worth solving.</h2>
        <a className="button button-primary" href="/#contact">
          {approachPageModel.action} <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}

import { homepageModel } from "../src/homepage-content";
import { metadataForPath } from "../src/seo";
import { SiteFooter } from "../src/site-footer";
import { SiteHeader } from "../src/site-header";
import { Button } from "@/components/ui/button";

export const metadata = metadataForPath(
  "/",
  "Software for real operations",
  "Purposeful products, services and delivery partnership for clearer operations.",
);

export default function HomePage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/" />

      <section className="hero" id="top" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow">{homepageModel.eyebrow}</p>
          <h1 id="hero-heading">{homepageModel.heading}</h1>
          <p className="hero-description">{homepageModel.description}</p>
          <div className="hero-actions">
            <Button render={<a href="#contact" />}>
              {homepageModel.primaryAction} <span aria-hidden="true">→</span>
            </Button>
            <Button render={<a href="#contact" />} variant="secondary">
              {homepageModel.secondaryAction}
            </Button>
          </div>
          <p className="trust-line">
            Built for local businesses today. Ready to scale with you tomorrow.
          </p>
        </div>

        <div
          className="ecosystem"
          aria-label="Connected software ecosystem illustration"
        >
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="connection connection-one" />
          <div className="connection connection-two" />
          <article className="product-card pos-card">
            <span className="card-label">Retail POS</span>
            <strong>Today&apos;s sales</strong>
            <b>Rs. 184,200</b>
            <div className="chart" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </article>
          <article className="product-card analytics-card">
            <span className="card-label">Analytics</span>
            <strong>Operating clearly</strong>
            <div className="metric-row">
              <span>
                98.7%<small>on track</small>
              </span>
              <span>
                24<small>actions</small>
              </span>
            </div>
          </article>
          <article className="product-card automation-card">
            <span className="status-dot" aria-hidden="true" />
            <span className="card-label">Automation</span>
            <strong>Follow-up ready</strong>
            <p>New lead routed to sales</p>
          </article>
          <div className="ecosystem-core">
            <span>Stack &amp; Scale</span>
            <strong>Connected operations</strong>
          </div>
        </div>
      </section>

      <section
        className="capabilities"
        id="solutions"
        aria-labelledby="solutions-heading"
      >
        <div className="section-intro">
          <p className="eyebrow">What we build</p>
          <h2 id="solutions-heading">Useful technology, built with intent.</h2>
        </div>
        <div className="capability-grid">
          {homepageModel.capabilities.map((capability, index) => (
            <article className="capability-card" key={capability.title}>
              <span className="capability-number">0{index + 1}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <a href="#contact" aria-label={`Explore ${capability.title}`}>
                Explore <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="approach" id="approach">
        <p className="eyebrow">The Stack &amp; Scale standard</p>
        <h2>Clear thinking. Dependable delivery. Software that earns trust.</h2>
      </section>

      <section className="feature-strip" aria-labelledby="explore-heading">
        <div>
          <p className="eyebrow">Explore the practice</p>
          <h2 id="explore-heading">Start where the work is most urgent.</h2>
        </div>
        <div className="feature-links">
          <a href="/products">
            Products <span aria-hidden="true">→</span>
          </a>
          <a href="/services">
            Services <span aria-hidden="true">→</span>
          </a>
          <a href="/industries">
            Industries <span aria-hidden="true">→</span>
          </a>
          <a href="/work">
            Our work <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section
        className="contact-panel"
        id="contact"
        aria-labelledby="contact-heading"
      >
        <div>
          <p className="eyebrow">Start with a conversation</p>
          <h2 id="contact-heading">
            Let&apos;s make your next system useful from day one.
          </h2>
        </div>
        <Button render={<a href="/contact" />}>
          Discuss your project <span aria-hidden="true">→</span>
        </Button>
      </section>
      <SiteFooter />
    </main>
  );
}

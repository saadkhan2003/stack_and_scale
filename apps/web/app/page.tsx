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
          <div className="hero-badge">
            <span className="status-ping" aria-hidden="true" />
            <span>Stack &amp; Scale Platform · v2.4</span>
          </div>
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
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-check" aria-hidden="true">
                ✓
              </span>
              <span>99.99% Uptime SLA</span>
            </div>
            <div className="trust-item">
              <span className="trust-check" aria-hidden="true">
                ✓
              </span>
              <span>Zero Vendor Lock-in</span>
            </div>
            <div className="trust-item">
              <span className="trust-check" aria-hidden="true">
                ✓
              </span>
              <span>Self-Hosted &amp; Sovereign</span>
            </div>
          </div>
          <p className="trust-line">
            Built for local businesses today. Ready to scale with you tomorrow.
          </p>
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

      <section
        className="approach"
        id="approach"
        aria-labelledby="approach-heading"
      >
        <p className="eyebrow">The Stack &amp; Scale standard</p>
        <h2 id="approach-heading">
          Clear thinking. Dependable delivery. Software that earns trust.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px mt-12 relative z-10 bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
          <div className="p-7 bg-[#111]">
            <div className="text-xs font-mono text-[#80ddd1] tracking-widest uppercase mb-3">
              01 · Sovereignty
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Zero Vendor Lock-in
            </h3>
            <p className="text-sm text-[#888] leading-relaxed">
              Complete ownership of your database, storage, and models.
              Self-hosted on your own hardware or VPC with no artificial
              per-seat fees.
            </p>
          </div>
          <div className="p-7 bg-[#111]">
            <div className="text-xs font-mono text-[#f4c542] tracking-widest uppercase mb-3">
              02 · Velocity
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Sub-Second Operations
            </h3>
            <p className="text-sm text-[#888] leading-relaxed">
              Real-time point-of-sale synchronization, automated event queues,
              and instant customer handoffs without latency bottlenecks.
            </p>
          </div>
          <div className="p-7 bg-[#111]">
            <div className="text-xs font-mono text-[#80ddd1] tracking-widest uppercase mb-3">
              03 · Security
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Defense in Depth
            </h3>
            <p className="text-sm text-[#888] leading-relaxed">
              Automated ClamAV antivirus file scanning, encrypted private MinIO
              S3 object storage, and Keycloak enterprise single sign-on.
            </p>
          </div>
        </div>
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

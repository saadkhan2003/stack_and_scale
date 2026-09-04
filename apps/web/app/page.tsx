import { homepageModel } from "../src/homepage-content";
import { metadataForPath } from "../src/seo";
import { SiteFooter } from "../src/site-footer";
import { SiteHeader } from "../src/site-header";
import { Button } from "@/components/ui/button";
import {
  HeroConsole,
  ClientLogos,
  BentoGrid,
  ArchitectureExplorer,
  ComparisonMatrix,
  MetricsBar,
  TestimonialCards,
  FaqAccordion,
  AuroraBottomCta,
} from "../src/landing-interactive";

export const metadata = metadataForPath(
  "/",
  "Software for real operations",
  "Purposeful products, services and delivery partnership for clearer operations.",
);

export default function HomePage() {
  return (
    <main className="site-shell bg-black text-[#ededed]">
      <SiteHeader currentPath="/" />

      {/* 1. HERO SECTION WITH VERCEL-STYLE GLOW & CONSOLE */}
      <section className="hero relative pt-16 pb-20 overflow-hidden" id="top" aria-labelledby="hero-heading">
        {/* Ambient background glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(94,106,210,0.18),rgba(128,221,209,0.08)_40%,transparent_70%)] pointer-events-none -z-10" 
          aria-hidden="true" 
        />

        <div className="hero-copy max-w-5xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300 backdrop-blur-md mb-8 hover:border-white/20 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#80ddd1] animate-pulse" aria-hidden="true" />
            <span className="font-medium text-white">Stack &amp; Scale v2.4</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400">Enterprise Self-Hosted Infrastructure</span>
            <span className="text-zinc-500">→</span>
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono mb-4 font-semibold">
            {homepageModel.eyebrow}
          </p>

          <h1 
            id="hero-heading" 
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] mb-6 bg-gradient-to-b from-white via-[#f4f4f5] to-[#a1a1aa] bg-clip-text text-transparent"
          >
            {homepageModel.heading}
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            {homepageModel.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button render={<a href="#contact" />} className="!h-11 !px-7 !text-sm !font-semibold !rounded-full shadow-[0_0_24px_rgba(255,255,255,0.18)]">
              {homepageModel.primaryAction} <span aria-hidden="true" className="ml-1">→</span>
            </Button>
            <Button render={<a href="#solutions" />} variant="secondary" className="!h-11 !px-7 !text-sm !font-semibold !rounded-full">
              {homepageModel.secondaryAction}
            </Button>
            <Button render={<a href="/staff" />} variant="outline" className="!h-11 !px-6 !text-sm !font-medium !rounded-full">
              Access Staff CRM <span aria-hidden="true" className="ml-1 text-zinc-500">↗</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs font-mono text-zinc-400 border-t border-white/[0.07] pt-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-[#80ddd1]">✓</span>
              <span>99.999% Fault-Tolerant SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#80ddd1]">✓</span>
              <span>Zero Per-Seat SaaS Tax</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#80ddd1]">✓</span>
              <span>Self-Hosted &amp; Air-Gapped Ready</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Console Preview */}
        <div className="mt-12 max-w-5xl mx-auto px-4">
          <HeroConsole />
        </div>
      </section>

      {/* 2. ENTERPRISE CLIENT LOGOS */}
      <ClientLogos />

      {/* 3. CAPABILITIES / CORE SOLUTIONS */}
      <section
        className="capabilities max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06]"
        id="solutions"
        aria-labelledby="solutions-heading"
      >
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono mb-3 font-semibold">
            What we build
          </p>
          <h2 id="solutions-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Useful technology, built with absolute intent.
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            Eliminate fragile third-party SaaS subscriptions with purpose-engineered, sovereign software running directly on your edge nodes and private VPC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {homepageModel.capabilities.map((capability, index) => (
            <article 
              className="group relative p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between" 
              key={capability.title}
            >
              <div className="absolute top-0 right-0 p-6">
                <span className="font-mono text-xs text-zinc-600 group-hover:text-[#80ddd1] transition-colors">
                  0{index + 1}
                </span>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 text-zinc-300 group-hover:text-white group-hover:border-white/25 transition-all">
                  {index === 0 && <span className="text-base font-mono">POS</span>}
                  {index === 1 && <span className="text-base font-mono">&lt;/&gt;</span>}
                  {index === 2 && <span className="text-base font-mono">AI</span>}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                  {capability.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {capability.description}
                </p>
              </div>
              <a 
                href="#contact" 
                aria-label={`Explore ${capability.title}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300 group-hover:text-white transition-colors"
              >
                <span>Deploy capability</span>
                <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* 4. LINEAR-STYLE BENTO GRID */}
      <BentoGrid />

      {/* 5. INTERACTIVE ARCHITECTURE EXPLORER */}
      <ArchitectureExplorer />

      {/* 6. ENTERPRISE PERFORMANCE METRICS */}
      <MetricsBar />

      {/* 7. APPROACH & SOVEREIGNTY STANDARDS */}
      <section
        className="approach max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06]"
        id="approach"
        aria-labelledby="approach-heading"
      >
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono mb-3 font-semibold">
            The Stack &amp; Scale standard
          </p>
          <h2 id="approach-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Clear thinking. Dependable delivery. Software that earns trust.
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            Every system we design prioritizes operational durability, data custody, and frictionless execution for front-line operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.08] rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="p-8 bg-[#09090b] hover:bg-[#0c0c0e] transition-colors">
            <div className="text-xs font-mono text-[#80ddd1] tracking-widest uppercase mb-4">
              01 · Sovereignty
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
              Zero Vendor Lock-in
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Complete ownership of your database, storage, and models.
              Self-hosted on your own hardware or VPC with no artificial
              per-seat fees or telemetry tracking.
            </p>
          </div>
          <div className="p-8 bg-[#09090b] hover:bg-[#0c0c0e] transition-colors">
            <div className="text-xs font-mono text-[#f4c542] tracking-widest uppercase mb-4">
              02 · Velocity
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
              Sub-Second Operations
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Real-time point-of-sale synchronization, automated event queues,
              and instant customer handoffs without latency bottlenecks or multi-tenant degradation.
            </p>
          </div>
          <div className="p-8 bg-[#09090b] hover:bg-[#0c0c0e] transition-colors">
            <div className="text-xs font-mono text-[#80ddd1] tracking-widest uppercase mb-4">
              03 · Security
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
              Defense in Depth
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Automated ClamAV antivirus file scanning, encrypted private MinIO
              S3 object storage, and Keycloak enterprise single sign-on with multi-factor authentication.
            </p>
          </div>
        </div>
      </section>

      {/* 8. COMPARISON MATRIX (Stack & Scale vs Legacy SaaS vs DIY) */}
      <ComparisonMatrix />

      {/* 9. TESTIMONIALS / CASE STUDIES */}
      <TestimonialCards />

      {/* 10. FAQ ACCORDION */}
      <FaqAccordion />

      {/* 11. PRACTICE EXPLORATION STRIP */}
      <section className="feature-strip max-w-6xl mx-auto px-6 py-16 border-t border-white/[0.06]" aria-labelledby="explore-heading">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#09090b] p-8 rounded-2xl border border-white/[0.08]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono mb-2 font-semibold">Explore the practice</p>
            <h2 id="explore-heading" className="text-2xl font-bold text-white">Start where your operational friction is greatest.</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/products" className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-colors">
              Products →
            </a>
            <a href="/services" className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-colors">
              Services →
            </a>
            <a href="/industries" className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-colors">
              Industries →
            </a>
            <a href="/work" className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-colors">
              Our work →
            </a>
          </div>
        </div>
      </section>

      {/* 12. AURORA BOTTOM CTA */}
      <div id="contact">
        <AuroraBottomCta />
      </div>

      <SiteFooter />
    </main>
  );
}


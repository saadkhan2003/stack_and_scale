import { homepageModel } from "../src/homepage-content";
import { metadataForPath } from "../src/seo";
import { SiteFooter } from "../src/site-footer";
import { SiteHeader } from "../src/site-header";
import { Button } from "@/components/ui/button";
import {
  HeroConsole,
  ClientLogos,
  InteractiveCapabilitiesGrid,
  BentoGrid,
  ArchitectureExplorer,
  ComparisonMatrix,
  MetricsBar,
  InteractiveApproachGrid,
  TestimonialCards,
  FaqAccordion,
  InteractiveExploreStrip,
  AuroraBottomCta,
} from "../src/landing-interactive";
import { LinearFiguresSection } from "../src/linear-figures";
import { StorefrontPricingSection } from "../src/storefront-pricing";

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
      <section className="relative pt-20 pb-20 overflow-hidden" id="top" aria-labelledby="hero-heading">
        {/* Ambient background glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(94,106,210,0.18),rgba(128,221,209,0.08)_40%,transparent_70%)] pointer-events-none -z-10" 
          aria-hidden="true" 
        />

        <div className="w-full max-w-5xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300 backdrop-blur-md mb-8 hover:border-white/20 transition-colors linear-shimmer-badge">
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
            <Button render={<a href="#contact" />} className="!h-11 !px-7 !text-sm !font-semibold !rounded-full shadow-[0_0_24px_rgba(255,255,255,0.18)] !bg-white !text-black hover:!bg-[#ededed]">
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
        <div className="mt-12 w-full max-w-5xl mx-auto px-4">
          <HeroConsole />
        </div>
      </section>

      {/* 2. ENTERPRISE CLIENT LOGOS */}
      <ClientLogos />

      {/* 2.5 LINEAR ARCHITECTURAL WIREFRAME FIGURES (FIG 0.1 - FIG 0.3) */}
      <LinearFiguresSection />

      {/* 3. CAPABILITIES / CORE SOLUTIONS */}
      <section
        className="max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06]"
        id="solutions"
        aria-labelledby="solutions-heading"
      >
        <div className="section-intro">
          <p className="eyebrow">
            What we build
          </p>
          <h2 id="solutions-heading">
            Useful technology, built with absolute intent.
          </h2>
          <p>
            Eliminate fragile third-party SaaS subscriptions with purpose-engineered, sovereign software running directly on your edge nodes and private VPC.
          </p>
        </div>

        <InteractiveCapabilitiesGrid capabilities={homepageModel.capabilities} />
      </section>

      {/* 4. LINEAR-STYLE BENTO GRID */}
      <BentoGrid />

      {/* 5. INTERACTIVE ARCHITECTURE EXPLORER */}
      <ArchitectureExplorer />

      {/* 6. ENTERPRISE PERFORMANCE METRICS */}
      <MetricsBar />

      {/* 7. APPROACH & SOVEREIGNTY STANDARDS */}
      <section
        className="max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06]"
        id="approach"
        aria-labelledby="approach-heading"
      >
        <div className="section-intro">
          <p className="eyebrow">
            The Stack &amp; Scale standard
          </p>
          <h2 id="approach-heading">
            Clear thinking. Dependable delivery. Software that earns trust.
          </h2>
          <p>
            Every system we design prioritizes operational durability, data custody, and frictionless execution for front-line operators.
          </p>
        </div>

        <InteractiveApproachGrid />
      </section>

      {/* 8. COMPARISON MATRIX (Stack & Scale vs Legacy SaaS vs DIY) */}
      <ComparisonMatrix />

      {/* 8.5 DIRECT PRICING & SOVEREIGN STOREFRONT */}
      <StorefrontPricingSection />

      {/* 9. TESTIMONIALS / CASE STUDIES */}
      <TestimonialCards />

      {/* 10. FAQ ACCORDION */}
      <FaqAccordion />

      {/* 11. PRACTICE EXPLORATION STRIP */}
      <InteractiveExploreStrip />

      {/* 12. AURORA BOTTOM CTA */}
      <div id="contact">
        <AuroraBottomCta />
      </div>

      <SiteFooter />
    </main>
  );
}


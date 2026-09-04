import { homepageModel } from "../src/homepage-content";
import { metadataForPath } from "../src/seo";
import { SiteFooter } from "../src/site-footer";
import { SiteHeader } from "../src/site-header";
import { HeroBackdrop } from "../src/hero-backdrop";
import { Button } from "@/components/ui/button";
import {
  HeroConsole,
  ClientLogos,
  InteractiveCapabilitiesGrid,
  ArchitectureExplorer,
  ComparisonMatrix,
  MetricsBar,
  InteractiveApproachGrid,
  TestimonialCards,
  FaqAccordion,
  InteractiveExploreStrip,
  AuroraBottomCta,
} from "../src/landing-interactive";
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

      {/* 1. HERO SECTION WITH LINEAR HORIZON, GRID MESH & CONSOLE */}
      <section
        className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden"
        id="top"
        aria-labelledby="hero-heading"
      >
        {/* Dynamic Architectural Mesh & Celestial Horizon Backdrop */}
        <HeroBackdrop />

        <div className="w-full max-w-[1360px] mx-auto text-center px-5 sm:px-8 lg:px-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md border border-white/10 bg-white/[0.03] text-xs text-zinc-300 backdrop-blur-md mb-6 sm:mb-8 hover:border-white/20 transition-colors linear-shimmer-badge max-w-[95vw]">
            <span
              className="w-2 h-2 rounded-full bg-[#80ddd1] animate-pulse shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium text-white shrink-0">
              Stack &amp; Scale v2.4
            </span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400 hidden sm:inline">
              Enterprise Self-Hosted Infrastructure
            </span>
            <span className="text-zinc-400 sm:hidden truncate">
              Self-Hosted Infra
            </span>
            <span className="text-zinc-500">→</span>
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono mb-4 font-semibold">
            {homepageModel.eyebrow}
          </p>

          <h1
            id="hero-heading"
            className="text-3xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] sm:leading-[1.08] mb-5 sm:mb-6 bg-gradient-to-b from-white via-[#f4f4f5] to-[#a1a1aa] bg-clip-text text-transparent"
          >
            {homepageModel.heading}
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            {homepageModel.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-10 sm:mb-12 max-w-md sm:max-w-none mx-auto">
            <Button
              render={<a href="#contact" />}
              className="w-full sm:w-auto !h-11 !px-7 !text-sm !font-semibold !rounded-lg shadow-[0_0_24px_rgba(255,255,255,0.18)] !bg-white !text-black hover:!bg-[#ededed]"
            >
              {homepageModel.primaryAction}{" "}
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Button>
            <Button
              render={<a href="#solutions" />}
              variant="secondary"
              className="w-full sm:w-auto !h-11 !px-7 !text-sm !font-semibold !rounded-lg"
            >
              {homepageModel.secondaryAction}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs font-mono text-zinc-400 border-t border-white/[0.07] pt-6 max-w-2xl mx-auto">
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
        <div className="mt-14 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <HeroConsole />
        </div>
      </section>

      {/* 2. ENTERPRISE CLIENT LOGOS */}
      <ClientLogos />

      {/* 3. CAPABILITIES / CORE SOLUTIONS */}
      <section
        className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 py-24 border-t border-white/[0.06]"
        id="solutions"
        aria-labelledby="solutions-heading"
      >
        <div className="section-header-split">
          <div className="header-left">
            <span className="eyebrow">Store Floors &amp; Warehouses</span>
            <h2 id="solutions-heading">
              Point of sale, inventory, and order dispatch in one system.
            </h2>
          </div>
          <div className="header-right">
            <p>
              Replace three fragile subscriptions with software that runs
              directly on your registers and local servers. No per-seat
              penalties, no cloud lockouts.
            </p>
          </div>
        </div>

        <InteractiveCapabilitiesGrid
          capabilities={homepageModel.capabilities}
        />
      </section>

      {/* 4. INTERACTIVE ARCHITECTURE EXPLORER */}
      <ArchitectureExplorer />

      {/* 6. ENTERPRISE PERFORMANCE METRICS */}
      <MetricsBar />

      {/* 7. APPROACH & SOVEREIGNTY STANDARDS */}
      <section
        className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 py-24 border-t border-white/[0.06]"
        id="approach"
        aria-labelledby="approach-heading"
      >
        <div className="section-header-split">
          <div className="header-left">
            <span className="eyebrow">Reliability Standards</span>
            <h2 id="approach-heading">
              Engineered for busy checkout counters and spotty Wi-Fi.
            </h2>
          </div>
          <div className="header-right">
            <p>
              Front-line cashiers and warehouse staff don&apos;t have time for
              spinning loading wheels. Every screen, keystroke, and barcode scan
              is built to survive high-volume rush hours.
            </p>
          </div>
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

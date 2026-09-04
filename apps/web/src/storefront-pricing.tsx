"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  CreditCard,
  Download,
  ExternalLink,
  HardDrive,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleCardSpotlight } from "./landing-interactive";

type BillingModel = "saas" | "sovereign";
type DemoProduct = "pos" | "crm" | "workflow";

export function StorefrontPricingSection() {
  const [billingModel, setBillingModel] = useState<BillingModel>("sovereign");
  const [activeDemo, setActiveDemo] = useState<DemoProduct | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<string | null>(null);

  // Demo interactive states
  const [posItems, setPosItems] = useState([
    { id: "SKU-992", name: "Thermal Receipt Terminal Roll", price: 24.5, qty: 2 },
    { id: "SKU-418", name: "High-Speed Barcode Scanner Gun", price: 189.0, qty: 1 },
  ]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [posSyncLog, setPosSyncLog] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addPosItem = () => {
    const newItem = {
      id: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: "Handheld Inventory Edge Node",
      price: 349.0,
      qty: 1,
    };
    setPosItems((prev) => [...prev, newItem]);
    const logMsg = isOfflineMode
      ? `[OFFLINE] Logged transaction to local SQLite (0.4ms) · Queued for cloud sync`
      : `[ONLINE] Settled via Edge Engine (0.8ms) · Replicated to Postgres Vault`;
    setPosSyncLog((prev) => [logMsg, ...prev.slice(0, 4)]);
  };

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsOfflineMode(false);
      setPosSyncLog((prev) => [
        `[RECONCILED] 2 offline transactions flushed · Zero conflicts detected`,
        ...prev,
      ]);
    }, 900);
  };

  return (
    <section
      id="pricing"
      className="relative w-full max-w-6xl mx-auto px-6 py-28 border-t border-white/[0.06] bg-black text-white"
      aria-label="Direct Pricing and Storefront"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(128,221,209,0.08),rgba(94,106,210,0.05)_40%,transparent_70%)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300 backdrop-blur-md mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#80ddd1]" />
          <span>Direct Self-Serve Storefront</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">No Sales Calls Required</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Transparent pricing. Sovereign software.
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          Choose between managed high-performance Cloud SaaS or one-time Sovereign Licenses with complete source code custody.
        </p>

        {/* Pricing Model Selector Switch */}
        <div className="mt-8 inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setBillingModel("sovereign")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              billingModel === "sovereign"
                ? "bg-white text-black shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>One-Time Sovereign License</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#80ddd1]/20 text-[#155a53]">
              Own Forever
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBillingModel("saas")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              billingModel === "saas"
                ? "bg-white text-black shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Cloud SaaS (Monthly)</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
              Managed
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: SOVEREIGN ONE-TIME LICENSES (ANTI-SAAS STOREFRONT)   */}
      {/* ------------------------------------------------------------- */}
      {billingModel === "sovereign" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 animate-in fade-in duration-300">
          {/* Product 1: Retail POS Sovereign Suite */}
          <article
            className="rounded-2xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
            onMouseMove={handleCardSpotlight}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#80ddd1]">
                  Complete Product
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  v2.4
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Retail Operations &amp; POS Suite
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Offline-first shop floor register with SQLite local transactions, automated cloud sync, and inventory ledger.
              </p>

              <div className="mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    $1,490
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    one-time perpetual
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  100% source code + Docker blueprints included.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Unlimited store registers &amp; edge nodes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Offline-first SQLite local persistence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Zero monthly per-seat or register fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Full source code with git repository access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>12 months of guaranteed security updates</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => setActiveDemo("pos")}
                variant="outline"
                className="w-full !h-10 !text-xs !font-medium !rounded-full border-white/15 bg-white/[0.02] hover:bg-white/10"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-[#80ddd1]" />
                Try Live Demo in Browser
              </Button>
              <Button
                type="button"
                onClick={() => setCheckoutProduct("Retail Operations & POS Suite ($1,490)")}
                className="w-full !h-10 !text-xs !font-semibold !rounded-full !bg-white !text-black hover:!bg-zinc-200 shadow-md"
              >
                Buy Sovereign License →
              </Button>
            </div>
          </article>

          {/* Product 2: Autonomous CRM & Edge Pipeline (Highlighted) */}
          <article
            className="rounded-2xl border border-[#80ddd1]/40 bg-[#08080c] p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#80ddd1]/70 shadow-[0_0_35px_rgba(128,221,209,0.07)] spotlight-card relative"
            onMouseMove={handleCardSpotlight}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#80ddd1] text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#80ddd1]">
                  Complete Product
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#80ddd1]/15 text-[#80ddd1]">
                  v3.1
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Autonomous CRM &amp; Pipeline
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Customer relationship ledger and automated dispatch pipeline with zero third-party tracking or per-seat penalties.
              </p>

              <div className="mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    $890
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    one-time perpetual
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Direct Postgres schema + Next.js client suite.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Unlimited team accounts &amp; contacts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Keycloak OIDC &amp; RBAC integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Event-driven webhook &amp; lead automations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>100% data custody on your own database</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>12 months of prioritized repo releases</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => setActiveDemo("crm")}
                variant="outline"
                className="w-full !h-10 !text-xs !font-medium !rounded-full border-[#80ddd1]/30 bg-[#80ddd1]/[0.03] hover:bg-[#80ddd1]/10 text-[#80ddd1]"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-[#80ddd1]" />
                Try Live Demo in Browser
              </Button>
              <Button
                type="button"
                onClick={() => setCheckoutProduct("Autonomous CRM & Pipeline ($890)")}
                className="w-full !h-10 !text-xs !font-semibold !rounded-full !bg-[#80ddd1] !text-black hover:!bg-[#9eeae0] shadow-md"
              >
                Buy Sovereign License →
              </Button>
            </div>
          </article>

          {/* Product 3: Sovereign Full Stack Bundle */}
          <article
            className="rounded-2xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
            onMouseMove={handleCardSpotlight}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  Full Bundle
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  Enterprise
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Complete Sovereign Bundle
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                All ready-to-use software products, edge deployment CLI, and multi-node orchestration engine.
              </p>

              <div className="mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    $2,990
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    one-time bundle
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Save $1,390 compared to individual purchases.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Retail POS + Autonomous CRM + Workflow Hub</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Dedicated deployment architecture session</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Air-gapped VPC setup scripts &amp; CI/CD</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Permanent commercial perpetual license</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>24 months of updates &amp; security patches</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => setActiveDemo("pos")}
                variant="outline"
                className="w-full !h-10 !text-xs !font-medium !rounded-full border-white/15 bg-white/[0.02] hover:bg-white/10"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-[#80ddd1]" />
                Explore Demo Suite
              </Button>
              <Button
                type="button"
                onClick={() => setCheckoutProduct("Complete Sovereign Bundle ($2,990)")}
                className="w-full !h-10 !text-xs !font-semibold !rounded-full !bg-white !text-black hover:!bg-zinc-200 shadow-md"
              >
                Purchase Full Bundle →
              </Button>
            </div>
          </article>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: CLOUD SAAS SUBSCRIPTIONS (MANAGED CLOUD TIERS)        */}
      {/* ------------------------------------------------------------- */}
      {billingModel === "saas" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 animate-in fade-in duration-300">
          {/* Tier 1: Starter */}
          <article
            className="rounded-2xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
            onMouseMove={handleCardSpotlight}
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-4">
                Starter Tier
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Core Node</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                For single locations or growing operations that need dependable software with managed cloud hosting.
              </p>

              <div className="mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    $49
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/month</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Billed monthly · Cancel anytime
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>1 Active Edge Node or Store Terminal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Up to 5 Team Members included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Continuous Cloud Backup &amp; Sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>99.9% Uptime Guarantee</span>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              onClick={() => setCheckoutProduct("Core Node SaaS ($49/mo)")}
              className="w-full !h-10 !text-xs !font-semibold !rounded-full !bg-white !text-black hover:!bg-zinc-200"
            >
              Start 14-Day Free Trial →
            </Button>
          </article>

          {/* Tier 2: Professional / Growth (Highlighted) */}
          <article
            className="rounded-2xl border border-[#80ddd1]/40 bg-[#08080c] p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#80ddd1]/70 shadow-[0_0_35px_rgba(128,221,209,0.07)] spotlight-card relative"
            onMouseMove={handleCardSpotlight}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#80ddd1] text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
              Recommended
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#80ddd1] block mb-4">
                Professional
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Growth Cluster</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Multi-location operations needing real-time cross-store mesh synchronization and automated event pipelines.
              </p>

              <div className="mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    $199
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/month</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Includes up to 10 edge terminals
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Up to 10 Edge Registers &amp; Nodes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Unlimited Staff Accounts (Zero seat tax)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Sub-second multi-store delta replication</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Real-time Telemetry &amp; Error Sandboxing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Priority 4-hour SLA response</span>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              onClick={() => setCheckoutProduct("Growth Cluster SaaS ($199/mo)")}
              className="w-full !h-10 !text-xs !font-semibold !rounded-full !bg-[#80ddd1] !text-black hover:!bg-[#9eeae0]"
            >
              Start 14-Day Free Trial →
            </Button>
          </article>

          {/* Tier 3: Enterprise */}
          <article
            className="rounded-2xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
            onMouseMove={handleCardSpotlight}
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-4">
                Enterprise
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Dedicated VPC</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                For regional chains and regulated operations requiring single-tenant isolation, compliance audits, and custom pipelines.
              </p>

              <div className="mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    $899
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/month</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Dedicated isolated cloud infrastructure
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Unlimited Edge Nodes &amp; Store Clusters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Isolated Single-Tenant AWS/GCP VPC</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>99.999% Fault-Tolerant Guaranteed SLA</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                  <span>Dedicated Solutions Architect &amp; Slack</span>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              render={<a href="#contact" />}
              className="w-full !h-10 !text-xs !font-semibold !rounded-full !bg-white !text-black hover:!bg-zinc-200"
            >
              Contact Enterprise Engineering →
            </Button>
          </article>
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 max-w-3xl mx-auto text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-sm font-semibold text-white">
            100% Sovereign Code Ownership Guarantee
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            When you purchase sovereign software from Stack &amp; Scale, you receive unencumbered source code rights. No vendor lock-in. Ever.
          </p>
        </div>
        <a
          href="#solutions"
          className="shrink-0 text-xs font-semibold text-[#80ddd1] hover:underline flex items-center gap-1"
        >
          View System Architecture <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE IN-BROWSER "TRY LIVE DEMO" SANDBOX MODAL          */}
      {/* ------------------------------------------------------------- */}
      {activeDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-[#0c0c10] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#80ddd1] animate-pulse" />
                <div>
                  <h3 id="demo-modal-title" className="text-sm font-semibold text-white">
                    Live Interactive Demo · {activeDemo === "pos" ? "Retail POS & Offline Engine" : "Autonomous CRM"}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Active in-browser sandbox · Real state execution
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDemo(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close demo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {activeDemo === "pos" ? (
                <>
                  {/* Mode Bar: Online vs Offline */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      {isOfflineMode ? (
                        <WifiOff className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Wifi className="w-5 h-5 text-[#80ddd1]" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Terminal Status:{" "}
                          <span className={isOfflineMode ? "text-amber-400 font-mono" : "text-[#80ddd1] font-mono"}>
                            {isOfflineMode ? "DISCONNECTED (OFFLINE MODE)" : "CONNECTED (EDGE SYNCED)"}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {isOfflineMode
                            ? "Transactions write directly to SQLite on this device without interruption."
                            : "Live replication to Postgres Vault active with 0.8ms latency."}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsOfflineMode(!isOfflineMode)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isOfflineMode
                            ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                            : "border-white/15 bg-white/5 text-zinc-300 hover:text-white"
                        }`}
                      >
                        {isOfflineMode ? "Simulate Reconnect" : "Simulate Outage"}
                      </button>

                      {isOfflineMode && (
                        <button
                          type="button"
                          onClick={handleSimulateSync}
                          disabled={isSyncing}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#80ddd1] text-black hover:bg-[#9eeae0] transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                          <span>Flush Sync</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Register Item List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                        Active Cart / Register Feed
                      </span>
                      <button
                        type="button"
                        onClick={addPosItem}
                        className="text-xs font-semibold text-[#80ddd1] hover:underline flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" /> + Scan Barcode
                      </button>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-black/50 divide-y divide-white/[0.06] overflow-hidden max-h-48 overflow-y-auto">
                      {posItems.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                              {item.id}
                            </span>
                            <span className="text-zinc-200">{item.name}</span>
                          </div>
                          <div className="font-mono text-white font-semibold">
                            ${(item.price * item.qty).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Output Log */}
                  <div>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                      Edge Audit Log Stream
                    </span>
                    <div className="rounded-xl border border-white/[0.08] bg-black p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                      {posSyncLog.length === 0 ? (
                        <div className="text-zinc-600">
                          Click "+ Scan Barcode" or "Simulate Outage" to trigger real-time edge events...
                        </div>
                      ) : (
                        posSyncLog.map((log, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[#80ddd1]">❯</span>
                            <span className={log.includes("OFFLINE") ? "text-amber-300" : "text-zinc-300"}>
                              {log}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* CRM Demo */
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Stack &amp; Scale Autonomous CRM runs entirely on your dedicated database with zero per-seat subscription penalties.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="text-[11px] font-mono text-zinc-500">Inbound Leads</div>
                      <div className="text-2xl font-bold text-white mt-1">42</div>
                      <div className="text-[10px] text-[#80ddd1] mt-0.5">+8 today via edge API</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="text-[11px] font-mono text-zinc-500">Pipeline Value</div>
                      <div className="text-2xl font-bold text-white mt-1">$148,200</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Zero SaaS seat tax</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="text-[11px] font-mono text-zinc-500">Event Latency</div>
                      <div className="text-2xl font-bold text-white mt-1">1.2ms</div>
                      <div className="text-[10px] text-[#80ddd1] mt-0.5">Postgres verified</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Ready to deploy this to your own hardware?
              </span>
              <Button
                type="button"
                onClick={() => {
                  setActiveDemo(null);
                  setCheckoutProduct(
                    activeDemo === "pos"
                      ? "Retail Operations & POS Suite ($1,490)"
                      : "Autonomous CRM & Pipeline ($890)"
                  );
                }}
                className="!h-9 !px-4 !text-xs !font-semibold !rounded-full !bg-white !text-black hover:!bg-zinc-200"
              >
                Proceed to Checkout →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INSTANT SELF-SERVICE CHECKOUT / ONBOARDING FLOW MODAL         */}
      {/* ------------------------------------------------------------- */}
      {checkoutProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-[#0c0c10] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#80ddd1]" />
                <h3 id="checkout-modal-title" className="text-base font-bold text-white">
                  Instant Self-Serve Checkout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutProduct(null)}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close checkout"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4">
              <span className="text-[10px] font-mono uppercase text-[#80ddd1]">Selected License</span>
              <div className="text-sm font-semibold text-white mt-0.5">{checkoutProduct}</div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Instant delivery · Immediate GitHub &amp; Docker repo provisioning
              </p>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Organization / Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Retail Operations LLC"
                  className="w-full h-9 rounded-lg bg-black border border-white/15 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Engineering Lead Work Email</label>
                <input
                  type="email"
                  placeholder="alex@acme.com"
                  className="w-full h-9 rounded-lg bg-black border border-white/15 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Payment Method</label>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/15 bg-black text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    <span>Stripe Sovereign Checkout</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">256-BIT ENCRYPTED</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                alert(`Thank you! A sovereign deployment provisioning invite has been sent to your email with instant repository access.`);
                setCheckoutProduct(null);
              }}
              className="w-full !h-11 !text-sm !font-semibold !rounded-full !bg-white !text-black hover:!bg-zinc-200 shadow-lg"
            >
              Complete Sovereign Purchase →
            </Button>

            <p className="text-[11px] text-center text-zinc-400 mt-4">
              Protected by our 30-Day Money-Back Sovereign Guarantee. No lock-in.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

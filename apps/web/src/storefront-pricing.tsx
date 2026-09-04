"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Play,
  RefreshCw,
  Server,
  Shield,
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
  const [billingModel, setBillingModel] = useState<BillingModel>("saas");
  const [activeDemo, setActiveDemo] = useState<DemoProduct | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<string | null>(null);

  // Cloud SaaS Self-Serve Provisioning State
  const [provisionPlan, setProvisionPlan] = useState<string | null>(null);
  const [provisionCompany, setProvisionCompany] = useState("");
  const [provisionEmail, setProvisionEmail] = useState("");
  const [provisionProduct, setProvisionProduct] = useState<
    "pos" | "crm" | "workflow"
  >("pos");
  const [provisioningStatus, setProvisioningStatus] = useState<
    "idle" | "provisioning" | "ready"
  >("idle");
  const [provisioningStep, setProvisioningStep] = useState(0);

  // Demo interactive states
  const [posItems, setPosItems] = useState([
    {
      id: "SKU-992",
      name: "Thermal Receipt Terminal Roll",
      price: 24.5,
      qty: 2,
    },
    {
      id: "SKU-418",
      name: "High-Speed Barcode Scanner Gun",
      price: 189.0,
      qty: 1,
    },
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

  const computedSlug =
    provisionCompany
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "your-company";

  const handleStartProvisioning = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const company =
      (formData.get("company") as string)?.trim() || provisionCompany.trim();
    const email =
      (formData.get("email") as string)?.trim() || provisionEmail.trim();

    if (!company || !email) return;

    setProvisionCompany(company);
    setProvisionEmail(email);
    setProvisioningStatus("provisioning");
    setProvisioningStep(1);

    const slug =
      company
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "your-company";

    // Best-effort send lead in background to /api/leads
    try {
      void fetch("/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          name: company,
          email: email,
          company: company,
          intakeType: "cloud-trial",
          message: `Self-serve Cloud SaaS 14-day trial requested for ${provisionPlan || "Core Node"} focusing on ${provisionProduct}. Subdomain: ${slug}.stackandscale.cloud`,
          consent: true,
          attribution: {
            landingPage: window.location.pathname,
            source: "public-storefront",
            cta: "cloud-trial-provision",
          },
        }),
      }).catch(() => {});
    } catch {
      // Ignored for non-blocking telemetry
    }

    setTimeout(() => {
      setProvisioningStep(2);
    }, 500);

    setTimeout(() => {
      setProvisioningStep(3);
    }, 1000);

    setTimeout(() => {
      setProvisioningStatus("ready");
      window.location.href = `/cloud?tenant=${encodeURIComponent(slug)}&tab=${provisionProduct}`;
    }, 1600);
  };

  return (
    <section
      id="pricing"
      className="relative w-full max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 py-28 border-t border-white/[0.06] bg-black text-white"
      aria-label="Direct Pricing and Storefront"
    >
      {/* Background glow */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(128,221,209,0.12),rgba(94,106,210,0.06)_45%,transparent_70%)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="section-header-split !mb-8 !pb-8">
        <div className="header-left">
          {/* Polished Status Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#80ddd1]/25 bg-[#80ddd1]/[0.06] text-xs font-mono tracking-wide text-[#80ddd1] mb-5 shadow-[0_0_15px_rgba(128,221,209,0.08)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#80ddd1] shadow-[0_0_8px_#80ddd1] animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Direct Storefront
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300 font-normal">
              Self-Serve Provisioning
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white leading-[1.1] mb-3">
            Straightforward pricing.{" "}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              No per-user penalties.
            </span>
          </h2>
        </div>

        <div className="header-right flex flex-col items-start sm:items-end justify-between">
          <p className="text-sm sm:text-[15px] text-zinc-400 font-normal leading-relaxed mb-6 text-left sm:text-right max-w-md">
            Deploy instantly on managed high-availability cloud, or purchase a
            perpetual sovereign license with complete source code custody.
          </p>

          {/* Precision Segmented Control Switcher */}
          <div
            className="inline-flex items-center p-1 rounded-xl bg-zinc-950 border border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.6)] w-full sm:w-auto"
            role="tablist"
            aria-label="Pricing model"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billingModel === "saas"}
              onClick={() => setBillingModel("saas")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                billingModel === "saas"
                  ? "bg-white text-black font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.2)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Server
                className={`w-3.5 h-3.5 shrink-0 ${billingModel === "saas" ? "text-black" : "text-zinc-400"}`}
              />
              <span className="whitespace-nowrap">Cloud SaaS</span>
              <span
                className={`hidden sm:inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                  billingModel === "saas"
                    ? "bg-black/10 text-zinc-800 font-semibold border border-black/10"
                    : "bg-white/[0.05] text-zinc-400 border border-white/[0.08]"
                }`}
              >
                Monthly
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={billingModel === "sovereign"}
              onClick={() => setBillingModel("sovereign")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                billingModel === "sovereign"
                  ? "bg-white text-black font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.2)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Shield
                className={`w-3.5 h-3.5 shrink-0 ${billingModel === "sovereign" ? "text-[#0d9488]" : "text-[#80ddd1]"}`}
              />
              <span className="whitespace-nowrap">Sovereign License</span>
              <span
                className={`hidden sm:inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                  billingModel === "sovereign"
                    ? "bg-emerald-950/15 text-emerald-900 font-bold border border-emerald-900/20"
                    : "bg-[#80ddd1]/10 text-[#80ddd1] border border-[#80ddd1]/20"
                }`}
              >
                Own Forever
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Value Assurance Badges Strip */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 px-4 rounded-xl border border-white/[0.06] bg-zinc-950/40 text-xs font-mono text-zinc-400 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
            <span>Instant cloud activation · No hardware purchase</span>
          </span>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="flex items-center gap-2 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
            <span>14-day free trial on all cloud tiers</span>
          </span>
        </div>

        <Link
          href="/cloud"
          className="text-[#80ddd1] hover:text-white transition-colors flex items-center gap-1.5 font-medium group text-xs shrink-0 self-start sm:self-auto"
        >
          <span>Explore Cloud Apps &amp; Free Tiers</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: CLOUD SAAS SUBSCRIPTIONS (DEFAULT - ZERO UPFRONT)    */}
      {/* ------------------------------------------------------------- */}
      {billingModel === "saas" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-3.5">
            {/* Tier 1: Core Node */}
            <article
              className="rounded-xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
              onMouseMove={handleCardSpotlight}
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-4">
                  Developer
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Core Node</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Single-unit retail or field service deployment. Local SQLite
                  engine with asynchronous cloud sync.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      $49
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      /month
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Includes 1 edge node &amp; full sync pipeline
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                    <span>1 Active Edge Node (POS / Tablet)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                    <span>Unlimited Staff Accounts (Zero seat tax)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                    <span>Cloud PostgreSQL Delta Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                    <span>Automated nightly backup vault</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                    <span>Community Discord &amp; Docs support</span>
                  </li>
                </ul>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setProvisionPlan("Core Node SaaS ($49/mo)");
                  setProvisionProduct("pos");
                }}
                className="w-full !h-10 !text-xs !font-semibold !rounded-lg !bg-white !text-black hover:!bg-zinc-200"
              >
                Start 14-Day Free Trial →
              </Button>
            </article>

            {/* Tier 2: Growth Cluster (Recommended) */}
            <div className="relative flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-md bg-[#80ddd1] text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_2px_10px_rgba(128,221,209,0.35)] pointer-events-none">
                Most Popular
              </div>

              <article
                className="rounded-xl border border-[#80ddd1]/40 bg-[#08080c] p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#80ddd1]/70 shadow-[0_0_35px_rgba(128,221,209,0.07)] spotlight-card flex-1 h-full"
                onMouseMove={handleCardSpotlight}
              >
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#80ddd1] block mb-4">
                    Professional
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Growth Cluster
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    Multi-location operations needing real-time cross-store
                    replication and autonomous CRM pipelines.
                  </p>

                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        $199
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        /month
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Includes up to 10 edge registers
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
                      <span>Autonomous AI Qualification Worker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                      <span>Priority 4-hour SLA response</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setProvisionPlan("Growth Cluster SaaS ($199/mo)");
                    setProvisionProduct("crm");
                  }}
                  className="w-full !h-10 !text-xs !font-semibold !rounded-lg !bg-[#80ddd1] !text-black hover:!bg-[#9eeae0]"
                >
                  Start 14-Day Free Trial →
                </Button>
              </article>
            </div>

            {/* Tier 3: Dedicated VPC */}
            <article
              className="rounded-xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
              onMouseMove={handleCardSpotlight}
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-4">
                  Enterprise
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Dedicated VPC
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  For regional chains and regulated operations requiring
                  single-tenant isolation, compliance audits, and custom
                  pipelines.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      $899
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      /month
                    </span>
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
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0" />
                    <span>Complete Source Code Upgrade Option</span>
                  </li>
                </ul>
              </div>

              <Button
                type="button"
                render={<a href="#contact" />}
                className="w-full !h-10 !text-xs !font-semibold !rounded-lg !bg-white !text-black hover:!bg-zinc-200"
              >
                Contact Enterprise Engineering →
              </Button>
            </article>
          </div>

          {/* Cloud Applications Direct Access Banner */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#80ddd1]/10 border border-[#80ddd1]/20 flex items-center justify-center text-[#80ddd1] shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Looking for online deployed software?
                </h4>
                <p className="text-xs text-zinc-400">
                  Access our cloud directory to launch Free Tier instances or
                  manage monthly subscriptions with zero hardware setup.
                </p>
              </div>
            </div>
            <Link
              href="/cloud"
              className="shrink-0 px-4 py-2 rounded-lg border border-white/15 bg-white/[0.04] text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
            >
              <span>View Cloud Apps &amp; Limits</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#80ddd1]" />
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: SOVEREIGN ONE-TIME LICENSES (PERPETUAL BUYOUT)        */}
      {/* ------------------------------------------------------------- */}
      {billingModel === "sovereign" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 pt-3.5 animate-in fade-in duration-300">
          {/* Product 1: Retail POS Sovereign Suite */}
          <article
            className="rounded-xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
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
                Offline-first shop floor register with SQLite local
                transactions, automated cloud sync, and inventory ledger.
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
                className="w-full !h-10 !text-xs !font-medium !rounded-lg border-white/15 bg-white/[0.02] hover:bg-white/10"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-[#80ddd1]" />
                Try Live Demo in Browser
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setCheckoutProduct("Retail Operations & POS Suite ($1,490)")
                }
                className="w-full !h-10 !text-xs !font-semibold !rounded-lg !bg-white !text-black hover:!bg-zinc-200 shadow-md"
              >
                Buy Sovereign License →
              </Button>
            </div>
          </article>

          {/* Product 2: Autonomous CRM & Edge Pipeline (Highlighted) */}
          <div className="relative flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-md bg-[#80ddd1] text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_2px_10px_rgba(128,221,209,0.35)] pointer-events-none">
              Most Popular
            </div>

            <article
              className="rounded-xl border border-[#80ddd1]/40 bg-[#08080c] p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#80ddd1]/70 shadow-[0_0_35px_rgba(128,221,209,0.07)] spotlight-card flex-1 h-full"
              onMouseMove={handleCardSpotlight}
            >
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
                  Customer relationship ledger and automated dispatch pipeline
                  with zero third-party tracking or per-seat penalties.
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
                  className="w-full !h-10 !text-xs !font-medium !rounded-lg border-[#80ddd1]/30 bg-[#80ddd1]/[0.03] hover:bg-[#80ddd1]/10 text-[#80ddd1]"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 text-[#80ddd1]" />
                  Try Live Demo in Browser
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    setCheckoutProduct("Autonomous CRM & Pipeline ($890)")
                  }
                  className="w-full !h-10 !text-xs !font-semibold !rounded-lg !bg-[#80ddd1] !text-black hover:!bg-[#9eeae0] shadow-md"
                >
                  Buy Sovereign License →
                </Button>
              </div>
            </article>
          </div>

          {/* Product 3: Sovereign Full Stack Bundle */}
          <article
            className="rounded-xl border border-white/[0.08] bg-[#050505] p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/25 spotlight-card relative"
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
                All ready-to-use software products, edge deployment CLI, and
                multi-node orchestration engine.
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
                className="w-full !h-10 !text-xs !font-medium !rounded-lg border-white/15 bg-white/[0.02] hover:bg-white/10"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-[#80ddd1]" />
                Explore Demo Suite
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setCheckoutProduct("Complete Sovereign Bundle ($2,990)")
                }
                className="w-full !h-10 !text-xs !font-semibold !rounded-lg !bg-white !text-black hover:!bg-zinc-200 shadow-md"
              >
                Purchase Full Bundle →
              </Button>
            </div>
          </article>
        </div>
      )}

      {/* Guarantee Banner */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 max-w-3xl mx-auto text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-sm font-semibold text-white">
            100% Sovereign Code Ownership Guarantee
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Whether starting in the cloud or self-hosting on-premises, your data
            is always sovereign and exportable.
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
      {/* CLOUD SAAS SELF-SERVE PROVISIONING MODAL                      */}
      {/* ------------------------------------------------------------- */}
      {provisionPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="provision-modal-title"
        >
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0c0c10] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-5 sm:p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#80ddd1]" />
                <h3
                  id="provision-modal-title"
                  className="text-base font-bold text-white"
                >
                  Launch Cloud Workspace
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProvisionPlan(null);
                  setProvisioningStatus("idle");
                }}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {provisioningStatus === "idle" ? (
              <form onSubmit={handleStartProvisioning} className="space-y-4">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#80ddd1]">
                      Selected Tier
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                      14-Day Free Trial
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {provisionPlan}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Zero hardware or dedicated server expense. Managed
                    PostgreSQL &amp; Edge Sync included.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">
                      Organization / Store Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="company"
                        required
                        value={provisionCompany}
                        onChange={(e) => setProvisionCompany(e.target.value)}
                        placeholder="e.g. Apex Retail"
                        className="w-full h-9 rounded-lg bg-black border border-white/15 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={provisionEmail}
                        onChange={(e) => setProvisionEmail(e.target.value)}
                        placeholder="alex@apexretail.com"
                        className="w-full h-9 rounded-lg bg-black border border-white/15 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">
                      Initial Application Module
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setProvisionProduct("pos")}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          provisionProduct === "pos"
                            ? "border-[#80ddd1] bg-[#80ddd1]/10 text-white"
                            : "border-white/10 bg-black text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div className="text-[11px] font-semibold">
                          Retail POS
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          Shop Floor
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvisionProduct("crm")}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          provisionProduct === "crm"
                            ? "border-[#80ddd1] bg-[#80ddd1]/10 text-white"
                            : "border-white/10 bg-black text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div className="text-[11px] font-semibold">CRM Hub</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          Pipeline
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvisionProduct("workflow")}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          provisionProduct === "workflow"
                            ? "border-[#80ddd1] bg-[#80ddd1]/10 text-white"
                            : "border-white/10 bg-black text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div className="text-[11px] font-semibold">
                          Workflow
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          Automations
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Subdomain Preview */}
                  <div className="p-2.5 rounded-lg border border-white/10 bg-black flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#80ddd1]" />{" "}
                      Subdomain:
                    </span>
                    <span className="text-[#80ddd1] truncate max-w-[200px]">
                      {computedSlug}.stackandscale.cloud
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full !h-11 !text-xs !font-semibold !rounded-lg !bg-[#80ddd1] !text-black hover:!bg-[#9eeae0] shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Launch Free Cloud Workspace →</span>
                  </Button>
                </div>

                <div className="text-center">
                  <Link
                    href="/cloud"
                    className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2"
                  >
                    Or browse the Cloud Application Directory &amp; Free Tiers
                    directly →
                  </Link>
                </div>
              </form>
            ) : (
              /* Animated Provisioning HUD */
              <div className="py-8 space-y-6 text-center">
                <div className="w-12 h-12 rounded-xl border border-[#80ddd1]/30 bg-[#80ddd1]/10 flex items-center justify-center mx-auto text-[#80ddd1]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    Provisioning Cloud Workspace
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    {computedSlug}.stackandscale.cloud
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black p-4 text-left font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${provisioningStep >= 1 ? "text-[#80ddd1]" : "text-zinc-600"}`}
                    />
                    <span
                      className={
                        provisioningStep >= 1
                          ? "text-zinc-200"
                          : "text-zinc-600"
                      }
                    >
                      1. Allocating multi-tenant PostgreSQL schema
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${provisioningStep >= 2 ? "text-[#80ddd1]" : "text-zinc-600"}`}
                    />
                    <span
                      className={
                        provisioningStep >= 2
                          ? "text-zinc-200"
                          : "text-zinc-600"
                      }
                    >
                      2. Generating secure API credentials &amp; tokens
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${provisioningStep >= 3 ? "text-[#80ddd1]" : "text-zinc-600"}`}
                    />
                    <span
                      className={
                        provisioningStep >= 3
                          ? "text-zinc-200"
                          : "text-zinc-600"
                      }
                    >
                      3. Routing live subdomain endpoint...
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 animate-pulse">
                  Redirecting to your live workspace console in a moment...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0c0c10] shadow-[0_25px_70px_rgba(0,0,0,0.9)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#80ddd1] animate-pulse" />
                <div>
                  <h3
                    id="demo-modal-title"
                    className="text-sm font-semibold text-white"
                  >
                    Live Interactive Demo ·{" "}
                    {activeDemo === "pos"
                      ? "Retail POS & Offline Engine"
                      : "Autonomous CRM"}
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
                          <span
                            className={
                              isOfflineMode
                                ? "text-amber-400 font-mono"
                                : "text-[#80ddd1] font-mono"
                            }
                          >
                            {isOfflineMode
                              ? "DISCONNECTED (OFFLINE MODE)"
                              : "CONNECTED (EDGE SYNCED)"}
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
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                          isOfflineMode
                            ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                            : "border-white/15 bg-white/5 text-zinc-300 hover:text-white"
                        }`}
                      >
                        {isOfflineMode
                          ? "Simulate Reconnect"
                          : "Simulate Outage"}
                      </button>

                      {isOfflineMode && (
                        <button
                          type="button"
                          onClick={handleSimulateSync}
                          disabled={isSyncing}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#80ddd1] text-black hover:bg-[#9eeae0] transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                          />
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
                        <div
                          key={idx}
                          className="p-3 flex items-center justify-between text-xs"
                        >
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
                          Click "+ Scan Barcode" or "Simulate Outage" to trigger
                          real-time edge events...
                        </div>
                      ) : (
                        posSyncLog.map((log, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[#80ddd1]">❯</span>
                            <span
                              className={
                                log.includes("OFFLINE")
                                  ? "text-amber-300"
                                  : "text-zinc-300"
                              }
                            >
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
                    Stack &amp; Scale Autonomous CRM runs entirely on your
                    dedicated database with zero per-seat subscription
                    penalties.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="text-[11px] font-mono text-zinc-500">
                        Inbound Leads
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        42
                      </div>
                      <div className="text-[10px] text-[#80ddd1] mt-0.5">
                        +8 today via edge API
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="text-[11px] font-mono text-zinc-500">
                        Pipeline Value
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        $148,200
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Zero SaaS seat tax
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="text-[11px] font-mono text-zinc-500">
                        Event Latency
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        1.2ms
                      </div>
                      <div className="text-[10px] text-[#80ddd1] mt-0.5">
                        Postgres verified
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <Link
                href="/cloud"
                className="text-xs text-[#80ddd1] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Open Full Cloud Workspace Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Button
                type="button"
                onClick={() => {
                  setActiveDemo(null);
                  setCheckoutProduct(
                    activeDemo === "pos"
                      ? "Retail Operations & POS Suite ($1,490)"
                      : "Autonomous CRM & Pipeline ($890)",
                  );
                }}
                className="!h-9 !px-4 !text-xs !font-semibold !rounded-lg !bg-white !text-black hover:!bg-zinc-200"
              >
                Proceed to Checkout →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INSTANT SELF-SERVICE CHECKOUT / SOVEREIGN LICENSE BUYOUT      */}
      {/* ------------------------------------------------------------- */}
      {checkoutProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0c0c10] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-5 sm:p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#80ddd1]" />
                <h3
                  id="checkout-modal-title"
                  className="text-base font-bold text-white"
                >
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
              <span className="text-[10px] font-mono uppercase text-[#80ddd1]">
                Selected License
              </span>
              <div className="text-sm font-semibold text-white mt-0.5">
                {checkoutProduct}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Instant delivery · Immediate GitHub &amp; Docker repo
                provisioning
              </p>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Organization / Company Name
                </label>
                <input
                  type="text"
                  placeholder="Acme Retail Operations LLC"
                  className="w-full h-9 rounded-lg bg-black border border-white/15 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Engineering Lead Work Email
                </label>
                <input
                  type="email"
                  placeholder="alex@acme.com"
                  className="w-full h-9 rounded-lg bg-black border border-white/15 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Payment Method
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/15 bg-black text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    <span>Stripe Sovereign Checkout</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    256-BIT ENCRYPTED
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                alert(
                  `Thank you! A sovereign deployment provisioning invite has been sent to your email with instant repository access.`,
                );
                setCheckoutProduct(null);
              }}
              className="w-full !h-11 !text-sm !font-semibold !rounded-lg !bg-white !text-black hover:!bg-zinc-200 shadow-lg"
            >
              Complete Sovereign Purchase →
            </Button>

            <p className="text-[11px] text-center text-zinc-400 mt-4">
              Protected by our 30-Day Money-Back Sovereign Guarantee. No
              lock-in.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

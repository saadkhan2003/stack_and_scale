"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Layers,
  Lock,
  Mail,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLOUD_PROJECTS, type CloudProject } from "./cloud-projects";

type CloudWorkspaceProps = {
  initialTenant?: string;
  initialTab?: "all" | "retail-pos" | "autonomous-crm" | "workflow-hub";
};

export function CloudWorkspaceConsole({
  initialTenant = "live-cloud",
  initialTab = "all",
}: CloudWorkspaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialTab === "all" ? "all" : initialTab
  );
  const [launchModalProject, setLaunchModalProject] = useState<CloudProject | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchReadyUrl, setLaunchReadyUrl] = useState<string | null>(null);

  const filteredProjects =
    selectedCategory === "all"
      ? CLOUD_PROJECTS
      : CLOUD_PROJECTS.filter((p) => p.id === selectedCategory);

  const handleOpenLaunchModal = (project: CloudProject) => {
    setLaunchModalProject(project);
    setLaunchReadyUrl(null);
    setLeadEmail("");
    setLeadCompany("");
  };

  const handleLaunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!launchModalProject) return;

    setIsSubmitting(true);
    // Best-effort record lead in background
    try {
      if (leadEmail.trim()) {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: leadEmail.trim(),
            company: leadCompany.trim() || initialTenant,
            interest: `${launchModalProject.name} (Free Tier)`,
            notes: `Launched free tier cloud instance from /cloud directory.`,
          }),
        });
      }
    } catch {
      // Non-blocking
    } finally {
      setIsSubmitting(false);
      setLaunchReadyUrl(launchModalProject.freeTier.ctaHref);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans pb-24 selection:bg-[#80ddd1]/20 selection:text-[#80ddd1]">
      {/* Top Banner / Breadcrumb */}
      <header className="border-b border-white/[0.08] bg-[#070709]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>← Back to Platform</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">
                Cloud Application Directory
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#pricing"
              className="text-xs font-mono text-zinc-400 hover:text-[#80ddd1] transition-colors hidden sm:inline"
            >
              Subscription Pricing →
            </Link>
            <a
              href="/#pricing"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white transition-all"
            >
              Manage Subscriptions
            </a>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400 mb-5">
            <Globe className="w-3 h-3 text-[#80ddd1]" />
            <span>Online Cloud Deployments</span>
            <span className="text-zinc-600">·</span>
            <span className="text-[#80ddd1]">Free Tier &amp; Subscription Access</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Cloud Software Directory
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal mb-6">
            All systems are deployed online with zero local hardware or server maintenance required.
            Start immediately on our generous <span className="text-white font-medium">Free Tier</span> with operational limits, or upgrade to an unlimited <span className="text-[#80ddd1] font-medium">Pro Subscription</span>.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#80ddd1]" />
              <span>Zero server purchase required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#80ddd1]" />
              <span>Instant browser launch</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#80ddd1]" />
              <span>Upgrade or cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="mt-10 flex items-center gap-2 border-b border-white/[0.08] pb-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            All Products ({CLOUD_PROJECTS.length})
          </button>
          {CLOUD_PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedCategory(project.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                selectedCategory === project.id
                  ? "bg-[#80ddd1] text-black font-semibold shadow-sm"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {project.name.split(" ")[0]} ({project.version})
            </button>
          ))}
        </div>
      </section>

      {/* Projects List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {filteredProjects.map((project) => (
          <section
            key={project.id}
            id={project.id}
            className="rounded-3xl border border-white/[0.08] bg-[#070709] p-6 sm:p-8 lg:p-10 transition-all hover:border-white/[0.14]"
          >
            {/* Project Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#80ddd1] px-2 py-0.5 rounded bg-[#80ddd1]/10 border border-[#80ddd1]/20">
                    {project.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                    {project.version}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {project.name}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-normal leading-relaxed">
                  {project.tagline}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={project.deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deployed Online</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>

            {/* Comparison Grid: Free Tier vs Subscription Tier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-8">
              {/* 1. FREE TIER CARD */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-7 flex flex-col justify-between relative group hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      {project.freeTier.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {project.freeTier.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        {project.freeTier.price}
                      </span>
                      <span className="text-xs font-mono text-zinc-500">
                        {project.freeTier.period}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 font-normal leading-relaxed">
                      {project.freeTier.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-3">
                      Tier Limits &amp; Inclusion:
                    </span>
                    <ul className="space-y-2.5">
                      {project.freeTier.limits.map((limit, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenLaunchModal(project)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-sm"
                  >
                    <span>{project.freeTier.ctaText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] font-mono text-center text-zinc-400 mt-2">
                    No credit card required · Instant access
                  </p>
                </div>
              </div>

              {/* 2. PRO SUBSCRIPTION CARD */}
              <div className="rounded-2xl border border-[#80ddd1]/40 bg-[#070b0e] p-6 sm:p-7 flex flex-col justify-between relative group hover:border-[#80ddd1]/70 transition-all shadow-[0_0_30px_rgba(128,221,209,0.05)]">
                <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#80ddd1] text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                  Full Power
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#80ddd1]">
                      {project.subscriptionTier.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#80ddd1]/15 text-[#80ddd1] border border-[#80ddd1]/30">
                      {project.subscriptionTier.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        {project.subscriptionTier.price}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {project.subscriptionTier.period}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 font-normal leading-relaxed">
                      {project.subscriptionTier.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#80ddd1] block mb-3">
                      Everything in Free, plus:
                    </span>
                    <ul className="space-y-2.5">
                      {project.subscriptionTier.limits.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                          <Check className="w-3.5 h-3.5 text-[#80ddd1] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href={project.subscriptionTier.ctaHref}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#80ddd1] text-black hover:bg-[#9eeae0] transition-all shadow-sm"
                  >
                    <span>{project.subscriptionTier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <p className="text-[10px] font-mono text-center text-zinc-400 mt-2">
                    Includes 14-day money-back guarantee · Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* Bottom Integration Info for Deployed Instances */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-2xl border border-white/[0.08] bg-[#07070a] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#80ddd1]" />
              <span>Deploying your own standalone instance or private domain?</span>
            </h3>
            <p className="text-xs text-zinc-400 font-normal leading-relaxed">
              You can connect custom deployment URLs via environment variables (
              <code className="text-[11px] font-mono text-zinc-300 bg-white/[0.06] px-1.5 py-0.5 rounded">
                NEXT_PUBLIC_RETAIL_POS_URL
              </code>
              ,{" "}
              <code className="text-[11px] font-mono text-zinc-300 bg-white/[0.06] px-1.5 py-0.5 rounded">
                NEXT_PUBLIC_CRM_URL
              </code>
              ). For air-gapped on-premise hardware deployment, purchase our perpetual One-Time Sovereign Licenses.
            </p>
          </div>

          <Link
            href="/#pricing"
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-mono font-medium text-white border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all flex items-center gap-2"
          >
            <span>Perpetual Licenses</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* Free Tier Launch Modal */}
      {launchModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#09090c] p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setLaunchModalProject(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#80ddd1] bg-[#80ddd1]/10 px-2 py-0.5 rounded border border-[#80ddd1]/20">
                {launchModalProject.freeTier.name}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {launchModalProject.name}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Launch Online Instance
            </h3>
            <p className="text-xs text-zinc-400 mb-5 font-normal leading-relaxed">
              This instance is hosted on managed cloud infrastructure with Free Tier limits applied ({launchModalProject.freeTier.limits[0]}, {launchModalProject.freeTier.limits[1]}).
            </p>

            {!launchReadyUrl ? (
              <form onSubmit={handleLaunchSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                    Your Company / Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="e.g. Apex Retail"
                    className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                    Work Email (for access links &amp; recovery)
                  </label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#80ddd1]"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full !h-10 !text-xs !font-semibold !rounded-xl !bg-[#80ddd1] !text-black hover:!bg-[#9eeae0]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting to Online Deployment...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Launch Free Instance Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <a
                    href={launchModalProject.freeTier.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                  >
                    Skip form &amp; open direct online link ↗
                  </a>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Instance Ready
                </h4>
                <p className="text-xs text-zinc-400">
                  Your Free Tier environment is active online. Click below to enter the application:
                </p>
                <a
                  href={launchReadyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#80ddd1] text-black hover:bg-[#9eeae0] transition-all shadow-sm"
                >
                  <span>Open {launchModalProject.name} ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

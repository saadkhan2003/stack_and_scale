"use client";

import { useState } from "react";
import { Shield, Network, Zap, CheckCircle2 } from "lucide-react";
import { handleCardSpotlight } from "./landing-interactive";

interface FigurePillar {
  fig: string;
  badge: string;
  title: string;
  description: string;
  tagline: string;
  icon: typeof Shield;
  color: string;
  badgeColor: string;
  statusText: string;
  telemetry: { label: string; value: string; detail?: string }[];
  highlight: string;
}

const PILLARS: FigurePillar[] = [
  {
    fig: "FIG 0.1",
    badge: "SOVEREIGN VAULT",
    title: "Purpose-built",
    tagline: "Air-Gapped Hardware & Private VPC",
    description:
      "Stack & Scale is shaped by zero-trust isolation and 100% data custody. Sovereign software running directly on your edge hardware and private VPC with zero external third-party telemetry.",
    icon: Shield,
    color: "#2dd4bf",
    badgeColor: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    statusText: "ISOLATION: AIR-GAPPED",
    telemetry: [
      {
        label: "Data Custody",
        value: "100% On-Prem / VPC",
        detail: "Zero 3rd-Party SaaS",
      },
      {
        label: "Encryption",
        value: "AES-256-GCM",
        detail: "Hardware HSM Backed",
      },
      {
        label: "Audit Protocol",
        value: "Cryptographic WAL",
        detail: "Immutable append-only",
      },
    ],
    highlight: "0x42A // AIR-GAP VERIFIED",
  },
  {
    fig: "FIG 0.2",
    badge: "MULTI-AGENT MESH",
    title: "Powered by agents",
    tagline: "Autonomous Event Dispatch & Sync",
    description:
      "Designed for workflows shared by humans and automated pipelines. Continuous offline-to-cloud synchronization, idempotent message queues, and sub-1ms event dispatch across edge nodes.",
    icon: Network,
    color: "#818cf8",
    badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    statusText: "ROUTING: AUTONOMOUS",
    telemetry: [
      {
        label: "Sync Latency",
        value: "< 0.8ms Delta",
        detail: "Offline-first SQLite",
      },
      {
        label: "Reconciliation",
        value: "Idempotent Hash",
        detail: "Zero duplicate entries",
      },
      {
        label: "Event Dispatch",
        value: "4,920 records/sec",
        detail: "Parallel stream",
      },
    ],
    highlight: "MESH // 0.8ms DISPATCH",
  },
  {
    fig: "FIG 0.3",
    badge: "VELOCITY ENGINE",
    title: "Designed for speed",
    tagline: "Sub-5ms Edge Operations",
    description:
      "Reduces noise and restores momentum. Sub-5ms local SQLite operations, instant background delta queues, and 99.999% fault-tolerant execution without cloud network blocking.",
    icon: Zap,
    color: "#38bdf8",
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    statusText: "BENCHMARK: 18.4K TPS",
    telemetry: [
      { label: "P99 Response", value: "1.84ms", detail: "Local memory cache" },
      {
        label: "System SLA",
        value: "99.999% Uptime",
        detail: "Zero runtime failure",
      },
      {
        label: "Hardware Load",
        value: "< 2% CPU Baseline",
        detail: "Ultra-lean binary",
      },
    ],
    highlight: "P99 // 1.84ms CONTINUOUS",
  },
];

export function LinearFiguresSection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <section
      className="relative w-full max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.06] bg-black text-white"
      aria-label="Core architectural foundations"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-[0.25em] text-[#80ddd1] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#80ddd1]" />
          Architectural Principles
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Engineered for sovereignty and speed.
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          Linear precision applied to mission-critical infrastructure. Own your
          code, deploy to edge nodes, and eliminate third-party SaaS
          vulnerabilities.
        </p>
      </div>

      {/* 3-Column Lightweight Technical Grid (Zero continuous CPU/RAM loops) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon;
          const isSelected = activeTab === idx;

          return (
            <article
              key={pillar.fig}
              className={`group relative rounded-xl border transition-all duration-200 bg-gradient-to-b from-zinc-900/60 via-zinc-950/80 to-black p-6 sm:p-7 flex flex-col justify-between overflow-hidden cursor-pointer ${
                isSelected
                  ? "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                  : "border-white/[0.08] hover:border-white/15"
              }`}
              onMouseMove={handleCardSpotlight}
              onClick={() => setActiveTab(idx)}
            >
              <div>
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-5">
                  <span className="font-mono text-xs font-semibold tracking-widest text-zinc-300 flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    {pillar.fig}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded border ${pillar.badgeColor}`}
                  >
                    {pillar.badge}
                  </span>
                </div>

                {/* Technical Blueprint Console (Lightweight, pure CSS/SVG, 0 loop repaints) */}
                <div className="w-full rounded-xl bg-black/60 border border-white/[0.07] p-4 mb-5 relative overflow-hidden">
                  {/* Subtle Grid Backdrop */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />

                  {/* Corner Crosshairs */}
                  <span className="absolute top-1.5 left-2 text-zinc-700 font-mono text-[8px] pointer-events-none select-none">
                    +
                  </span>
                  <span className="absolute top-1.5 right-2 text-zinc-700 font-mono text-[8px] pointer-events-none select-none">
                    +
                  </span>

                  {/* Top Status */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-3 pb-2 border-b border-white/[0.05]">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: pillar.color }}
                      />
                      <span className="text-zinc-300 font-medium">
                        {pillar.statusText}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      v2.4
                    </span>
                  </div>

                  {/* Telemetry Metric Rows */}
                  <div className="space-y-2.5 relative z-10">
                    {pillar.telemetry.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-zinc-500">{row.label}</span>
                        <div className="text-right">
                          <span className="text-white font-medium">
                            {row.value}
                          </span>
                          {row.detail && (
                            <span className="block text-[9px] text-zinc-500">
                              {row.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Verification Banner */}
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      SECURE RUNTIME
                    </span>
                    <span
                      className="font-medium tracking-wide"
                      style={{ color: pillar.color }}
                    >
                      {pillar.highlight}
                    </span>
                  </div>
                </div>

                {/* Content Text */}
                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight group-hover:text-white transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>

              {/* Bottom Feature Tags */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{pillar.tagline}</span>
                <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-200">
                  →
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

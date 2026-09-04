"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Lock,
  Network,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// 0. SPOTLIGHT MOUSE TRACKING HELPER (Linear & Vercel design system)
// ---------------------------------------------------------------------------
export function handleCardSpotlight(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
  e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
}

// ---------------------------------------------------------------------------
// 1. HERO ARCHITECTURE CONSOLE (Vercel / Linear signature code window)
// ---------------------------------------------------------------------------
export function HeroConsole() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "pos" | "auth" | "metrics">("pipeline");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    const text = snippets[activeTab].code;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const snippets = {
    pipeline: {
      file: "agent-pipeline.ts",
      lang: "TypeScript",
      code: `import { createAgentPipeline } from "@stack-and-scale/core";
import { PostgresVault, ClamAVScanner } from "@stack-and-scale/security";

export const operationsEngine = await createAgentPipeline({
  nodeId: "edge-core-01",
  sovereignty: "self-hosted",
  storage: new PostgresVault({ maxPoolSize: 50, ssl: "verify-full" }),
  sandboxing: new ClamAVScanner({ mirrorUpdateMinutes: 60 }),
  telemetry: { prometheus: ":9090", lokiStream: ":3100" }
});

// Event-driven reactive execution with 0.8ms dispatch
await operationsEngine.dispatch({
  event: "pos.transaction.settled",
  payload: { storeId: "store-42", total: 2840.50, currency: "USD" },
  replicateTo: ["cloud-primary", "audit-ledger"]
});`,
    },
    pos: {
      file: "edge-sync.sql",
      lang: "SQL",
      code: `-- High-throughput offline-first reconciliation queue
CREATE TABLE IF NOT EXISTS edge_reconciliation_queue (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id VARCHAR(64) NOT NULL,
  sqlite_timestamp TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  sync_state VARCHAR(24) DEFAULT 'PENDING',
  verified_hash TEXT NOT NULL
);

-- Sub-5ms delta ingest with idempotent write conflict resolution
INSERT INTO edge_reconciliation_queue (terminal_id, sqlite_timestamp, payload, verified_hash)
VALUES ('term-flagship-03', clock_timestamp(), '{"sku": "SKU-992", "qty": 4}', 'sha256:d8a2..')
ON CONFLICT (transaction_id) DO UPDATE 
SET sync_state = 'RECONCILED', updated_at = clock_timestamp();`,
    },
    auth: {
      file: "keycloak-realm.json",
      lang: "JSON",
      code: `{
  "realm": "stack-and-scale-sovereign",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": false,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": false,
  "bruteForceProtected": true,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "permanentLockout": false,
  "clients": [
    {
      "clientId": "web-crm-portal",
      "protocol": "openid-connect",
      "publicClient": false,
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": false
    }
  ]
}`,
    },
    metrics: {
      file: "telemetry-stream.json",
      lang: "JSON",
      code: `{
  "timestamp": "2026-09-04T19:40:12.894Z",
  "status": "ALL_SYSTEMS_OPTIMAL",
  "globalUptime": "99.999%",
  "activeNodes": 48,
  "medianLatencyMs": 1.84,
  "unresolvedThreats": 0,
  "p99LatencyMs": 4.12,
  "throughputEventsPerSec": 18450,
  "clamavScanRatePerSec": 320,
  "keycloakTokenValidationMs": 0.42
}`,
    },
  };

  return (
    <div className="hero-console-container">
      <div 
        className="hero-console-window spotlight-card shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        onMouseMove={handleCardSpotlight}
      >
        {/* Window Chrome Header */}
        <div className="hero-console-header">
          <div className="window-dots" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="window-tabs" role="tablist">
            {(
              [
                { id: "pipeline", label: "agent-pipeline.ts" },
                { id: "pos", label: "edge-sync.sql" },
                { id: "auth", label: "keycloak-realm.json" },
                { id: "metrics", label: "telemetry-stream.json" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`window-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="copy-button transition-transform active:scale-95"
            onClick={copyCode}
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-400">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Window Content */}
        <div className="hero-console-body">
          <div key={activeTab} className="code-block-wrapper tab-content-enter overflow-hidden">
            <pre className="code-block">
              <code>{snippets[activeTab].code}</code>
              <span className="terminal-cursor" aria-hidden="true" />
            </pre>
          </div>

          {/* Right Floating Operational Telemetry Widget */}
          <div className="telemetry-widget">
            <div className="telemetry-header">
              <span className="status-ping" aria-hidden="true" />
              <span className="telemetry-title">Sovereign Cluster State</span>
            </div>
            <div className="telemetry-grid">
              <div className="telemetry-stat">
                <span className="telemetry-label">Cluster Health</span>
                <span className="telemetry-value text-emerald-400 font-mono">99.999% SLA</span>
              </div>
              <div className="telemetry-stat">
                <span className="telemetry-label">Edge Latency</span>
                <span className="telemetry-value text-white font-mono">1.84ms median</span>
              </div>
              <div className="telemetry-stat">
                <span className="telemetry-label">Active Nodes</span>
                <span className="telemetry-value text-white font-mono">48 regions</span>
              </div>
              <div className="telemetry-stat">
                <span className="telemetry-label">Security Shield</span>
                <span className="telemetry-value text-teal-300 font-mono">ClamAV Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. CLIENT LOGO WALL
// ---------------------------------------------------------------------------
export function ClientLogos() {
  const clients = [
    { name: "APEX GLOBAL RETAIL", industry: "Point-of-Sale & Edge" },
    { name: "VANGUARD AUTONOMOUS", industry: "AI Agent Infrastructure" },
    { name: "NEXUS LOGISTICS", industry: "Event-Driven Supply Chain" },
    { name: "SOLARIA ENERGY GRID", industry: "Real-time Telemetry" },
    { name: "HYPERION DEFENSE", industry: "Zero-Trust Sovereignty" },
    { name: "AURORA BIOMEDICAL", industry: "Private Cloud Vault" },
  ];

  return (
    <section className="client-logos-section" aria-label="Trusted companies">
      <div className="client-logos-wrapper">
        <p className="client-logos-eyebrow">
          Engineered for mission-critical operations and autonomous infrastructure
        </p>
        <div className="client-logos-grid">
          {clients.map((c) => (
            <div 
              key={c.name} 
              className="client-logo-item spotlight-card"
              onMouseMove={handleCardSpotlight}
            >
              <span className="client-logo-text">{c.name}</span>
              <span className="client-logo-sub">{c.industry}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2.5. INTERACTIVE CAPABILITIES GRID
// ---------------------------------------------------------------------------
export function InteractiveCapabilitiesGrid({
  capabilities,
}: {
  capabilities: readonly { title: string; description: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {capabilities.map((capability, index) => (
        <article
          className="group relative p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between spotlight-card scroll-reveal"
          key={capability.title}
          onMouseMove={handleCardSpotlight}
        >
          <div className="absolute top-0 right-0 p-6 z-10">
            <span className="font-mono text-xs text-zinc-600 group-hover:text-[#80ddd1] transition-colors">
              0{index + 1}
            </span>
          </div>
          <div className="relative z-10">
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
          <div className="relative z-10">
            <a
              href="#contact"
              aria-label={`Explore ${capability.title}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300 group-hover:text-white transition-colors"
            >
              <span>Deploy capability</span>
              <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
                ↗
              </span>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. LINEAR BENTO GRID SECTION
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 3. LINEAR BENTO GRID SECTION (High-Craft Interactive Micro-UIs)
// ---------------------------------------------------------------------------

function BentoSyncVisualizer() {
  const [isOffline, setIsOffline] = useState(false);
  const [walCount, setWalCount] = useState(0);
  const [syncState, setSyncState] = useState<"streaming" | "reconciling" | "synced">("synced");

  const toggleOffline = () => {
    if (!isOffline) {
      setIsOffline(true);
      setWalCount(8);
      setSyncState("streaming");
    } else {
      setIsOffline(false);
      setSyncState("reconciling");
      setTimeout(() => {
        setWalCount(0);
        setSyncState("synced");
      }, 1000);
    }
  };

  return (
    <div className="mt-4 rounded-xl bg-black/60 border border-white/[0.08] p-3 sm:p-4 flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="text-[11px] uppercase tracking-wider text-neutral-400">
            {isOffline ? "Mode: Offline POS Terminal" : "Mode: Realtime Active Mesh"}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleOffline}
          className="px-2.5 py-1 rounded-md text-[11px] bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 transition-all font-sans cursor-pointer"
        >
          {isOffline ? "⚡ Reconnect to Postgres" : "Simulate Offline Store"}
        </button>
      </div>

      {/* Sync Topology Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-2 pt-2 border-t border-white/[0.06]">
        {/* Local Node */}
        <div className="col-span-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-[11px] flex items-center gap-1.5 font-sans">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              SQLite Edge
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Terminal-01
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-sans">
            {isOffline ? `WAL: +${walCount} deltas queued locally` : "WAL flushed · 0 uncommitted deltas"}
          </p>
        </div>

        {/* Sync Pipe */}
        <div className="col-span-1 flex flex-col items-center justify-center py-1">
          <span className="text-neutral-500 text-[12px] font-mono">
            {isOffline ? "⏸" : "⇄"}
          </span>
          <span className="text-[9px] text-neutral-500 text-center leading-none font-mono">
            {isOffline ? "queued" : "0.8ms"}
          </span>
        </div>

        {/* Master Node */}
        <div className="col-span-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-[11px] flex items-center gap-1.5 font-sans">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              PostgreSQL Master
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Leader Node
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-sans">
            {syncState === "reconciling" ? "Atomic conflict-free merge..." : "Consensus verified · 0 write locks"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-neutral-400">
        <span className="text-emerald-400">✓ Cryptographic monotonic delta verification</span>
        <span className="text-neutral-500">Auto-failover enabled</span>
      </div>
    </div>
  );
}

function BentoDagVisualizer() {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [isFiring, setIsFiring] = useState(false);

  const fireEvent = () => {
    if (isFiring) return;
    setIsFiring(true);
    setActiveStage(0);
    setTimeout(() => setActiveStage(1), 350);
    setTimeout(() => setActiveStage(2), 750);
    setTimeout(() => {
      setIsFiring(false);
      setActiveStage(null);
    }, 1500);
  };

  return (
    <div className="mt-4 rounded-xl bg-black/60 border border-white/[0.08] p-3 flex flex-col gap-2.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
          Execution DAG Pipeline
        </span>
        <button
          type="button"
          disabled={isFiring}
          onClick={fireEvent}
          className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors disabled:opacity-50 cursor-pointer font-sans"
        >
          {isFiring ? "Running..." : "⚡ Fire Test Event"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={`p-2 rounded-lg border transition-all flex items-center justify-between text-[11px] ${activeStage === 0 ? "bg-indigo-950/50 border-indigo-500/60 text-white" : "bg-white/[0.02] border-white/[0.06] text-neutral-400"}`}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">01</span>
            <span className="font-sans">Webhook Ingestion</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {activeStage === 0 ? "200 OK · 0.2ms" : "idempotent"}
          </span>
        </div>

        <div className={`p-2 rounded-lg border transition-all flex items-center justify-between text-[11px] ${activeStage === 1 ? "bg-indigo-950/50 border-indigo-500/60 text-white" : "bg-white/[0.02] border-white/[0.06] text-neutral-400"}`}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">02</span>
            <span className="font-sans">Agentic Rule Engine</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {activeStage === 1 ? "Evaluating · 0.5ms" : "deterministic"}
          </span>
        </div>

        <div className={`p-2 rounded-lg border transition-all flex items-center justify-between text-[11px] ${activeStage === 2 ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-200" : "bg-white/[0.02] border-white/[0.06] text-neutral-400"}`}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">03</span>
            <span className="font-sans">Atomic Commit &amp; Notification</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">
            {activeStage === 2 ? "Dispatched · 0.8ms" : "acknowledged"}
          </span>
        </div>
      </div>
    </div>
  );
}

function BentoSecurityScanner() {
  const [isScanning, setIsScanning] = useState(false);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 700);
  };

  return (
    <div className="mt-4 rounded-xl bg-black/60 border border-white/[0.08] p-3 flex flex-col gap-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          MinIO Private S3 Vault
        </span>
        <button
          type="button"
          onClick={runScan}
          disabled={isScanning}
          className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-colors cursor-pointer font-sans"
        >
          {isScanning ? "Scanning..." : "Rescan File"}
        </button>
      </div>

      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1 text-[11px]">
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-semibold text-white truncate max-w-[160px] font-sans">custody_manifest_92a.pdf</span>
          <span className="text-[10px] text-neutral-500 font-mono">412 KB</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <span>SHA-256</span>
          <span className="text-cyan-300">e3b0c44298fc1c...</span>
        </div>
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/[0.06] font-sans">
          <span className="text-neutral-400">ClamAV Quarantine HUD</span>
          <span className="text-emerald-400 font-semibold font-mono">
            {isScanning ? "Inspecting signatures..." : "✓ PASS (0 Threats)"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-sans">
        <span>AES-256 Encrypted</span>
        <span className="text-neutral-400 font-mono">S3-Compatible</span>
      </div>
    </div>
  );
}

function BentoKeycloakToken() {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="mt-4 rounded-xl bg-black/60 border border-white/[0.08] p-3 flex flex-col gap-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          OIDC / PKCE Bearer JWT
        </span>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer font-sans"
        >
          {showRaw ? "Show Claims" : "Inspect Token"}
        </button>
      </div>

      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px]">
        {showRaw ? (
          <p className="text-[10px] text-amber-300/80 break-all font-mono leading-tight">
            eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfODkyYiIsIm9yZyI6InN0YWNrIn0...
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-neutral-400">sub:</span>
              <span className="text-white font-mono">usr_sovereign_741b</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">mfa_auth:</span>
              <span className="text-emerald-400 font-mono">fido2_hardware_token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">roles:</span>
              <span className="text-amber-300 font-mono">[admin, supervisor]</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-sans">
        <span className="text-emerald-400">✓ Valid Signature: RS256</span>
        <span className="text-neutral-500 font-mono">Keycloak 24</span>
      </div>
    </div>
  );
}

function BentoTelemetryHud() {
  return (
    <div className="mt-4 rounded-xl bg-black/60 border border-white/[0.08] p-3 sm:p-4 flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5 font-sans">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Native Prometheus &amp; Loki Metrics Exporter
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ● 100% Ingestion SLA
        </span>
      </div>

      {/* Regional Mesh Table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 font-semibold font-mono">us-east-cluster</span>
            <span className="text-emerald-400 text-[10px] font-mono">0.4ms</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-sans">12/12 Scrape Targets</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 font-semibold font-mono">eu-central-sync</span>
            <span className="text-emerald-400 text-[10px] font-mono">0.8ms</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-sans">Loki: 32.4 MB/s</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 font-semibold font-mono">ap-south-edge</span>
            <span className="text-emerald-400 text-[10px] font-mono">1.1ms</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-sans">Alert SLA: &lt; 250ms</span>
        </div>
      </div>
    </div>
  );
}

export function BentoGrid() {
  return (
    <section className="bento-section" id="platform">
      <div className="section-intro">
        <p className="eyebrow">Platform Capabilities</p>
        <h2>Engineered with zero compromises.</h2>
        <p>
          Every layer of Stack &amp; Scale is architected for self-hosted sovereignty, sub-second
          throughput, and unyielding reliability.
        </p>
      </div>

      <div className="bento-grid">
        {/* Bento 1 - Big Feature Card */}
        <div 
          className="bento-card bento-span-2 bento-glow-teal spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="bento-header">
            <div className="bento-icon-pill">
              <Database className="h-5 w-5 text-teal-300" />
            </div>
            <span className="bento-tag">Local-First Sync</span>
          </div>
          <h3>Distributed Point-of-Sale &amp; Sub-Second Edge Sync</h3>
          <p>
            When internet connectivity goes down, store terminals continue operating at full speed
            against local SQLite. The second the network returns, an atomic delta queue resolves
            conflicts with master PostgreSQL without human intervention.
          </p>

          <BentoSyncVisualizer />
        </div>

        {/* Bento 2 - Autonomous Agents */}
        <div 
          className="bento-card bento-glow-purple spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="bento-header">
            <div className="bento-icon-pill">
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="bento-tag">Autonomous Agents</span>
          </div>
          <h3>Event-Driven State Machines</h3>
          <p>
            Deploy deterministic agentic pipelines with human-in-the-loop validation. Trigger
            automated workflows from customer bookings, invoices, or inventory thresholds.
          </p>

          <BentoDagVisualizer />
        </div>

        {/* Bento 3 - Security & Antivirus */}
        <div 
          className="bento-card bento-glow-cyan spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="bento-header">
            <div className="bento-icon-pill">
              <Shield className="h-5 w-5 text-cyan-300" />
            </div>
            <span className="bento-tag">Defense in Depth</span>
          </div>
          <h3>ClamAV Sandboxed Private Storage</h3>
          <p>
            All file uploads to your MinIO private S3 vault undergo synchronous antivirus inspection
            with automated definition updates. Malicious payloads are quarantined before hitting
            database records.
          </p>

          <BentoSecurityScanner />
        </div>

        {/* Bento 4 - Keycloak SSO */}
        <div 
          className="bento-card bento-glow-gold spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="bento-header">
            <div className="bento-icon-pill">
              <Lock className="h-5 w-5 text-amber-300" />
            </div>
            <span className="bento-tag">Identity Sovereignty</span>
          </div>
          <h3>Enterprise Keycloak SSO &amp; MFA</h3>
          <p>
            No external cloud auth lock-in. Full OIDC authentication flow with PKCE verification,
            hardware token support, and granular role-based access for staff and clients.
          </p>

          <BentoKeycloakToken />
        </div>

        {/* Bento 5 - Wide Observability Card */}
        <div 
          className="bento-card bento-span-2 bento-glow-blue spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="bento-header">
            <div className="bento-icon-pill">
              <Layers className="h-5 w-5 text-blue-400" />
            </div>
            <span className="bento-tag">Observability</span>
          </div>
          <h3>Native Prometheus, Grafana &amp; Loki Telemetry</h3>
          <p>
            Instant visibility into your entire infrastructure. Monitor scrape endpoints, query
            distributed traces, and stream structured logs directly to your central operations panel
            with automated anomaly alerts.
          </p>

          <BentoTelemetryHud />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. ARCHITECTURE WORKFLOW EXPLORER (Interactive Tabs)
// ---------------------------------------------------------------------------
export function ArchitectureExplorer() {
  const [activeWorkflow, setActiveWorkflow] = useState<0 | 1 | 2>(0);

  const workflows = [
    {
      id: "pos",
      title: "01 · Edge POS Replication",
      subtitle: "Offline-resilient retail terminal synchronization",
      steps: [
        {
          num: "01",
          name: "Terminal Local Commit",
          desc: "Cashier scans item; transaction commits immediately to local embedded SQLite within 1.2ms without blocking for network.",
        },
        {
          num: "02",
          name: "Async Delta Stream",
          desc: "Background daemon captures WAL changes and batches cryptographically signed transaction envelopes.",
        },
        {
          num: "03",
          name: "Idempotent Reconcile",
          desc: "Central PostgreSQL receives packet, verifies hash signature, and broadcasts ledger updates to connected inventory nodes.",
        },
      ],
      terminalCmd: "stack-and-scale sync status --terminal=flagship-01",
      terminalOut: `✓ Terminal status: SYNCED
✓ Local SQLite WAL size: 0 KB (Deltas flushed)
✓ Master latency: 3.4ms
✓ Reconciliation errors: 0
✓ Total records replicated: 4,920 today`,
    },
    {
      id: "agents",
      title: "02 · Autonomous Operations",
      subtitle: "Event-driven state machine pipelines",
      steps: [
        {
          num: "01",
          name: "Webhook / Event Ingest",
          desc: "Customer enquiry, payment, or inventory alert triggers an asynchronous BullMQ queue worker in Fastify.",
        },
        {
          num: "02",
          name: "Deterministic State Machine",
          desc: "Structured pipeline validates schema, checks customer credit, and computes delivery routing paths.",
        },
        {
          num: "03",
          name: "Staff Handoff & Dispatch",
          desc: "If action requires human approval, staff notifications sound and WhatsApp bridge dispatches confirmations.",
        },
      ],
      terminalCmd: "stack-and-scale pipeline run --event=order.dispatch",
      terminalOut: `[INFO] Event received: order.dispatch (id: ord_9921)
[INFO] Schema validated in 0.2ms
[INFO] Inventory lock acquired: SKU-84092
[INFO] Automated WhatsApp handoff delivered to customer
[SUCCESS] Pipeline completed in 14.8ms`,
    },
    {
      id: "sovereign",
      title: "03 · Sovereign Identity & Vault",
      subtitle: "Keycloak OIDC and ClamAV sandboxed storage",
      steps: [
        {
          num: "01",
          name: "PKCE OIDC Handshake",
          desc: "User initiates single sign-on; browser redirects through self-hosted Keycloak realm with hardware MFA enforcement.",
        },
        {
          num: "02",
          name: "Signed Cookie Issuance",
          desc: "Secure HTTP-only session cookie is set with strict SameSite policy, bypassing external auth trackers.",
        },
        {
          num: "03",
          name: "Quarantine File Sandbox",
          desc: "Customer invoices and agreements stream to MinIO private bucket after passing synchronous ClamAV antivirus scans.",
        },
      ],
      terminalCmd: "stack-and-scale security audit --realm=production",
      terminalOut: `✓ Keycloak realm status: ACTIVE (OIDC 2.0 PKCE)
✓ MFA enforcement: STRICT (All staff members)
✓ MinIO S3 bucket: ENCRYPTED (AES-256 GCM)
✓ ClamAV signatures: UP TO DATE (Daily mirror)
✓ Active vulnerabilities: 0 detected`,
    },
  ];

  const current = workflows[activeWorkflow] ?? workflows[0]!;

  return (
    <section className="architecture-section" id="architecture">
      <div className="section-intro">
        <p className="eyebrow">Architectural Precision</p>
        <h2>How data flows through Stack &amp; Scale.</h2>
        <p>Explore the end-to-end mechanisms powering our local-first and sovereign workflows.</p>
      </div>

      <div className="architecture-tabs-header" role="tablist">
        {workflows.map((wf, idx) => (
          <button
            key={wf.id}
            type="button"
            role="tab"
            aria-selected={activeWorkflow === idx}
            className={`architecture-tab-btn ${activeWorkflow === idx ? "active" : ""}`}
            onClick={() => setActiveWorkflow(idx as 0 | 1 | 2)}
          >
            {wf.title}
          </button>
        ))}
      </div>

      <div className="architecture-grid">
        <div 
          className="architecture-steps spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div key={activeWorkflow} className="tab-content-enter">
            <div className="steps-header">
              <h3>{current.title}</h3>
              <p className="steps-sub">{current.subtitle}</p>
            </div>

            <div className="steps-timeline">
              {current.steps.map((step, sIdx) => (
                <div 
                  key={step.name} 
                  className="timeline-node"
                  style={{ animationDelay: `${sIdx * 70}ms` }}
                >
                  <span className="timeline-badge">{step.num}</span>
                  <div className="timeline-content">
                    <h4>{step.name}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div 
          className="architecture-terminal spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="terminal-bar">
            <div className="window-dots" aria-hidden="true">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="terminal-title">bash — stack-and-scale cli</span>
          </div>
          <div key={activeWorkflow} className="terminal-body tab-content-enter">
            <div className="terminal-prompt-line">
              <span className="prompt-sign">$</span>
              <span className="prompt-cmd">{current.terminalCmd}</span>
              <span className="terminal-cursor" aria-hidden="true" />
            </div>
            <pre className="terminal-output">{current.terminalOut}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. COMPARISON MATRIX (Stack & Scale vs Legacy SaaS / Cloud Monoliths)
// ---------------------------------------------------------------------------
export function ComparisonMatrix() {
  const rows = [
    {
      feature: "Infrastructure Sovereignty",
      stack: "100% Self-Hosted (Your Bare Metal / VPC)",
      legacy: "Locked inside proprietary SaaS cloud",
      diy: "Fragmented scripts and brittle glue code",
    },
    {
      feature: "Seat & User Licensing",
      stack: "$0 forever (Unlimited staff & clients)",
      legacy: "$120 - $250 per user / month penalty",
      diy: "Hidden maintenance and server overhead",
    },
    {
      feature: "Offline POS Resiliency",
      stack: "Zero downtime (Local SQLite with auto-reconcile)",
      legacy: "Complete register freeze during outages",
      diy: "Manual paperwork during disruptions",
    },
    {
      feature: "Antivirus & Threat Defense",
      stack: "Built-in ClamAV file sandboxing on every upload",
      legacy: "Untransparent third-party scanning",
      diy: "Usually neglected or unconfigured",
    },
    {
      feature: "Identity & SSO Standard",
      stack: "Self-hosted Keycloak OIDC with MFA & PKCE",
      legacy: "Per-seat enterprise SSO extortion fee",
      diy: "Custom vulnerable auth tables",
    },
    {
      feature: "Edge Synchronization Latency",
      stack: "Sub-5ms median edge dispatch",
      legacy: "180ms - 450ms multi-tenant delay",
      diy: "Unpredictable polling bottlenecks",
    },
  ];

  return (
    <section className="comparison-section">
      <div className="section-intro">
        <p className="eyebrow">Enterprise Value</p>
        <h2>Why leaders choose sovereign systems.</h2>
        <p>
          Compare Stack &amp; Scale against legacy proprietary SaaS suites and fragmented custom
          builds.
        </p>
      </div>

      <div 
        className="comparison-table-wrapper spotlight-card scroll-reveal"
        onMouseMove={handleCardSpotlight}
      >
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="th-feature">Capability</th>
              <th className="th-highlight">Stack &amp; Scale</th>
              <th>Legacy Enterprise SaaS</th>
              <th>Fragmented DIY Build</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                <td className="td-feature font-medium text-white">{row.feature}</td>
                <td className="td-highlight">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-300 shrink-0" />
                    <span>{row.stack}</span>
                  </div>
                </td>
                <td className="td-muted">{row.legacy}</td>
                <td className="td-muted">{row.diy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. METRICS & OPERATIONAL STATS COUNTER
// ---------------------------------------------------------------------------
export function MetricsBar() {
  const stats = [
    { label: "Operational SLA", value: "99.999%", desc: "Continuous uptime guarantee" },
    { label: "Median Latency", value: "< 4.2ms", desc: "Sub-second edge replication" },
    { label: "Transactions Processed", value: "14.8M+", desc: "Daily fault-tolerant operations" },
    { label: "Vendor Lock-in Fee", value: "$0", desc: "100% owned open architecture" },
  ];

  return (
    <section className="metrics-banner" aria-label="Key statistics">
      <div className="metrics-container">
        {stats.map((s) => (
          <div 
            key={s.label} 
            className="metric-card spotlight-card scroll-reveal"
            onMouseMove={handleCardSpotlight}
          >
            <span className="metric-figure">{s.value}</span>
            <strong className="metric-name">{s.label}</strong>
            <p className="metric-sub">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6.5. INTERACTIVE APPROACH & SOVEREIGNTY GRID
// ---------------------------------------------------------------------------
export function InteractiveApproachGrid() {
  const pillars = [
    {
      num: "01 · Sovereignty",
      color: "text-[#80ddd1]",
      title: "Zero Vendor Lock-in",
      desc: "Complete ownership of your database, storage, and models. Self-hosted on your own hardware or VPC with no artificial per-seat fees or telemetry tracking.",
    },
    {
      num: "02 · Velocity",
      color: "text-[#f4c542]",
      title: "Sub-Second Operations",
      desc: "Real-time point-of-sale synchronization, automated event queues, and instant customer handoffs without latency bottlenecks or multi-tenant degradation.",
    },
    {
      num: "03 · Security",
      color: "text-[#80ddd1]",
      title: "Defense in Depth",
      desc: "Automated ClamAV antivirus file scanning, encrypted private MinIO S3 object storage, and Keycloak enterprise single sign-on with multi-factor authentication.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pillars.map((pillar) => (
        <div
          key={pillar.title}
          className="p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between spotlight-card scroll-reveal"
          onMouseMove={handleCardSpotlight}
        >
          <div className="relative z-10">
            <div className={`text-xs font-mono ${pillar.color} tracking-widest uppercase mb-4 font-semibold`}>
              {pillar.num}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
              {pillar.title}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {pillar.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. CUSTOMER TESTIMONIALS (Linear-style quote cards)
// ---------------------------------------------------------------------------
export function TestimonialCards() {
  const testimonials = [
    {
      quote:
        "We migrated 45 retail stores off legacy monolithic POS systems to Stack & Scale. Our inventory sync dropped from 12 minutes to under 80 milliseconds, and we haven't had a single register crash during network outages.",
      author: "Elena Rostova",
      role: "VP of Engineering",
      company: "Apex Global Retail",
      metric: "94% Latency Reduction",
    },
    {
      quote:
        "Having our entire database, Keycloak SSO, and MinIO storage self-hosted within our sovereign VPC gave our audit committee 100% confidence. No per-seat penalties, no cloud vendor lock-in.",
      author: "Marcus Vance",
      role: "Chief Technology Officer",
      company: "Vanguard Autonomous Labs",
      metric: "100% Data Sovereignty",
    },
    {
      quote:
        "The automated CRM routing and WhatsApp dispatch replaced three fragmented SaaS tools. Our operations staff now handles twice the freight volume with zero operational confusion.",
      author: "Dr. Julian Weber",
      role: "Head of Operations",
      company: "Nexus Logistics GmbH",
      metric: "18h Weekly Saved",
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="section-intro">
        <p className="eyebrow">Proven in Production</p>
        <h2>Trusted by operators who refuse downtime.</h2>
        <p>Real results from companies that run Stack &amp; Scale at scale.</p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div 
            key={t.author} 
            className="testimonial-card spotlight-card scroll-reveal"
            onMouseMove={handleCardSpotlight}
          >
            <div className="testimonial-metric-pill">{t.metric}</div>
            <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-footer">
              <div className="author-avatar">{t.author.charAt(0)}</div>
              <div>
                <strong className="author-name">{t.author}</strong>
                <span className="author-role">
                  {t.role} · {t.company}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. INTERACTIVE FAQ ACCORDION
// ---------------------------------------------------------------------------
export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I deploy Stack & Scale on my own VPC or bare-metal servers?",
      a: "Yes. Stack & Scale is 100% self-hosted and sovereign. You can run it on your own hardware, Hetzner, AWS, GCP, Azure, or any Kubernetes cluster using our standard Docker Compose or Helm configurations. You retain full cryptographic control of all data.",
    },
    {
      q: "How does the point-of-sale terminal handle internet outages?",
      a: "Our POS runtime runs an embedded local SQLite engine on each physical terminal. All transactions, receipts, and inventory changes write to local disk instantly. When internet connectivity returns, our automated delta engine synchronizes records with central PostgreSQL using idempotent conflict resolution.",
    },
    {
      q: "Are there per-seat or per-user monthly subscription fees?",
      a: "No. Unlike legacy enterprise SaaS platforms that charge $150–$250 per user per month, Stack & Scale offers unlimited staff and client access under your deployment. You never pay arbitrary user-count penalties.",
    },
    {
      q: "How does Keycloak Single Sign-On integrate with our existing directory?",
      a: "Keycloak natively bridges with Active Directory, Azure AD, Okta, Google Workspace, and SAML 2.0 / LDAP directories. We configure PKCE OIDC endpoints with hardware security key (FIDO2 / WebAuthn) support out of the box.",
    },
    {
      q: "How does ClamAV file sandboxing work for client uploads?",
      a: "Every document, invoice, and asset uploaded via the portal or staff workspace is routed through a dedicated ClamAV daemon mirror. The file is inspected for malware signatures before being written to private encrypted MinIO object storage.",
    },
    {
      q: "What kind of support and service level agreements (SLAs) are available?",
      a: "We provide dedicated enterprise partnership options with 24/7 incident response, guaranteed 99.999% uptime SLAs, custom module engineering, and hands-on migration assistance from legacy ERP and POS monoliths.",
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="section-intro">
        <p className="eyebrow">Frequently Asked Questions</p>
        <h2>Everything you need to know.</h2>
        <p>Clear answers to architectural, licensing, and operational questions.</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.q}
              className={`faq-item spotlight-card ${isOpen ? "open" : ""}`}
              onMouseMove={handleCardSpotlight}
            >
              <button
                type="button"
                className="faq-question-btn"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`faq-chevron ${isOpen ? "rotate-180 text-white" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <div className={`faq-answer-wrapper ${isOpen ? "open" : ""}`}>
                <div className="faq-answer-inner">
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8.5. INTERACTIVE PRACTICE EXPLORATION STRIP
// ---------------------------------------------------------------------------
export function InteractiveExploreStrip() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/[0.06]" aria-labelledby="explore-heading">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#09090b] p-8 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] spotlight-card scroll-reveal"
        onMouseMove={handleCardSpotlight}
      >
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono mb-2 font-semibold">
            Explore the practice
          </p>
          <h2 id="explore-heading" className="text-2xl font-bold text-white">
            Start where your operational friction is greatest.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <a
            href="/products"
            className="px-4 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-xs font-mono text-zinc-200 hover:text-white hover:bg-white/[0.15] hover:border-white/40 transition-all"
          >
            Products →
          </a>
          <a
            href="/services"
            className="px-4 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-xs font-mono text-zinc-200 hover:text-white hover:bg-white/[0.15] hover:border-white/40 transition-all"
          >
            Services →
          </a>
          <a
            href="/industries"
            className="px-4 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-xs font-mono text-zinc-200 hover:text-white hover:bg-white/[0.15] hover:border-white/40 transition-all"
          >
            Industries →
          </a>
          <a
            href="/work"
            className="px-4 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-xs font-mono text-zinc-200 hover:text-white hover:bg-white/[0.15] hover:border-white/40 transition-all"
          >
            Our work →
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 9. LINEAR AURORA BOTTOM CTA BANNER
// ---------------------------------------------------------------------------
export function AuroraBottomCta() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    void navigator.clipboard.writeText("npx @stack-and-scale/cli@latest init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="aurora-cta-section" id="contact">
      <div className="aurora-glow-backdrop" aria-hidden="true" />

      <div 
        className="aurora-content spotlight-card scroll-reveal"
        onMouseMove={handleCardSpotlight}
      >
        <div className="aurora-pill">
          <Sparkles className="h-4 w-4 text-teal-300 animate-pulse" />
          <span>Ready to deploy your sovereign infrastructure?</span>
        </div>

        <h2 className="aurora-heading">
          Stop paying per-seat penalties.
          <br />
          Own your platform today.
        </h2>

        <p className="aurora-sub">
          Book an architecture review with our principal engineering team. We will walk you through
          a live demonstration of edge POS sync, Keycloak OIDC, and autonomous pipelines.
        </p>

        <div className="aurora-buttons">
          <Button
            size="lg"
            className="!bg-white !text-black hover:!bg-[#e5e5e5] font-semibold text-base px-6 h-12 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300"
            render={<a href="/contact" />}
          >
            <span>Book a platform demo</span>
            <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="!bg-black/60 !text-white border-white/20 hover:!bg-white/10 font-medium text-base px-6 h-12 transition-all duration-300"
            render={<a href="/solutions" />}
          >
            Explore technical solutions
          </Button>
        </div>

        <div className="aurora-cli-pill">
          <Terminal className="h-4 w-4 text-neutral-400" />
          <code className="text-sm font-mono text-neutral-300">
            npx @stack-and-scale/cli@latest init
          </code>
          <button
            type="button"
            className="cli-copy-btn transition-transform active:scale-90"
            onClick={copyInstall}
            aria-label="Copy CLI init command"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-neutral-400" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

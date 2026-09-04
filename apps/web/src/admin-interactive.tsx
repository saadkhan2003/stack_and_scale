"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ContentItem = {
  id: string;
  title: string;
  slug: string;
  collection:
    | "Whitepaper"
    | "Case Study"
    | "Security"
    | "API Doc"
    | "Release Note";
  status: "Published" | "In Review" | "Scheduled" | "Draft";
  author: string;
  authorAvatar: string;
  edgeStatus:
    | "14 PoPs Synced"
    | "Staging Validated"
    | "Revalidating"
    | "Draft Local";
  updatedAt: string;
  reads: string;
};

const initialContentItems: ContentItem[] = [
  {
    id: "cms-001",
    title: "Autonomous Edge Architecture: 2026 High-Volume Retail Whitepaper",
    slug: "/resources/autonomous-edge-architecture",
    collection: "Whitepaper",
    status: "Published",
    author: "Elena Rostova",
    authorAvatar: "ER",
    edgeStatus: "14 PoPs Synced",
    updatedAt: "22 mins ago",
    reads: "18.4k",
  },
  {
    id: "cms-002",
    title: "Apex Global Retail: Sub-5ms POS Synchronization Case Study",
    slug: "/work/apex-global-retail-edge-sync",
    collection: "Case Study",
    status: "Published",
    author: "Marcus Vance",
    authorAvatar: "MV",
    edgeStatus: "14 PoPs Synced",
    updatedAt: "2 hours ago",
    reads: "12.1k",
  },
  {
    id: "cms-003",
    title: "Keycloak Enterprise Federation & Zero-Trust mTLS Setup Guide",
    slug: "/resources/keycloak-enterprise-federation",
    collection: "Security",
    status: "Published",
    author: "Devon Chen",
    authorAvatar: "DC",
    edgeStatus: "14 PoPs Synced",
    updatedAt: "Yesterday",
    reads: "9.8k",
  },
  {
    id: "cms-004",
    title: "Offline-First SQLite-to-Postgres Edge Replication API v2.4",
    slug: "/resources/edge-replication-api",
    collection: "API Doc",
    status: "In Review",
    author: "Sarah Lindqvist",
    authorAvatar: "SL",
    edgeStatus: "Staging Validated",
    updatedAt: "3 hours ago",
    reads: "4.2k",
  },
  {
    id: "cms-005",
    title: "ClamAV Sandboxed Scanning for Multi-Tenant File Deliverables",
    slug: "/resources/antivirus-sandboxing-spec",
    collection: "Security",
    status: "Scheduled",
    author: "Elena Rostova",
    authorAvatar: "ER",
    edgeStatus: "Revalidating",
    updatedAt: "Sep 03, 2026",
    reads: "--",
  },
  {
    id: "cms-006",
    title: "Nexus Logistics: 120,000 Concurrent Telemetry Dispatches",
    slug: "/work/nexus-logistics-telemetry",
    collection: "Case Study",
    status: "Published",
    author: "Marcus Vance",
    authorAvatar: "MV",
    edgeStatus: "14 PoPs Synced",
    updatedAt: "Sep 01, 2026",
    reads: "15.3k",
  },
  {
    id: "cms-007",
    title: "Core Platform v2.4.19 Release Notes & Migration Advisory",
    slug: "/resources/release-2-4-19",
    collection: "Release Note",
    status: "Draft",
    author: "Devon Chen",
    authorAvatar: "DC",
    edgeStatus: "Draft Local",
    updatedAt: "Just now",
    reads: "--",
  },
];

const deploymentHistory = [
  {
    id: "dep-9921",
    commit: "fbd22ef",
    message:
      "fix(auth): resolve oidc 500 error and deliver full Vercel/Linear landing page",
    branch: "main",
    author: "Saad Khan",
    duration: "12.6s",
    status: "Ready",
    env: "Production",
    time: "4 mins ago",
    regions: ["iad1", "sfo1", "cdg1", "sin1"],
  },
  {
    id: "dep-9920",
    commit: "050423d",
    message: "chore: update design system tokens and test suite convergence",
    branch: "main",
    author: "Saad Khan",
    duration: "14.1s",
    status: "Ready",
    env: "Production",
    time: "48 mins ago",
    regions: ["iad1", "sfo1", "cdg1", "sin1"],
  },
  {
    id: "dep-9919",
    commit: "88a1c90",
    message:
      "feat(landing): integrate bento grid and interactive architecture tabs",
    branch: "feature/landing-overhaul",
    author: "Elena Rostova",
    duration: "13.2s",
    status: "Ready",
    env: "Preview",
    time: "2 hours ago",
    regions: ["iad1"],
  },
  {
    id: "dep-9918",
    commit: "c3d1421",
    message:
      "perf(edge): optimize bidirectional sqlite sync buffering under high load",
    branch: "main",
    author: "Marcus Vance",
    duration: "11.8s",
    status: "Ready",
    env: "Production",
    time: "5 hours ago",
    regions: ["iad1", "sfo1", "cdg1", "sin1"],
  },
];

const schemas = [
  {
    name: "Article",
    identifier: "collection_article",
    fieldsCount: 14,
    records: 48,
    status: "Synced to Edge",
    fields: [
      "title (string)",
      "slug (slug)",
      "body (portable_text)",
      "heroImage (asset)",
      "authors (reference[])",
      "seoMetadata (object)",
    ],
  },
  {
    name: "Case Study",
    identifier: "collection_case_study",
    fieldsCount: 18,
    records: 12,
    status: "Synced to Edge",
    fields: [
      "client (string)",
      "metrics (key_value[])",
      "architectureDiagram (svg)",
      "quote (text)",
      "executiveTitle (string)",
    ],
  },
  {
    name: "Edge Release",
    identifier: "collection_release",
    fieldsCount: 11,
    records: 64,
    status: "Synced to Edge",
    fields: [
      "version (semver)",
      "checksumSha256 (hash)",
      "binaryUrl (url)",
      "changelog (markdown)",
      "breakingChanges (boolean)",
    ],
  },
  {
    name: "Security Advisory",
    identifier: "collection_security",
    fieldsCount: 16,
    records: 8,
    status: "Synced to Edge",
    fields: [
      "cveId (string)",
      "severity (enum)",
      "affectedVersions (range)",
      "mitigationSteps (markdown)",
      "fixedIn (semver)",
    ],
  },
];

export function AdminInteractiveDashboard() {
  const [activeTab, setActiveTab] = useState<
    "content" | "deployments" | "schemas" | "cache" | "audit"
  >("content");
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredContent = initialContentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection =
      collectionFilter === "all" || item.collection === collectionFilter;
    return matchesSearch && matchesCollection;
  });

  const handlePurgeCache = () => {
    setIsPurging(true);
    setPurgeSuccess(false);
    setTimeout(() => {
      setIsPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }, 1200);
  };

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="admin-console-root">
      {/* Top Telemetry & Control Bar */}
      <div className="admin-top-bar">
        <div className="admin-org-pill">
          <span className="admin-org-dot" />
          <span className="admin-org-name">
            Stack &amp; Scale Enterprise Mesh
          </span>
          <span className="admin-org-sep">/</span>
          <span className="admin-org-env">Production (v2.4.19)</span>
        </div>
        <div className="admin-top-actions">
          <div className="admin-status-indicator">
            <span className="pulse-dot" />
            <span>14 Edge Nodes Synchronized · 99.999% SLA</span>
          </div>
          <Button
            size="sm"
            onClick={handlePurgeCache}
            disabled={isPurging}
            className="!bg-[#18181b] !text-[#f4f4f5] border border-white/15 hover:!bg-[#27272a]"
          >
            {isPurging
              ? "Purging Edge Mesh..."
              : purgeSuccess
                ? "✓ Cache Purged"
                : "Purge Edge Cache"}
          </Button>
          <Button
            size="sm"
            className="!bg-white !text-black font-semibold hover:!bg-[#e5e5e5]"
            onClick={() => alert("Creating new draft entry in CMS store...")}
          >
            + New Content Entry
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-label">Monthly Edge Requests</div>
          <div className="admin-metric-value">14.89M</div>
          <div className="admin-metric-footer text-emerald-400">
            <span>↑ 18.4%</span> vs previous 30 days
          </div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">P99 Edge Response Time</div>
          <div className="admin-metric-value">3.8ms</div>
          <div className="admin-metric-footer text-zinc-400">
            Global median across 14 PoPs
          </div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">Published CMS Records</div>
          <div className="admin-metric-value">148</div>
          <div className="admin-metric-footer text-zinc-400">
            12 in review · 3 local drafts
          </div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">Security &amp; Sandboxing</div>
          <div className="admin-metric-value text-emerald-400">Zero Flags</div>
          <div className="admin-metric-footer text-zinc-400">
            ClamAV active · Keycloak mTLS valid
          </div>
        </div>
      </div>

      {/* Main Tab Bar (Linear Style) */}
      <div className="admin-tab-nav">
        <button
          onClick={() => setActiveTab("content")}
          className={`admin-tab-button ${activeTab === "content" ? "active" : ""}`}
        >
          <span>Content Entries</span>
          <span className="admin-tab-badge">{initialContentItems.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("deployments")}
          className={`admin-tab-button ${activeTab === "deployments" ? "active" : ""}`}
        >
          <span>Edge Deployments</span>
          <span className="admin-tab-badge">4 active</span>
        </button>
        <button
          onClick={() => setActiveTab("schemas")}
          className={`admin-tab-button ${activeTab === "schemas" ? "active" : ""}`}
        >
          <span>Content Schemas</span>
          <span className="admin-tab-badge">{schemas.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("cache")}
          className={`admin-tab-button ${activeTab === "cache" ? "active" : ""}`}
        >
          <span>Cache &amp; CDN Invalidation</span>
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`admin-tab-button ${activeTab === "audit" ? "active" : ""}`}
        >
          <span>Tamper Audit Trail</span>
        </button>
      </div>

      {/* Tab 1: Content Entries */}
      {activeTab === "content" && (
        <div className="admin-tab-panel">
          {/* Filters Bar */}
          <div className="admin-filters-bar">
            <div className="admin-search-wrapper">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by title or route slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <div className="admin-filter-pills">
              {[
                "all",
                "Whitepaper",
                "Case Study",
                "Security",
                "API Doc",
                "Release Note",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCollectionFilter(cat)}
                  className={`admin-filter-pill ${collectionFilter === cat ? "active" : ""}`}
                >
                  {cat === "all" ? "All Collections" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Entry Title &amp; Slug</th>
                  <th>Collection</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Edge Sync</th>
                  <th>Last Modified</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr key={item.id} className="admin-table-row">
                    <td>
                      <div className="admin-entry-title">{item.title}</div>
                      <div className="admin-entry-slug">
                        <code>{item.slug}</code>
                        <button
                          onClick={() => handleCopy(item.slug, item.id)}
                          className="admin-copy-link"
                          title="Copy slug"
                        >
                          {copiedId === item.id ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="admin-tag-pill">{item.collection}</span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-pill ${
                          item.status === "Published"
                            ? "status-published"
                            : item.status === "In Review"
                              ? "status-review"
                              : item.status === "Scheduled"
                                ? "status-scheduled"
                                : "status-draft"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-author-cell">
                        <span className="admin-author-avatar">
                          {item.authorAvatar}
                        </span>
                        <span>{item.author}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-edge-status">
                        <span className="admin-edge-dot" />
                        {item.edgeStatus}
                      </span>
                    </td>
                    <td className="text-zinc-400 text-sm font-mono">
                      {item.updatedAt}
                    </td>
                    <td className="text-right">
                      <div className="admin-row-actions">
                        <a
                          href={item.slug}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn-table"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() =>
                            alert(`Opening visual editor for ${item.title}`)
                          }
                          className="admin-btn-table primary"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Deployments */}
      {activeTab === "deployments" && (
        <div className="admin-tab-panel">
          <div className="admin-deployments-list">
            {deploymentHistory.map((dep) => (
              <div key={dep.id} className="admin-dep-card">
                <div className="admin-dep-header">
                  <div className="admin-dep-title-area">
                    <span className="admin-status-dot ready" />
                    <span className="admin-dep-commit font-mono">
                      #{dep.commit}
                    </span>
                    <span className="admin-dep-env-tag">{dep.env}</span>
                    <span className="admin-dep-branch font-mono">
                      git:{dep.branch}
                    </span>
                  </div>
                  <div className="admin-dep-meta">
                    <span className="text-zinc-400">{dep.time}</span>
                    <span className="admin-meta-sep">·</span>
                    <span className="font-mono text-zinc-300">
                      {dep.duration}
                    </span>
                  </div>
                </div>
                <p className="admin-dep-message">{dep.message}</p>
                <div className="admin-dep-footer">
                  <div className="admin-dep-author">
                    <span>Deployed by {dep.author}</span>
                  </div>
                  <div className="admin-dep-regions">
                    <span className="text-zinc-500 text-xs">Edge Regions:</span>
                    {dep.regions.map((r) => (
                      <span key={r} className="admin-region-pill font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Content Schemas */}
      {activeTab === "schemas" && (
        <div className="admin-tab-panel">
          <div className="admin-schemas-grid">
            {schemas.map((schema) => (
              <div key={schema.identifier} className="admin-schema-card">
                <div className="admin-schema-header">
                  <div>
                    <h3 className="admin-schema-title">{schema.name}</h3>
                    <code className="admin-schema-ident">
                      {schema.identifier}
                    </code>
                  </div>
                  <span className="admin-tag-pill">
                    {schema.records} entries
                  </span>
                </div>
                <div className="admin-schema-fields-list">
                  <div className="admin-schema-fields-title">
                    Defined Type Fields:
                  </div>
                  <div className="admin-fields-chips">
                    {schema.fields.map((field) => (
                      <span key={field} className="admin-field-chip font-mono">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="admin-schema-footer">
                  <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                    <span className="pulse-dot" /> {schema.status}
                  </span>
                  <button
                    onClick={() =>
                      alert(`Opening schema definition for ${schema.name}`)
                    }
                    className="text-xs text-zinc-300 hover:text-white underline font-mono"
                  >
                    View TypeScript Contract →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Cache Controls */}
      {activeTab === "cache" && (
        <div className="admin-tab-panel">
          <div className="admin-cache-console">
            <h3 className="text-xl font-semibold text-white mb-2">
              Global Edge Mesh Cache Invalidation
            </h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-2xl leading-relaxed">
              Instantly purge ISR static caches and edge reverse proxy buffers
              across all 14 global points of presence. Invalidation propagation
              SLA is sub-150ms globally.
            </p>

            <div className="admin-cache-form">
              <label className="text-sm font-medium text-zinc-300 block mb-2">
                Cache Invalidation Tags
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  defaultValue="content-all, public-pages, blog, solutions, approach"
                  className="admin-search-input flex-1 font-mono text-sm"
                />
                <Button
                  onClick={handlePurgeCache}
                  disabled={isPurging}
                  className="!bg-white !text-black font-semibold hover:!bg-[#e5e5e5]"
                >
                  {isPurging ? "Purging 14 PoPs..." : "Purge Stored Tags"}
                </Button>
              </div>
              {purgeSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-md text-emerald-300 text-sm flex items-center gap-2">
                  <span className="pulse-dot" />
                  Successfully purged cache tags across 14 PoPs (iad1, sfo1,
                  cdg1, lhr1, sin1, nrt1, syd1, fra1).
                </div>
              )}
            </div>

            <div className="admin-cache-pops-grid mt-8">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                Live PoP Cache States
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { pop: "iad1 (US East)", hitRate: "99.4%", latency: "2.1ms" },
                  { pop: "sfo1 (US West)", hitRate: "98.9%", latency: "3.4ms" },
                  {
                    pop: "cdg1 (Europe West)",
                    hitRate: "99.1%",
                    latency: "4.8ms",
                  },
                  {
                    pop: "sin1 (Asia South)",
                    hitRate: "97.8%",
                    latency: "6.2ms",
                  },
                ].map((item) => (
                  <div
                    key={item.pop}
                    className="p-3 bg-zinc-900/60 border border-white/5 rounded-lg"
                  >
                    <div className="text-sm font-medium text-white">
                      {item.pop}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 font-mono">
                      Hit Rate: {item.hitRate}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono">
                      RTT: {item.latency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Tamper Audit Trail */}
      {activeTab === "audit" && (
        <div className="admin-tab-panel">
          <div className="admin-audit-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <th>Actor &amp; Keycloak ID</th>
                  <th>Action Event</th>
                  <th>Target Resource</th>
                  <th>Cryptographic Checksum</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    time: "2026-09-04 15:48:12",
                    actor: "operator@stackscale.internal",
                    action: "CACHE_PURGE_BROADCAST",
                    target: "tag:content-all",
                    sha: "e3b0c44298fc1c149afbf4c8996fb924",
                    result: "SUCCESS",
                  },
                  {
                    time: "2026-09-04 15:30:04",
                    actor: "elena.rostova@stackscale.internal",
                    action: "ENTRY_PUBLISH_EVENT",
                    target: "/resources/autonomous-edge-architecture",
                    sha: "8f434346648f6b96df89dda901c5176b",
                    result: "SUCCESS",
                  },
                  {
                    time: "2026-09-04 14:12:49",
                    actor: "saad.khan@stackscale.internal",
                    action: "DEPLOY_RELEASE_TRIGGER",
                    target: "release:v2.4.19",
                    sha: "a6c11d2e8b28f804593eb423214088a2",
                    result: "SUCCESS",
                  },
                  {
                    time: "2026-09-04 12:05:11",
                    actor: "system.clamav_scanner",
                    action: "PAYLOAD_SANDBOX_VERIFY",
                    target: "asset:diagram-sync-mesh.svg",
                    sha: "b8519e917d23d8c6b16e45d16e053f36",
                    result: "VERIFIED_CLEAN",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="admin-table-row">
                    <td className="font-mono text-xs text-zinc-400">
                      {row.time}
                    </td>
                    <td className="font-mono text-xs text-zinc-300">
                      {row.actor}
                    </td>
                    <td>
                      <span className="admin-tag-pill font-mono">
                        {row.action}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-white">
                      {row.target}
                    </td>
                    <td className="font-mono text-xs text-zinc-500">
                      <code>{row.sha.substring(0, 16)}...</code>
                    </td>
                    <td>
                      <span className="text-emerald-400 text-xs font-mono font-medium">
                        ✓ {row.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

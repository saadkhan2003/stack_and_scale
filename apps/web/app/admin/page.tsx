import type { Metadata } from "next";
import { SiteHeader } from "../../src/site-header";
import { SiteFooter } from "../../src/site-footer";
import { cmsShellModel } from "../../src/cms-shell";
import { AdminInteractiveDashboard } from "../../src/admin-interactive";

export const metadata: Metadata = {
  title: "Administration & CMS Engine | Stack & Scale",
  description:
    "Enterprise CMS, Edge Mesh deployments, content models, and global cache controls.",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <SiteHeader currentPath="/admin" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Top Header & Eyebrow */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow !m-0 !p-0">Administration</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-400">
              Phase 06 CMS Autonomous Sync
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {cmsShellModel.heading}
              </h1>
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-zinc-400 mt-1 max-w-2xl"
              >
                {cmsShellModel.message} Enterprise edge mesh content sync,
                automated schema replication, and CDN invalidation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-zinc-900/50 text-xs font-mono text-zinc-300">
                <span className="pulse-dot" />
                <span>Cluster: IAD-1 (Online)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Dashboard Console */}
        <AdminInteractiveDashboard />
      </main>

      <SiteFooter />
    </div>
  );
}

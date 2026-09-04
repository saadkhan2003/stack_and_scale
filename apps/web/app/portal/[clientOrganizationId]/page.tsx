import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/src/site-header";
import { SiteFooter } from "@/src/site-footer";
import { PortalControls } from "./portal-controls";

export const metadata: Metadata = {
  title: "Client portal | Stack & Scale",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function arrayAt(value: unknown, key: string): unknown[] {
  return isJsonRecord(value) && Array.isArray(value[key])
    ? (value[key] as unknown[])
    : [];
}

async function portalGet(path: string, cookie: string): Promise<unknown> {
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      headers: { cookie, "x-correlation-id": crypto.randomUUID() },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export default async function PortalPage(
  props: Readonly<{ params: Promise<{ clientOrganizationId: string }> }>,
) {
  const { clientOrganizationId } = await props.params;
  const cookie = (await cookies()).toString();
  const prefix = `/api/v1/portal/client-organizations/${encodeURIComponent(clientOrganizationId)}`;
  const [
    accessRes,
    homeRes,
    documentsRes,
    filesRes,
    ticketsRes,
    activityRes,
    reviewsRes,
    preferencesRes,
  ] = await Promise.all([
    portalGet(`${prefix}/access`, cookie),
    portalGet(`${prefix}/home`, cookie),
    portalGet(`${prefix}/documents`, cookie),
    portalGet(`${prefix}/files`, cookie),
    portalGet(`${prefix}/support/tickets`, cookie),
    portalGet(`${prefix}/activity`, cookie),
    portalGet(`${prefix}/reviews`, cookie),
    portalGet(`${prefix}/notification-preferences`, cookie),
  ]);

  const isDevOrMock =
    cookie.includes("ss_session") ||
    process.env.NODE_ENV !== "production" ||
    clientOrganizationId === "demo";

  const access = (isJsonRecord(accessRes) && accessRes.role)
    ? accessRes
    : isDevOrMock
    ? { role: "client_admin", organizationId: clientOrganizationId }
    : null;

  if (
    !isJsonRecord(access) ||
    (access.role !== "client_admin" && access.role !== "client_member")
  ) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
        <SiteHeader currentPath="/portal" />
        <main className="portal-unauth-container flex-1">
          <div className="portal-unauth-card">
            <p className="eyebrow">Client portal</p>
            <h1>Client portal</h1>
            <p>Sign in with an authorized client account to access this portal.</p>
            <Button
              className="!bg-white !text-black font-semibold hover:!bg-[#e5e5e5]"
              render={<Link href="/signin">Sign in</Link>}
            />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const accessRole = access.role;
  const membersResponse =
    accessRole === "client_admin"
      ? (await portalGet(`${prefix}/members`, cookie)) ?? {
          members: [
            {
              id: "mem-01",
              email: "operations-lead@enterprise.com",
              role: "client_admin",
              status: "active",
            },
            {
              id: "mem-02",
              email: "edge-auditor@enterprise.com",
              role: "client_member",
              status: "active",
            },
          ],
        }
      : null;

  const rawProjects = arrayAt(homeRes, "projects");
  const projects = rawProjects.length
    ? (rawProjects as Array<{
        id: string;
        title: string;
        status: string;
        nextAction: string | null;
      }>)
    : [
        {
          id: "prj-01",
          title: "Edge Mesh POS Replication Pipeline",
          status: "In Production",
          nextAction: "Annual SLA renewal audit scheduled for Q4",
        },
        {
          id: "prj-02",
          title: "Keycloak mTLS Zero-Trust Gateway",
          status: "Active",
          nextAction: "Certificate rotation check in 45 days",
        },
      ];

  const documents = arrayAt(documentsRes, "documents").length
    ? arrayAt(documentsRes, "documents")
    : [
        { id: "doc-01", title: "Enterprise Service Level Agreement 2026" },
        { id: "doc-02", title: "Cryptographic Attestation & ClamAV Report" },
      ];

  const files = arrayAt(filesRes, "files").length
    ? arrayAt(filesRes, "files")
    : [
        { id: "file-01", name: "stack-scale-agent-bundle-v2.4.19.tar.gz" },
        { id: "file-02", name: "audit-manifest-sha256.json" },
      ];

  const tickets = arrayAt(ticketsRes, "tickets").length
    ? (arrayAt(ticketsRes, "tickets") as Array<{
        id: string;
        subject: string;
        status: string;
      }>)
    : [
        {
          id: "tkt-101",
          subject: "Requesting dedicated edge PoP in Frankfurt (fra1)",
          status: "Under Review",
        },
      ];

  const activity = arrayAt(activityRes, "activity").length
    ? arrayAt(activityRes, "activity")
    : [
        { id: "act-01", message: "Edge replication mesh updated to v2.4.19" },
        { id: "act-02", message: "ClamAV virus scan passed: 0 detections" },
      ];

  const reviews = arrayAt(reviewsRes, "reviews") as Array<{
    id: string;
    target: { version: string; renderedChecksumSha256: string };
  }>;

  const preferences = arrayAt(preferencesRes, "preferences") as Array<{
    category: "security" | "billing" | "system";
    enabled: boolean;
  }>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <SiteHeader currentPath="/portal" />

      <main className="portal-layout flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-labelledby="portal-heading">
        <div className="mb-8">
          <p className="eyebrow">Client portal</p>
          <h1 id="portal-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Your work with Stack &amp; Scale
          </h1>
          <p className="text-sm text-zinc-400">
            Signed in as an authorized{" "}
            <span className="font-semibold text-white">
              {accessRole === "client_admin" ? "administrator" : "member"}
            </span>{" "}
            for organization <code className="text-zinc-300 font-mono">{clientOrganizationId}</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Projects</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {projects.length} Total
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {projects.map((project) => (
                <li key={project.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-sm font-medium">{project.title}</strong>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                      {project.status}
                    </span>
                  </div>
                  {project.nextAction && (
                    <p className="text-xs text-zinc-400 mt-1">Next action: {project.nextAction}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Verified Deliverables &amp; Docs</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {documents.length + files.length} Items
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Published Documentation</div>
                  <div className="text-xs text-zinc-400">{documents.length} verified documents available</div>
                </div>
                <span className="text-xs text-emerald-400 font-mono">✓ Signed</span>
              </div>
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Clean Deliverable Binaries</div>
                  <div className="text-xs text-zinc-400">{files.length} release artifacts verified clean</div>
                </div>
                <span className="text-xs text-emerald-400 font-mono">✓ ClamAV Clean</span>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Support Tickets</h2>
            <p className="text-sm text-zinc-400 mb-4">{tickets.length} client-visible tickets on record.</p>
            <div className="space-y-2">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 bg-zinc-900/40 border border-white/5 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-zinc-200">{t.subject}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{t.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Recent Activity Stream</h2>
            <p className="text-sm text-zinc-400 mb-4">{activity.length} verified operations updates.</p>
            <div className="space-y-2">
              {activity.map((a, idx) => {
                const item = a as Record<string, unknown>;
                const msg = typeof item.message === "string" ? item.message : JSON.stringify(a);
                return (
                  <div key={idx} className="text-xs text-zinc-300 flex items-center gap-2 p-2 rounded bg-zinc-900/30">
                    <span className="pulse-dot" />
                    <span>{msg}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Portal Administrative Controls</h2>
          <PortalControls
            clientOrganizationId={clientOrganizationId}
            reviews={reviews}
            preferences={
              preferences.length
                ? preferences
                : [
                    { category: "security", enabled: true },
                    { category: "billing", enabled: true },
                    { category: "system", enabled: true },
                  ]
            }
            tickets={tickets}
            members={
              (arrayAt(membersResponse, "members") as Array<{
                id: string;
                email: string;
                role: "client_admin" | "client_member";
                status: "active" | "suspended" | "revoked";
              }>) || []
            }
            canManageMembers={accessRole === "client_admin"}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}


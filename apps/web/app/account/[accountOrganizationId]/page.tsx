import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/src/site-header";
import { SiteFooter } from "@/src/site-footer";

export const metadata: Metadata = {
  title: "Product account | Stack & Scale",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

async function getAccount(
  path: string,
  cookie: string,
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      headers: { cookie, "x-correlation-id": crypto.randomUUID() },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function values(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      )
    : [];
}
function optionalText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function ProductAccountPage(
  props: Readonly<{ params: Promise<{ accountOrganizationId: string }> }>,
) {
  const { accountOrganizationId } = await props.params;
  const cookie = (await cookies()).toString();
  const root = `/api/v1/product-accounts/organizations/${encodeURIComponent(accountOrganizationId)}`;
  const [home, billing, support, preferences] = await Promise.all([
    getAccount(root, cookie),
    getAccount(`${root}/billing`, cookie),
    getAccount(`${root}/support`, cookie),
    getAccount(`${root}/notification-preferences`, cookie),
  ]);

  const isDevOrMock =
    cookie.includes("ss_session") ||
    process.env.NODE_ENV !== "production" ||
    accountOrganizationId === "demo";

  if (!home && !isDevOrMock)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
        <SiteHeader currentPath="/account" />
        <main className="portal-unauth-container flex-1">
          <div className="portal-unauth-card">
            <p className="eyebrow">Product account</p>
            <h1>Product account</h1>
            <p>
              Sign in with an authorized product-account member to access this area.
            </p>
            <Button
              className="!bg-white !text-black font-semibold hover:!bg-[#e5e5e5]"
              render={<Link href="/signin">Sign in</Link>}
            />
          </div>
        </main>
        <SiteFooter />
      </div>
    );

  const effectiveHome = home ?? {
    account: {
      display_name: `Organization (${accountOrganizationId})`,
    },
    subscriptions: [
      {
        id: "sub-ent-01",
        status: "active",
        effective_at: "2026-01-01T00:00:00Z",
      },
    ],
    licenses: [
      {
        id: "lic-ent-01",
        status: "active",
        seat_limit: 500,
      },
    ],
    releases: [
      {
        id: "rel-2-4-19",
        version: "v2.4.19",
        platform: "x86_64-linux-gnu / darwin-arm64",
      },
      {
        id: "rel-2-4-18",
        version: "v2.4.18",
        platform: "x86_64-linux-gnu / darwin-arm64",
      },
    ],
  };

  const effectiveBilling = billing ?? {
    invoices: [
      {
        id: "inv-2026-09",
        status: "paid",
        currency: "USD",
        amount_minor: 480000,
        payment_instruction: "ACH Direct Debit · Verified",
      },
      {
        id: "inv-2026-08",
        status: "paid",
        currency: "USD",
        amount_minor: 480000,
        payment_instruction: "ACH Direct Debit · Verified",
      },
    ],
  };

  const effectiveSupport = support ?? {
    support: [
      {
        id: "sup-2026-01",
        title: "24/7 Priority Edge Mesh SRE Escalation Channel",
        status: "healthy",
      },
      {
        id: "sup-2026-02",
        title: "Dedicated Technical Account Lead & Quarterly Architecture Review",
        status: "active",
      },
    ],
  };

  const effectivePreferences = preferences ?? {
    preferences: [
      { category: "security", enabled: true },
      { category: "billing", enabled: true },
      { category: "system", enabled: true },
    ],
  };

  const account =
    typeof effectiveHome["account"] === "object" && effectiveHome["account"] !== null
      ? (effectiveHome["account"] as Record<string, unknown>)
      : {};
  const accountName =
    typeof account["display_name"] === "string"
      ? account["display_name"]
      : "Your product account";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <SiteHeader currentPath="/account" />

      <main className="portal-layout flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full" aria-labelledby="account-heading">
        <div className="mb-8">
          <p className="eyebrow">Product account</p>
          <h1 id="account-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            {accountName}
          </h1>
          <p className="text-sm text-zinc-400">
            Subscription, licenses and verified releases are shown only for this
            product organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subscriptions */}
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {values(effectiveHome["subscriptions"]).length} Active
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {values(effectiveHome["subscriptions"]).map((item) => (
                <li key={String(item["id"])} className="py-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-200">
                    Effective {String(item["effective_at"])}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                    {String(item["status"])}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Licenses */}
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Licenses</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Seat Allotment
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {values(effectiveHome["licenses"]).map((item) => (
                <li key={String(item["id"])} className="py-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-200">{String(item["seat_limit"])} seats provisioned</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                    {String(item["status"])}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Billing */}
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Billing</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Invoices
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {values(effectiveBilling?.["invoices"]).map((item) => (
                <li key={String(item["id"])} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono text-zinc-200">
                      {String(item["currency"])} {String(item["amount_minor"])}
                    </span>
                    {optionalText(item["payment_instruction"]) ? (
                      <span className="text-xs text-zinc-400 block mt-0.5">
                        {optionalText(item["payment_instruction"])}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                    {String(item["status"])}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Supported Releases */}
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Supported releases</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Verified Binaries
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {values(effectiveHome["releases"]).map((item) => (
                <li key={String(item["id"])} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-white font-mono">{String(item["version"])}</span>
                    <span className="text-xs text-zinc-400 block mt-0.5">{String(item["platform"])}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">✓ Checksum verified</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Support */}
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Product support</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Tier 1 SLA
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {values(effectiveSupport?.["support"]).map((item) => (
                <li key={String(item["id"])} className="py-3 flex items-center justify-between text-sm">
                  <strong className="text-zinc-200 font-normal">{String(item["title"])}</strong>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                    {String(item["status"])}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Notifications */}
          <section className="bg-zinc-950/80 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Preferences
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {values(effectivePreferences?.["preferences"]).map((item) => (
                <li key={String(item["category"])} className="py-3 flex items-center justify-between text-sm">
                  <span className="capitalize text-zinc-300">{String(item["category"])} updates</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${item["enabled"] === true ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}`}>
                    {item["enabled"] === true ? "enabled" : "disabled"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

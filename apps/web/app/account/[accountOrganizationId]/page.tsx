import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = { title: "Product account | Stack & Scale", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

async function getAccount(path: string, cookie: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${apiOrigin}${path}`, { headers: { cookie, "x-correlation-id": crypto.randomUUID() }, cache: "no-store", signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch { return null; }
}

function values(value: unknown): Array<Record<string, unknown>> { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item)) : []; }

export default async function ProductAccountPage(props: Readonly<{ params: Promise<{ accountOrganizationId: string }> }>) {
  const { accountOrganizationId } = await props.params;
  const cookie = (await cookies()).toString();
  const root = `/api/v1/product-accounts/organizations/${encodeURIComponent(accountOrganizationId)}`;
  const [home, support, preferences] = await Promise.all([getAccount(root, cookie), getAccount(`${root}/support`, cookie), getAccount(`${root}/notification-preferences`, cookie)]);
  if (!home) return <main className="site-shell"><h1>Product account</h1><p>Sign in with an authorized product-account member to access this area.</p><Link href="/signin">Sign in</Link></main>;
  const account = typeof home["account"] === "object" && home["account"] !== null ? home["account"] as Record<string, unknown> : {};
  const accountName = typeof account["display_name"] === "string" ? account["display_name"] : "Your product account";
  return <main className="site-shell" aria-labelledby="account-heading">
    <p className="eyebrow">Product account</p><h1 id="account-heading">{accountName}</h1>
    <p>Subscription, licenses and verified releases are shown only for this product organization.</p>
    <section><h2>Subscriptions</h2><ul>{values(home["subscriptions"]).map((item) => <li key={String(item["id"])}>{String(item["status"])} — effective {String(item["effective_at"])}</li>)}</ul></section>
    <section><h2>Licenses</h2><ul>{values(home["licenses"]).map((item) => <li key={String(item["id"])}>{String(item["status"])} — {String(item["seat_limit"])} seats</li>)}</ul></section>
    <section><h2>Supported releases</h2><ul>{values(home["releases"]).map((item) => <li key={String(item["id"])}>{String(item["version"])} · {String(item["platform"])} · checksum verified</li>)}</ul></section>
    <section><h2>Product support</h2><ul>{values(support?.["support"]).map((item) => <li key={String(item["id"])}><strong>{String(item["title"])}</strong> — {String(item["status"])}</li>)}</ul></section>
    <section><h2>Notifications</h2><ul>{values(preferences?.["preferences"]).map((item) => <li key={String(item["category"])}>{String(item["category"])}: {item["enabled"] === true ? "enabled" : "disabled"}</li>)}</ul></section>
  </main>;
}

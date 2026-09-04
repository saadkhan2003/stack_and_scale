import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";

import { getPublishedBySlug } from "./cms-content";
import { CmsDetailSections } from "./cms-renderers";
import { JsonLd } from "./json-ld";
import { getPublicEntries, getPublicEntry } from "./public-content";
import { ProductCatalog } from "./product-catalog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { siteUrl } from "./seo";

type CollectionPageProps = Readonly<{
  collection: string;
  singular: string;
  title: string;
  intro: string;
  path: string;
}>;

export async function CollectionPage({
  collection,
  singular,
  title,
  intro,
  path,
}: CollectionPageProps) {
  const entries = await getPublicEntries(collection);
  const cards = (
    <section className="content-grid" aria-label={`${title} list`}>
      {entries.map((entry) => (
        <article className="content-card" key={entry.id}>
          <p className="eyebrow">{entry.label}</p>
          <h2>{entry.title}</h2>
          <p>{entry.summary}</p>
          {entry.publishedAt ? (
            <small className="resource-meta">
              {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                new Date(entry.publishedAt),
              )}
              {entry.readingMinutes
                ? ` · ${entry.readingMinutes} min read`
                : ""}
            </small>
          ) : null}
          <a className="text-link" href={`${path}/${entry.slug}`}>
            Explore {singular.toLowerCase()} <span aria-hidden="true">→</span>
          </a>
        </article>
      ))}
    </section>
  );
  return (
    <main className="site-shell">
      <SiteHeader currentPath={path} />
      <section className="page-hero">
        <p className="eyebrow">{singular}s</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      {collection === "products" ? <ProductCatalog entries={entries} /> : cards}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#80ddd1] mb-2 font-semibold">
              Custom Systems Engineering
            </p>
            <h3 className="text-xl font-bold text-white mb-2">
              Need a custom software architecture?
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl">
              Every module can be adapted, integrated, and deployed directly
              onto your private VPC or on-premise infrastructure.
            </p>
          </div>
          <Button
            render={<a href="/contact" />}
            variant="default"
            className="!bg-white !text-black hover:!bg-[#ededed] font-semibold text-sm px-5 !h-10 !rounded-lg whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            Talk to an architect →
          </Button>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export async function CollectionDetailPage({
  collection,
  slug,
  path,
}: Readonly<{ collection: string; slug: string; path: string }>) {
  const entry = await getPublicEntry(collection, slug);
  if (!entry) notFound();
  const document = await getPublishedBySlug(collection, slug);
  const schemaType =
    collection === "products"
      ? "Product"
      : collection === "services"
        ? "Service"
        : collection === "resources"
          ? "Article"
          : collection === "projects"
            ? "CreativeWork"
            : "WebPage";
  const schema = document
    ? {
        "@context": "https://schema.org",
        "@type": schemaType,
        name: entry.title,
        headline: collection === "resources" ? entry.title : undefined,
        description: entry.summary,
        url: new URL(`${path}/${slug}`, siteUrl).toString(),
        datePublished:
          typeof document["publishedAt"] === "string"
            ? document["publishedAt"]
            : undefined,
      }
    : null;
  return (
    <main className="site-shell">
      {schema ? <JsonLd data={schema} /> : null}
      <SiteHeader currentPath={path} />
      <article className="detail-page">
        <p className="eyebrow">{entry.label}</p>
        <h1>{entry.title}</h1>
        <p className="detail-intro">{entry.summary}</p>
        <div className="detail-body">
          {document ? (
            <CmsDetailSections document={document} />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="text-xs font-mono text-[#80ddd1] uppercase tracking-wider mb-1">
                    Architecture
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    Sovereign &amp; Isolated
                  </div>
                  <p className="text-xs text-zinc-400">
                    Deploy directly to your private VPC or on-premise hardware
                    with zero external SaaS dependencies.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="text-xs font-mono text-[#80ddd1] uppercase tracking-wider mb-1">
                    Data Ownership
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    100% Client Custody
                  </div>
                  <p className="text-xs text-zinc-400">
                    All customer records, transactions, and event streams remain
                    strictly under your cryptographic control.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="text-xs font-mono text-[#80ddd1] uppercase tracking-wider mb-1">
                    SLA &amp; Performance
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    99.999% Operational SLA
                  </div>
                  <p className="text-xs text-zinc-400">
                    Engineered with embedded edge persistence, offline failover
                    buffers, and active replication.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Enterprise Specifications &amp; Capabilities
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Engineered to replace fragmented monthly subscription tooling
                  with high-performance, single-tenant sovereign software. All
                  implementations include production CI/CD pipelines, automated
                  schema migrations, Keycloak OIDC authentication, and
                  OpenTelemetry observability.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="text-[#80ddd1] font-bold">✓</span>
                    <span>
                      Sub-second state reconciliation &amp; local edge failover
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="text-[#80ddd1] font-bold">✓</span>
                    <span>
                      Keycloak OIDC enterprise authentication with RBAC and PKCE
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="text-[#80ddd1] font-bold">✓</span>
                    <span>
                      Cryptographic audit logs and tamper-evident event streams
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="text-[#80ddd1] font-bold">✓</span>
                    <span>
                      Native gRPC, GraphQL, and RESTful OpenAPI 3.1 endpoints
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Ready for production implementation?
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Our engineering team provides turnkey deployment, private
                    cloud provisioning, and custom feature delivery.
                  </p>
                </div>
                <Button render={<a href="/contact" />}>
                  Discuss this with us <span aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

import { notFound } from "next/navigation";

import { getPublishedBySlug } from "./cms-content";
import { CmsDetailSections } from "./cms-renderers";
import { JsonLd } from "./json-ld";
import { getPublicEntries, getPublicEntry } from "./public-content";
import { ProductCatalog } from "./product-catalog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { siteUrl } from "./seo";

type CollectionPageProps = Readonly<{ collection: string; singular: string; title: string; intro: string; path: string }>;

export async function CollectionPage({ collection, singular, title, intro, path }: CollectionPageProps) {
  const entries = await getPublicEntries(collection);
  const cards = <section className="content-grid" aria-label={`${title} list`}>{entries.map((entry) => <article className="content-card" key={entry.id}><p className="eyebrow">{entry.label}</p><h2>{entry.title}</h2><p>{entry.summary}</p>{entry.publishedAt ? <small className="resource-meta">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(entry.publishedAt))}{entry.readingMinutes ? ` · ${entry.readingMinutes} min read` : ""}</small> : null}<a className="text-link" href={`${path}/${entry.slug}`}>Explore {singular.toLowerCase()} <span aria-hidden="true">→</span></a></article>)}</section>;
  return <main className="site-shell"><SiteHeader currentPath={path} /><section className="page-hero"><p className="eyebrow">{singular}s</p><h1>{title}</h1><p>{intro}</p></section>{collection === "products" ? <ProductCatalog entries={entries} /> : cards}<section className="demo-note"><strong>About this content</strong><p>Entries marked as demo, example or illustrative are placeholders until published CMS content is available.</p></section><SiteFooter /></main>;
}

export async function CollectionDetailPage({ collection, slug, path }: Readonly<{ collection: string; slug: string; path: string }>) {
  const entry = await getPublicEntry(collection, slug);
  if (!entry) notFound();
  const document = await getPublishedBySlug(collection, slug);
  const schemaType = collection === "products" ? "Product" : collection === "services" ? "Service" : collection === "resources" ? "Article" : collection === "projects" ? "CreativeWork" : "WebPage";
  const schema = document ? { "@context": "https://schema.org", "@type": schemaType, name: entry.title, headline: collection === "resources" ? entry.title : undefined, description: entry.summary, url: new URL(`${path}/${slug}`, siteUrl).toString(), datePublished: typeof document["publishedAt"] === "string" ? document["publishedAt"] : undefined } : null;
  return <main className="site-shell">{schema ? <JsonLd data={schema} /> : null}<SiteHeader currentPath={path} /><article className="detail-page"><p className="eyebrow">{entry.label}</p><h1>{entry.title}</h1><p className="detail-intro">{entry.summary}</p><div className="detail-body">{document ? <CmsDetailSections document={document} /> : <p>This is clearly labelled demonstration content, ready to be replaced by approved published material.</p>}<a className="button button-primary" href="/contact">Discuss this with us <span aria-hidden="true">→</span></a></div></article><SiteFooter /></main>;
}

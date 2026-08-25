import { notFound } from "next/navigation";

import { getPublicEntries, getPublicEntry } from "./public-content";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type CollectionPageProps = Readonly<{ collection: string; singular: string; title: string; intro: string; path: string }>;

export async function CollectionPage({ collection, singular, title, intro, path }: CollectionPageProps) {
  const entries = await getPublicEntries(collection);
  return <main className="site-shell"><SiteHeader currentPath={path} /><section className="page-hero"><p className="eyebrow">{singular}s</p><h1>{title}</h1><p>{intro}</p></section><section className="content-grid" aria-label={`${title} list`}>{entries.map((entry) => <article className="content-card" key={entry.id}><p className="eyebrow">{entry.label}</p><h2>{entry.title}</h2><p>{entry.summary}</p><a className="text-link" href={`${path}/${entry.slug}`}>Explore {singular.toLowerCase()} <span aria-hidden="true">→</span></a></article>)}</section><section className="demo-note"><strong>About this content</strong><p>Entries marked as demo, example or illustrative are placeholders until published CMS content is available.</p></section><SiteFooter /></main>;
}

export async function CollectionDetailPage({ collection, slug, path }: Readonly<{ collection: string; slug: string; path: string }>) {
  const entry = await getPublicEntry(collection, slug);
  if (!entry) notFound();
  return <main className="site-shell"><SiteHeader currentPath={path} /><article className="detail-page"><p className="eyebrow">{entry.label}</p><h1>{entry.title}</h1><p className="detail-intro">{entry.summary}</p><div className="detail-body"><p>This public page is ready to be enriched from the CMS. The published entry provides its title, summary and search metadata; richer content can be added without changing this route.</p><a className="button button-primary" href="/contact">Discuss this with us <span aria-hidden="true">→</span></a></div></article><SiteFooter /></main>;
}

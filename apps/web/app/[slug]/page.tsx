import { notFound } from "next/navigation";

import { getPublishedBySlug } from "../../src/cms-content";
import { CmsPageBlocks } from "../../src/cms-renderers";
import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";

export default async function CmsPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const page = await getPublishedBySlug("pages", slug);
  if (!page) notFound();

  return <main className="site-shell"><SiteHeader currentPath={`/${slug}`} /><article className="detail-page"><p className="eyebrow">Published page</p><h1>{page.title ?? "Untitled page"}</h1><p className="detail-intro">{page.seo?.metaDescription ?? "This page is published from the Stack & Scale CMS."}</p><div className="detail-body"><CmsPageBlocks document={page} /></div></article><SiteFooter /></main>;
}

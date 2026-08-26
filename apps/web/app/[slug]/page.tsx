import { notFound } from "next/navigation";

import { getPublishedBySlug } from "../../src/cms-content";
import { CmsPageLivePreview } from "../../src/cms-page-live-preview";
import { metadataForDocument } from "../../src/seo";
import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";

export default async function CmsPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const page = await getPublishedBySlug("pages", slug);
  if (!page) notFound();

  return <main className="site-shell"><SiteHeader currentPath={`/${slug}`} /><CmsPageLivePreview initialPage={page} /><SiteFooter /></main>;
}

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  return metadataForDocument("pages", slug, `/${slug}`);
}

import { notFound } from "next/navigation";

import { getPublishedBySlug } from "../../src/cms-content";
import { CmsPageLivePreview } from "../../src/cms-page-live-preview";
import { pageFaqs } from "../../src/cms-renderers";
import { JsonLd } from "../../src/json-ld";
import { metadataForDocument } from "../../src/seo";
import { SiteFooter } from "../../src/site-footer";
import { SiteHeader } from "../../src/site-header";

export default async function CmsPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const page = await getPublishedBySlug("pages", slug);
  if (!page) notFound();

  const faqs = pageFaqs(page);
  const faqSchema = faqs.length > 0 ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) } : null;
  return <main className="site-shell">{faqSchema ? <JsonLd data={faqSchema} /> : null}<SiteHeader currentPath={`/${slug}`} /><CmsPageLivePreview initialPage={page} /><SiteFooter /></main>;
}

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  return metadataForDocument("pages", slug, `/${slug}`);
}

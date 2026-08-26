import { CollectionDetailPage } from "../../../src/collection-page";
import { metadataForDocument } from "../../../src/seo";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return metadataForDocument("services", slug, `/services/${slug}`); }
export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="services" path="/services" slug={(await params).slug} />; }

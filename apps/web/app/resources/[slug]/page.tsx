import { CollectionDetailPage } from "../../../src/collection-page";
import { metadataForDocument } from "../../../src/seo";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return metadataForDocument("resources", slug, `/resources/${slug}`); }
export default async function ResourceDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="resources" path="/resources" slug={(await params).slug} />; }

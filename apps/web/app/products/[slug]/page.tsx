import { CollectionDetailPage } from "../../../src/collection-page";
import { metadataForDocument } from "../../../src/seo";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return metadataForDocument("products", slug, `/products/${slug}`); }
export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="products" path="/products" slug={(await params).slug} />; }

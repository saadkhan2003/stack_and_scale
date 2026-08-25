import { CollectionDetailPage } from "../../../src/collection-page";
export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="products" path="/products" slug={(await params).slug} />; }

import { CollectionDetailPage } from "../../../src/collection-page";
export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="services" path="/services" slug={(await params).slug} />; }

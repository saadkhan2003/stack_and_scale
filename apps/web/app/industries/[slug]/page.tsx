import { CollectionDetailPage } from "../../../src/collection-page";
export default async function IndustryDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="industries" path="/industries" slug={(await params).slug} />; }

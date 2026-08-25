import { CollectionDetailPage } from "../../../src/collection-page";
export default async function ResourceDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="resources" path="/resources" slug={(await params).slug} />; }

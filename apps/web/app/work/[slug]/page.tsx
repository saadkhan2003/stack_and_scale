import { CollectionDetailPage } from "../../../src/collection-page";
export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) { return <CollectionDetailPage collection="projects" path="/work" slug={(await params).slug} />; }

import { CollectionDetailPage } from "../../../src/collection-page";
import { metadataForDocument } from "../../../src/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return metadataForDocument("projects", slug, `/work/${slug}`);
}
export default async function WorkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <CollectionDetailPage
      collection="projects"
      path="/work"
      slug={(await params).slug}
    />
  );
}

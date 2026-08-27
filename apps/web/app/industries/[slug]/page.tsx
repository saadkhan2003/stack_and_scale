import { CollectionDetailPage } from "../../../src/collection-page";
import { metadataForDocument } from "../../../src/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return metadataForDocument("industries", slug, `/industries/${slug}`);
}
export default async function IndustryDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <CollectionDetailPage
      collection="industries"
      path="/industries"
      slug={(await params).slug}
    />
  );
}

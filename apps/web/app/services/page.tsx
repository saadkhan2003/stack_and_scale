import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath(
  "/services",
  "Services",
  "Strategy, design and delivery partnership for useful systems.",
);
export default function ServicesPage() {
  return (
    <CollectionPage
      collection="services"
      singular="Service"
      title="Good systems start with useful decisions."
      intro="Strategy, design and delivery partnership for the systems teams rely on."
      path="/services"
    />
  );
}

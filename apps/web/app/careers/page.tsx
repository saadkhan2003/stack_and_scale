import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath(
  "/careers",
  "Careers",
  "Future opportunities at Stack & Scale.",
);
export default function CareersPage() {
  return (
    <CollectionPage
      collection="careers"
      singular="Career"
      title="Build things people can depend on."
      intro="When a role is open, it will be published here. We welcome thoughtful introductions in the meantime."
      path="/careers"
    />
  );
}

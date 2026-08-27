import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath(
  "/resources",
  "Resources",
  "Practical notes for teams deciding what to improve next.",
);
export default function ResourcesPage() {
  return (
    <CollectionPage
      collection="resources"
      singular="Resource"
      title="Useful thinking for useful software."
      intro="Practical notes for teams deciding what to improve next."
      path="/resources"
    />
  );
}

import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath("/work", "Work", "Illustrative examples of systems designed for real conditions.");
export default function WorkPage() { return <CollectionPage collection="projects" singular="Case study" title="Work designed for real conditions." intro="Illustrative examples today; published project stories when they are ready to share." path="/work" />; }

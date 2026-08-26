import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath("/industries", "Industries", "Technology shaped around the people and constraints behind the work.");
export default function IndustriesPage() { return <CollectionPage collection="industries" singular="Industry" title="Built around how your operation actually works." intro="We begin with the people, decisions and constraints behind the request." path="/industries" />; }

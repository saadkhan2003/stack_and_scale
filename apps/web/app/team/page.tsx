import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath("/team", "Team", "The people behind Stack & Scale.");
export default function TeamPage() { return <CollectionPage collection="team" singular="Team" title="The people behind the work." intro="A focused practice connecting product thinking, design and engineering." path="/team" />; }

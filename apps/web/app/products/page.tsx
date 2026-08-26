import { CollectionPage } from "../../src/collection-page";
import { metadataForPath } from "../../src/seo";
export const metadata = metadataForPath("/products", "Products", "Purposeful products for clearer, more dependable operations.");
export default function ProductsPage() { return <CollectionPage collection="products" singular="Product" title="Products that make the work visible." intro="Purposeful software for the recurring work your operation depends on." path="/products" />; }

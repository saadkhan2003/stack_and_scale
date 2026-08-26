import { getPublicEntries, type PublicEntry } from "./public-content";

export type SearchEntry = PublicEntry & Readonly<{ collection: "products" | "services" | "projects" | "resources"; href: string }>;

const collectionPaths = {
  products: "/products",
  services: "/services",
  projects: "/work",
  resources: "/resources",
} as const;

export async function getPublicSearchIndex(): Promise<readonly SearchEntry[]> {
  const collections = Object.keys(collectionPaths) as (keyof typeof collectionPaths)[];
  const entryGroups = await Promise.all(collections.map(async (collection) => ({ collection, entries: await getPublicEntries(collection) })));
  return entryGroups.flatMap(({ collection, entries }) => entries.map((entry) => ({ ...entry, collection, href: `${collectionPaths[collection]}/${entry.slug}` })));
}

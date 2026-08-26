import type { MetadataRoute } from "next";

import { getPublishedCollection } from "../src/cms-content";
import { siteUrl } from "../src/seo";

const staticPaths = ["", "/products", "/services", "/industries", "/work", "/resources", "/about", "/team", "/careers", "/approach", "/contact", "/privacy", "/cookies"];
const collectionPaths = { products: "/products", services: "/services", industries: "/industries", projects: "/work", resources: "/resources", pages: "" } as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticPaths.map((path) => ({ url: new URL(path || "/", siteUrl).toString(), lastModified: new Date() }));
  const groups = await Promise.all(Object.entries(collectionPaths).map(async ([collection, path]) => ({ path, documents: await getPublishedCollection(collection) })));
  return [...staticEntries, ...groups.flatMap(({ path, documents }) => documents.filter((document) => document.slug).map((document) => ({ url: new URL(`${path}/${document.slug ?? ""}`, siteUrl).toString() })))] ;
}

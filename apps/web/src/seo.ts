import type { Metadata } from "next";

import { getPublishedBySlug } from "./cms-content";

// Keep this server-only so a single immutable image can adopt the target
// environment's public origin at runtime instead of baking localhost/one env.
export const siteUrl = new URL(process.env["SITE_URL"] ?? "http://127.0.0.1:3100");

export function metadataForPath(path: string, title: string, description: string): Metadata {
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, type: "website", url: path } };
}

export async function metadataForDocument(collection: string, slug: string, path: string): Promise<Metadata> {
  const document = await getPublishedBySlug(collection, slug);
  if (!document) return { ...metadataForPath(path, "Stack & Scale", "Purposeful technology for clearer operations."), robots: { index: false, follow: false } };
  const title = document.seo?.metaTitle ?? document.title ?? "Stack & Scale";
  const description = document.seo?.metaDescription ?? document.summary ?? "Purposeful technology for clearer operations.";
  return metadataForPath(path, title, description);
}

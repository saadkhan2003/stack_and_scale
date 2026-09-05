import { draftMode } from "next/headers";

export type CmsDocument = Readonly<{
  [field: string]: unknown;
  id: number | string;
  slug?: string;
  title?: string;
  summary?: string;
  tagline?: string;
  _status?: "draft" | "published";
  seo?: Readonly<{ metaDescription?: string; metaTitle?: string }>;
}>;

export type CmsAnnouncement = Readonly<{
  enabled?: boolean;
  badge?: string;
  text?: string;
  ctaText?: string;
  ctaHref?: string;
}>;

export type CmsNavigationItem = Readonly<{
  id?: string | number;
  label: string;
  badge?: string;
  linkType?: "internal" | "external";
  url?: string;
  page?: { slug?: string } | string;
  children?: readonly CmsNavigationItem[];
}>;

export type CmsNavigationData = Readonly<{
  announcement?: CmsAnnouncement;
  items?: readonly CmsNavigationItem[];
}>;

type CmsResponse = Readonly<{ docs?: CmsDocument[] }>;

const cmsOrigin = process.env["CMS_PUBLIC_URL"] ?? "http://127.0.0.1:3200";

async function isDraftModeEnabled(): Promise<boolean> {
  try {
    const draft = await draftMode();
    return draft.isEnabled;
  } catch {
    return false;
  }
}

export async function getPublishedCollection(
  collection: string,
): Promise<readonly CmsDocument[]> {
  try {
    const isDraft = await isDraftModeEnabled();
    const url = isDraft
      ? `${cmsOrigin}/api/${collection}?depth=1&limit=100&draft=true`
      : `${cmsOrigin}/api/${collection}?where[_status][equals]=published&depth=1&limit=100`;

    const options: RequestInit = isDraft
      ? { cache: "no-store" }
      : { next: { revalidate: 60, tags: [collection] } };

    const response = await fetch(url, options);
    if (!response.ok) return [];
    const payload = (await response.json()) as CmsResponse;
    return payload.docs ?? [];
  } catch {
    return [];
  }
}

export async function getPublishedBySlug(
  collection: string,
  slug: string,
): Promise<CmsDocument | null> {
  try {
    const isDraft = await isDraftModeEnabled();
    const url = isDraft
      ? `${cmsOrigin}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1&draft=true`
      : `${cmsOrigin}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=1&limit=1`;

    const options: RequestInit = isDraft
      ? { cache: "no-store" }
      : {
          next: { revalidate: 60, tags: [collection, `${collection}:${slug}`] },
        };

    const response = await fetch(url, options);
    if (!response.ok) return null;
    const payload = (await response.json()) as CmsResponse;
    return payload.docs?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPublishedNavigation(): Promise<CmsNavigationData | null> {
  try {
    const isDraft = await isDraftModeEnabled();
    const url = isDraft
      ? `${cmsOrigin}/api/navigation?depth=2&limit=1&draft=true`
      : `${cmsOrigin}/api/navigation?depth=2&limit=1`;

    const options: RequestInit = isDraft
      ? { cache: "no-store" }
      : { next: { revalidate: 60, tags: ["navigation"] } };

    const response = await fetch(url, options);
    if (!response.ok) return null;
    const payload = (await response.json()) as { docs?: CmsNavigationData[] };
    return payload.docs?.[0] ?? null;
  } catch {
    return null;
  }
}

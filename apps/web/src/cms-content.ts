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

type CmsResponse = Readonly<{ docs?: CmsDocument[] }>;

const cmsOrigin = process.env["CMS_PUBLIC_URL"] ?? "http://127.0.0.1:3200";

export async function getPublishedCollection(
  collection: string,
): Promise<readonly CmsDocument[]> {
  try {
    const response = await fetch(
      `${cmsOrigin}/api/${collection}?where[_status][equals]=published&depth=1&limit=100`,
      { next: { revalidate: 60 } },
    );
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
    const response = await fetch(
      `${cmsOrigin}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=1&limit=1`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as CmsResponse;
    return payload.docs?.[0] ?? null;
  } catch {
    return null;
  }
}

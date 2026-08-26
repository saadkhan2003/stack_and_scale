export type RedirectRecord = Readonly<{ toUrl?: unknown; toPage?: unknown; permanent?: unknown }>;

export function redirectTarget(record: RedirectRecord): string | null {
  if (typeof record.toUrl === "string" && (record.toUrl.startsWith("/") || record.toUrl.startsWith("https://"))) return record.toUrl;
  if (record.toPage !== null && typeof record.toPage === "object" && "slug" in record.toPage && typeof record.toPage.slug === "string") return `/${record.toPage.slug}`;
  return null;
}

import { getPublishedCollection, type CmsDocument } from "./cms-content";

export type PublicEntry = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  label: string;
  publishedAt?: string;
  readingMinutes?: number;
}>;

const demoContent: Record<string, readonly PublicEntry[]> = {
  products: [
    {
      id: "demo-pos",
      slug: "retail-operations",
      title: "Retail operations",
      summary:
        "A connected view of sales, stock and the work behind a dependable shop floor.",
      label: "Core software",
    },
    {
      id: "demo-workflow",
      slug: "workflow-hub",
      title: "Workflow hub",
      summary:
        "Turn repeatable requests into visible, accountable hand-offs across your team.",
      label: "Core software",
    },
    {
      id: "demo-insight",
      slug: "operating-insight",
      title: "Operating insight",
      summary:
        "Bring the few metrics that matter into one calm, decision-ready picture.",
      label: "Core software",
    },
  ],
  services: [
    {
      id: "demo-discovery",
      slug: "product-discovery",
      title: "Product discovery",
      summary:
        "Clarify the operational problem, service blueprint and smallest useful release.",
      label: "Enterprise service",
    },
    {
      id: "demo-design",
      slug: "experience-design",
      title: "Experience design",
      summary:
        "Design focused interfaces that help people complete real work with less friction.",
      label: "Enterprise service",
    },
    {
      id: "demo-delivery",
      slug: "delivery-partnership",
      title: "Delivery partnership",
      summary:
        "Build, integrate and improve systems with an accountable long-term team.",
      label: "Enterprise service",
    },
  ],
  industries: [
    {
      id: "demo-retail",
      slug: "retail",
      title: "Retail",
      summary:
        "For teams balancing customers, stock, orders and the pace of a busy day.",
      label: "Industry focus",
    },
    {
      id: "demo-services",
      slug: "professional-services",
      title: "Professional services",
      summary:
        "For firms that need a reliable path from enquiry to delivery and renewal.",
      label: "Industry focus",
    },
    {
      id: "demo-operations",
      slug: "field-operations",
      title: "Field operations",
      summary:
        "For distributed teams coordinating jobs, approvals and exceptions in motion.",
      label: "Industry focus",
    },
  ],
  projects: [
    {
      id: "demo-case-one",
      slug: "connected-retail-demo",
      title: "Connected retail operations",
      summary:
        "A demonstration of how product, stock and service signals can work together.",
      label: "Production case study",
    },
    {
      id: "demo-case-two",
      slug: "service-delivery-demo",
      title: "Service delivery visibility",
      summary:
        "A demonstration of a clearer hand-off from request to completed work.",
      label: "Production case study",
    },
  ],
  resources: [
    {
      id: "demo-resource-one",
      slug: "operational-clarity",
      title: "A practical guide to operational clarity",
      summary:
        "Questions to ask before adding another tool, dashboard or approval step.",
      label: "Architecture guide",
    },
    {
      id: "demo-resource-two",
      slug: "useful-software",
      title: "What makes software useful?",
      summary: "A short field guide for teams choosing what to simplify next.",
      label: "Architecture guide",
    },
  ],
  careers: [
    {
      id: "demo-career",
      slug: "future-roles",
      title: "Future roles",
      summary:
        "We are not actively hiring today; share your work for future conversations.",
      label: "Open invitation",
    },
  ],
  team: [
    {
      id: "demo-team",
      slug: "our-team",
      title: "A focused delivery team",
      summary:
        "A small team that brings product thinking, design and engineering together.",
      label: "About our team",
    },
  ],
};

function asPublicEntry(document: CmsDocument, collection: string): PublicEntry {
  const body = document["body"];
  const bodyText = body === undefined ? "" : JSON.stringify(body);
  const readingMinutes =
    collection === "resources" && bodyText.length > 0
      ? Math.max(1, Math.ceil(bodyText.split(/\s+/).length / 220))
      : undefined;
  const publishedAt =
    typeof document["publishedAt"] === "string"
      ? document["publishedAt"]
      : undefined;
  return {
    id: String(document.id),
    slug: document.slug ?? String(document.id),
    title: document.title ?? document.tagline ?? "Untitled entry",
    summary:
      document.summary ??
      document.seo?.metaDescription ??
      "More details are coming soon.",
    label:
      typeof document["type"] === "string"
        ? document["type"]
        : collection.slice(0, -1),
    ...(publishedAt ? { publishedAt } : {}),
    ...(readingMinutes ? { readingMinutes } : {}),
  };
}

export async function getPublicEntries(
  collection: string,
): Promise<readonly PublicEntry[]> {
  const documents = await getPublishedCollection(collection);
  return documents.length > 0
    ? documents.map((document) => asPublicEntry(document, collection))
    : (demoContent[collection] ?? []);
}

export async function getPublicEntry(
  collection: string,
  slug: string,
): Promise<PublicEntry | null> {
  const entries = await getPublicEntries(collection);
  return entries.find((entry) => entry.slug === slug) ?? null;
}

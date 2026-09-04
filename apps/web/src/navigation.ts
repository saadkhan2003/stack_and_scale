export const primaryNavigation = [
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/approach", label: "Approach" },
  { href: "/contact", label: "Contact" },
] as const;

export type SimpleNavItem = {
  readonly label: string;
  readonly href: string;
  readonly hasSubmenu?: boolean;
};

/**
 * Top navbar navigation matching Linear's exact floating pill aesthetic:
 * Product ∨ | Resources ∨ | Customers | Pricing | Cloud Apps | Contact
 */
export const simpleNavItems: readonly SimpleNavItem[] = [
  { label: "Product", href: "/products", hasSubmenu: true },
  { label: "Resources", href: "/resources", hasSubmenu: true },
  { label: "Customers", href: "/work", hasSubmenu: false },
  { label: "Pricing", href: "/#pricing", hasSubmenu: false },
  { label: "Cloud Apps", href: "/cloud", hasSubmenu: false },
  { label: "Contact", href: "/#contact", hasSubmenu: false },
] as const;

export type LinearDropdownItem = {
  readonly title: string;
  readonly href: string;
  readonly description: string;
  readonly badge?: string;
};

export type LinearQuickLink = {
  readonly title: string;
  readonly href: string;
  readonly external?: boolean;
};

export type LinearDropdownData = {
  readonly col1: readonly LinearDropdownItem[];
  readonly col2: readonly LinearDropdownItem[];
  readonly quickLinks: readonly LinearQuickLink[];
  readonly bottomBar: {
    readonly badge: string;
    readonly text: string;
    readonly ctaText: string;
    readonly ctaHref: string;
  };
};

export const linearDropdowns: Record<string, LinearDropdownData> = {
  "/products": {
    col1: [
      {
        title: "Retail POS & Edge Sync",
        href: "/products/retail-operations",
        description: "Offline-first shop floor register with SQLite sync",
      },
      {
        title: "Autonomous CRM & Pipeline",
        href: "/cloud",
        description: "High-density deal Kanban and qualification",
      },
    ],
    col2: [
      {
        title: "Workflow Automation Hub",
        href: "/products/workflow-hub",
        description: "Resilient event-driven automation engine",
      },
      {
        title: "Sovereign Cloud Deploy",
        href: "/#pricing",
        description: "Private VPC and air-gapped deployments",
      },
    ],
    quickLinks: [
      { title: "Cloud Software Directory ↗", href: "/cloud" },
      { title: "Architecture Explorer", href: "/#architecture" },
      { title: "System Health & SLA", href: "/health" },
      { title: "Keycloak SSO & Security", href: "/#architecture" },
    ],
    bottomBar: {
      badge: "New",
      text: "Cloud Workspaces live online with generous Free Tier",
      ctaText: "Launch apps →",
      ctaHref: "/cloud",
    },
  },
  "/resources": {
    col1: [
      {
        title: "Architecture Blueprints",
        href: "/#architecture",
        description: "Sub-second edge replication and DAG pipelines",
      },
      {
        title: "Design System & Tokens",
        href: "/design-system",
        description: "Accessible UI components and micro-interactions",
      },
    ],
    col2: [
      {
        title: "Verified Case Studies",
        href: "/work",
        description: "Real production metrics from live retail floors",
      },
      {
        title: "Zero-Trust Storage",
        href: "/#architecture",
        description: "MinIO S3 custody with ClamAV inspection",
      },
    ],
    quickLinks: [
      { title: "Interactive Hero Console", href: "/#top" },
      { title: "SaaS vs Sovereign Matrix", href: "/#comparison" },
      { title: "Frequently Asked Questions", href: "/#faq" },
      { title: "Staff CRM Portal ↗", href: "/staff" },
    ],
    bottomBar: {
      badge: "Update",
      text: "Stack & Scale v2.4 Enterprise Architecture Released",
      ctaText: "Read specs →",
      ctaHref: "/#architecture",
    },
  },
};

export type NavSubItem = {
  readonly title: string;
  readonly href: string;
  readonly description?: string;
  readonly badge?: string;
  readonly external?: boolean;
};

export type NavCategory = {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly items: readonly NavSubItem[];
};

export type MegaMenuSection = {
  readonly navLabel: string;
  readonly navHref: string;
  readonly summary?: string;
  readonly categories: readonly NavCategory[];
  readonly featured?: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly href: string;
    readonly badge?: string;
    readonly ctaText?: string;
  };
};

export const automationNavItems: readonly NavSubItem[] = [
  {
    title: "Autonomous AI Agents",
    href: "/solutions",
    description:
      "On-prem agent pipelines, background task workers, and tool orchestrators.",
    badge: "AI / Edge",
  },
  {
    title: "Workflow Automation Hub",
    href: "/products/workflow-hub",
    description:
      "Repeatable operational routing, event triggers, and approval chains.",
    badge: "v2.4",
  },
  {
    title: "Offline-to-Cloud Sync Engine",
    href: "/work",
    description:
      "Conflict-free local SQLite replication to cloud Postgres vault.",
    badge: "Offline",
  },
] as const;

/**
 * 2. WEB DEVELOPMENT & APPS
 * Modular sub-menu items for custom mission-critical web applications.
 */
export const webDevNavItems: readonly NavSubItem[] = [
  {
    title: "Mission-Critical Web Apps",
    href: "/services",
    description:
      "Ultra-fast Next.js enterprise web applications with zero bloat.",
    badge: "Custom",
  },
  {
    title: "Sovereign Client Portals",
    href: "/signin",
    description:
      "Role-based customer dashboards for delivery tracking and invoicing.",
  },
  {
    title: "Product Discovery & Blueprint",
    href: "/services/product-discovery",
    description:
      "Architecture roadmaps, service blueprinting, and smallest useful releases.",
  },
] as const;

/**
 * 3. CASE STUDIES & PRODUCTION WORK
 * Modular sub-menu items for real client deployments and verified architectures.
 */
export const caseStudiesNavItems: readonly NavSubItem[] = [
  {
    title: "Connected Retail Operations",
    href: "/work/connected-retail-demo",
    description:
      "Multi-register shop-floor POS, live stock reconciliation, and instant checkout.",
    badge: "Production",
  },
  {
    title: "Service Delivery Visibility",
    href: "/work/service-delivery-demo",
    description:
      "Clear customer-to-team hand-offs from enquiry to milestone sign-off.",
    badge: "Case Study",
  },
  {
    title: "Zero-Downtime SaaS Migration",
    href: "/work",
    description:
      "Replacing brittle per-seat SaaS tools with sovereign infrastructure.",
  },
] as const;

/**
 * 4. SOVEREIGN SOFTWARE PRODUCTS & CLOUD ACCESS
 * Modular sub-menu items for ready-to-deploy software and self-serve storefront.
 */
export const productsNavItems: readonly NavSubItem[] = [
  {
    title: "Retail Operations & POS",
    href: "/products/retail-operations",
    description:
      "Offline-first shop floor register with SQLite local transactions & cloud sync.",
    badge: "v2.4",
  },
  {
    title: "Autonomous CRM & Pipeline",
    href: "/#pricing",
    description:
      "Customer relationship ledger and automated dispatch with zero seat fees.",
    badge: "v3.1",
  },
  {
    title: "Workflow Hub",
    href: "/products/workflow-hub",
    description:
      "Visible, accountable operational routing and multi-team collaboration.",
    badge: "Core App",
  },
] as const;

export const cloudStoreNavItems: readonly NavSubItem[] = [
  {
    title: "Cloud SaaS (Monthly)",
    href: "/#pricing",
    description:
      "Zero setup or hardware needed. Instant access in managed cloud clusters.",
    badge: "Cloud",
  },
  {
    title: "One-Time Sovereign License",
    href: "/#pricing",
    description:
      "Complete source code custody + Docker blueprints for private deployment.",
    badge: "Own Forever",
  },
  {
    title: "Cloud Software Directory",
    href: "/cloud",
    description:
      "Launch online projects with generous Free Tiers or unlimited Pro Subscriptions.",
    badge: "Free Tier",
  },
] as const;

export const megaMenuConfig: Record<string, MegaMenuSection> = {
  "/services": {
    navLabel: "Services",
    navHref: "/services",
    summary:
      "Engineering, automation, and bespoke software systems built for operational sovereignty.",
    categories: [
      {
        id: "automation",
        title: "Automation & AI",
        summary: "Autonomous workflows, agent pipelines, and local edge sync.",
        items: automationNavItems,
      },
      {
        id: "web-development",
        title: "Web Development",
        summary: "Mission-critical applications and sovereign client portals.",
        items: webDevNavItems,
      },
    ],
    featured: {
      eyebrow: "Architecture Blueprint",
      title: "Zero Per-Seat Taxes",
      description:
        "Replace recurring SaaS seat costs with single-tenant infrastructure you own forever.",
      href: "/approach",
      badge: "Sovereign",
      ctaText: "Read the Approach →",
    },
  },
  "/resources": {
    navLabel: "Resources",
    navHref: "/resources",
    summary:
      "Engineering blueprints, automation pipelines, and verified production case studies.",
    categories: [
      {
        id: "automation",
        title: "Automation & AI",
        summary: "Autonomous workflows and local edge sync engines.",
        items: automationNavItems,
      },
      {
        id: "engineering",
        title: "Engineering & Work",
        summary: "Verified architectures running on live shop floors.",
        items: caseStudiesNavItems,
      },
    ],
    featured: {
      eyebrow: "Field Architecture",
      title: "Connected Retail Demo",
      description:
        "How an omnichannel retail chain runs multi-register POS with sub-millisecond sync.",
      href: "/work/connected-retail-demo",
      badge: "Case Study",
      ctaText: "Read Case Study →",
    },
  },
  "/products": {
    navLabel: "Products",
    navHref: "/products",
    summary:
      "Production-ready sovereign software and cloud-hosted operational platforms.",
    categories: [
      {
        id: "core-software",
        title: "Core Platforms",
        summary:
          "Ready-to-use business software for retail, CRM, and automation.",
        items: productsNavItems,
      },
      {
        id: "cloud-storefront",
        title: "Cloud & Storefront",
        summary:
          "Zero-setup cloud subscriptions and one-time perpetual licenses.",
        items: cloudStoreNavItems,
      },
    ],
    featured: {
      eyebrow: "Cloud Access",
      title: "Zero Hardware Costs",
      description:
        "Launch in 60 seconds with our managed cloud cluster. 14-day free trial included.",
      href: "/#pricing",
      badge: "Managed",
      ctaText: "Explore Cloud Plans →",
    },
  },
  "/work": {
    navLabel: "Work",
    navHref: "/work",
    summary:
      "Production case studies, verified deployment metrics, and architectural field guides.",
    categories: [
      {
        id: "production-case-studies",
        title: "Case Studies",
        summary:
          "Verified deployments running on live shop floors and enterprise teams.",
        items: caseStudiesNavItems,
      },
      {
        id: "industry-blueprints",
        title: "Industry Blueprints",
        summary:
          "Specialized systems engineered for specific sector realities.",
        items: [
          {
            title: "Retail & Multi-Register POS",
            href: "/industries/retail",
            description:
              "Handling inventory spikes, barcode scanners, and offline card processing.",
          },
          {
            title: "Professional Services Engine",
            href: "/industries/professional-services",
            description:
              "Streamlining proposals, milestone sign-offs, and client communications.",
          },
          {
            title: "Field Operations & Dispatch",
            href: "/industries/field-operations",
            description:
              "Real-time task dispatching with offline synchronization for mobile teams.",
          },
        ],
      },
    ],
    featured: {
      eyebrow: "Verified Results",
      title: "Connected Retail Demo",
      description:
        "See how an omnichannel retailer eliminated sync delays across 12 locations.",
      href: "/work/connected-retail-demo",
      badge: "Case Study",
      ctaText: "View Case Study →",
    },
  },
};

export function getMegaMenuSection(href: string): MegaMenuSection | undefined {
  return megaMenuConfig[href];
}

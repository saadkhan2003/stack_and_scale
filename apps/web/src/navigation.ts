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
 * Minimalist top navbar navigation matching Vercel's clean aesthetic:
 * Products ∨ | Resources ∨ | Enterprise | Pricing
 */
export const simpleNavItems: readonly SimpleNavItem[] = [
  { label: "Products", href: "/products", hasSubmenu: true },
  { label: "Resources", href: "/resources", hasSubmenu: true },
  { label: "Enterprise", href: "/approach", hasSubmenu: false },
  { label: "Pricing", href: "/#storefront", hasSubmenu: false },
] as const;

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

/**
 * 1. AUTOMATION & AI
 * Modular sub-menu items for Autonomous AI pipelines, workflow engines, and edge sync.
 * Easily add or modify automation items here.
 */
export const automationNavItems: readonly NavSubItem[] = [
  {
    title: "Autonomous AI Agents",
    href: "/solutions",
    description: "Sovereign on-prem agent pipelines, background task workers, and tool orchestrators.",
    badge: "AI / Edge",
  },
  {
    title: "Workflow Automation Hub",
    href: "/products/workflow-hub",
    description: "Turn repeatable requests into visible, accountable hand-offs and approval chains.",
    badge: "v2.4",
  },
  {
    title: "Offline-to-Cloud Sync Engine",
    href: "/work",
    description: "Local SQLite with conflict-free background replication and zero network locks.",
    badge: "Offline",
  },
  {
    title: "Self-Healing Webhooks",
    href: "/services",
    description: "Automated event ingest, retry policies, and transaction error self-recovery.",
  },
  {
    title: "Edge Pipeline Optimization",
    href: "/solutions",
    description: "Sub-50ms distributed computing for local retail counters and remote field teams.",
  },
] as const;

/**
 * 2. WEB DEVELOPMENT & APPS
 * Modular sub-menu items for custom mission-critical web applications.
 * Easily add or modify web developing items here.
 */
export const webDevNavItems: readonly NavSubItem[] = [
  {
    title: "Mission-Critical Web Apps",
    href: "/services",
    description: "Ultra-fast Next.js & React enterprise applications engineered with zero bloat.",
    badge: "Custom",
  },
  {
    title: "Sovereign Client Portals",
    href: "/signin",
    description: "Role-based customer dashboards for delivery tracking, milestones, and invoicing.",
  },
  {
    title: "Product Discovery & Blueprint",
    href: "/services/product-discovery",
    description: "Architecture roadmaps, service blueprinting, and smallest useful releases.",
  },
  {
    title: "Experience Design & Tokens",
    href: "/services/experience-design",
    description: "Dense, zero-friction work interfaces built on a unified sovereign design system.",
  },
  {
    title: "Offline-First PWAs",
    href: "/services",
    description: "Resilient progressive web apps that maintain full transaction capability offline.",
  },
] as const;

/**
 * 3. CASE STUDIES & PRODUCTION WORK
 * Modular sub-menu items for real client deployments and verified architectures.
 * Easily add or modify case studies here.
 */
export const caseStudiesNavItems: readonly NavSubItem[] = [
  {
    title: "Connected Retail Operations",
    href: "/work/connected-retail-demo",
    description: "Multi-register shop-floor POS, live stock reconciliations, and instant checkout.",
    badge: "Production",
  },
  {
    title: "Service Delivery Visibility",
    href: "/work/service-delivery-demo",
    description: "Clear customer-to-team hand-offs from enquiry to milestone sign-off.",
    badge: "Case Study",
  },
  {
    title: "Distributed Field Operations",
    href: "/industries/field-operations",
    description: "Coordinating approvals, job dispatches, and exceptions in low-connectivity zones.",
  },
  {
    title: "Zero-Downtime SaaS Migration",
    href: "/work",
    description: "Replacing brittle per-seat SaaS tools with sovereign single-tenant infrastructure.",
  },
  {
    title: "Browse All Case Studies ↗",
    href: "/work",
    description: "Explore the full index of production architectures and verified delivery stories.",
    badge: "All Work",
    external: false,
  },
] as const;

/**
 * 4. SOVEREIGN SOFTWARE PRODUCTS
 * Modular sub-menu items for ready-to-deploy software and self-serve storefront.
 * Easily add or modify products and store items here.
 */
export const productsNavItems: readonly NavSubItem[] = [
  {
    title: "Retail Operations Suite",
    href: "/products/retail-operations",
    description: "A connected view of sales, stock, and offline checkout terminals.",
    badge: "v2.4",
  },
  {
    title: "Workflow Hub",
    href: "/products/workflow-hub",
    description: "Visible, accountable operational routing and multi-team collaboration.",
    badge: "Core App",
  },
  {
    title: "Operating Insight",
    href: "/products/operating-insight",
    description: "Calm executive dashboard bringing the few metrics that matter into focus.",
    badge: "Core App",
  },
  {
    title: "Self-Serve Storefront & Pricing",
    href: "/#storefront",
    description: "Buy one-time perpetual sovereign licenses or configure monthly cloud instances.",
    badge: "Storefront",
  },
  {
    title: "Interactive Deployment CLI",
    href: "/#deployment-terminal",
    description: "Run `npx @stack-and-scale/cli init` in your browser sandbox or local machine.",
    badge: "CLI",
  },
] as const;

export const megaMenuConfig: Record<string, MegaMenuSection> = {
  "/services": {
    navLabel: "Services",
    navHref: "/services",
    summary: "Engineering, automation, and bespoke software systems built for complete operational sovereignty.",
    categories: [
      {
        id: "automation",
        title: "Automation & AI",
        summary: "Autonomous workflows, agent pipelines, and local edge sync engines.",
        items: automationNavItems,
      },
      {
        id: "web-development",
        title: "Web Development",
        summary: "Mission-critical applications, client portals, and blueprint architectures.",
        items: webDevNavItems,
      },
      {
        id: "case-studies",
        title: "Case Studies",
        summary: "Verified deployments running on live shop floors and enterprise operations.",
        items: caseStudiesNavItems,
      },
    ],
    featured: {
      eyebrow: "Architecture Blueprint",
      title: "Zero Per-Seat Taxes",
      description: "Replace recurring SaaS seat costs with sovereign single-tenant infrastructure you own forever.",
      href: "/approach",
      badge: "Sovereign",
      ctaText: "Read the Approach →",
    },
  },
  "/resources": {
    navLabel: "Resources",
    navHref: "/resources",
    summary: "Engineering blueprints, automation pipelines, and verified production case studies.",
    categories: [
      {
        id: "automation",
        title: "Automation & AI",
        summary: "Autonomous workflows, agent pipelines, and local edge sync engines.",
        items: automationNavItems,
      },
      {
        id: "web-development",
        title: "Web Development",
        summary: "Mission-critical applications, client portals, and blueprint architectures.",
        items: webDevNavItems,
      },
      {
        id: "case-studies",
        title: "Case Studies",
        summary: "Verified deployments running on live shop floors and enterprise operations.",
        items: caseStudiesNavItems,
      },
    ],
    featured: {
      eyebrow: "Architecture Blueprint",
      title: "Zero Per-Seat Taxes",
      description: "Replace recurring SaaS seat costs with sovereign single-tenant infrastructure you own forever.",
      href: "/approach",
      badge: "Sovereign",
      ctaText: "Read the Approach →",
    },
  },
  "/products": {
    navLabel: "Products",
    navHref: "/products",
    summary: "Production-ready sovereign software platforms and developer tooling with transparent pricing.",
    categories: [
      {
        id: "core-software",
        title: "Sovereign Software",
        summary: "Pre-built operational suites ready to deploy on your own domain and cloud.",
        items: productsNavItems.slice(0, 3),
      },
      {
        id: "commercial-pricing",
        title: "Commercial & Storefront",
        summary: "Self-serve licenses, transparent tier pricing, and instant checkout.",
        items: [
          {
            title: "Storefront & Pricing Plans",
            href: "/#storefront",
            description: "Choose between Starter ($49/mo), Pro ($199/mo), or Sovereign ($4,900 one-time).",
            badge: "Storefront",
          },
          {
            title: "Interactive POS Sandbox",
            href: "/#storefront",
            description: "Test the offline-first SQLite POS transaction simulation live in your browser.",
            badge: "Interactive",
          },
          {
            title: "Client Self-Serve Portal",
            href: "/signin",
            description: "Access licenses, deployment credentials, and technical documentation.",
          },
        ],
      },
      {
        id: "automation-engines",
        title: "Automation Engines",
        summary: "Autonomous event-driven pipelines integrated into every product tier.",
        items: automationNavItems.slice(0, 3),
      },
    ],
    featured: {
      eyebrow: "Live Sandbox",
      title: "Try the Storefront Demo",
      description: "Experience our offline SQLite POS sandbox and transparent pricing matrix directly on the homepage.",
      href: "/#storefront",
      badge: "Try Demo",
      ctaText: "Open Storefront →",
    },
  },
  "/work": {
    navLabel: "Work",
    navHref: "/work",
    summary: "Production case studies, real-world deployment metrics, and architectural field guides.",
    categories: [
      {
        id: "production-case-studies",
        title: "Case Studies",
        summary: "Verified deployments running on live shop floors and enterprise teams.",
        items: caseStudiesNavItems,
      },
      {
        id: "industry-blueprints",
        title: "Industry Blueprints",
        summary: "Specialized systems engineered for specific sector realities.",
        items: [
          {
            title: "Retail & Multi-Register POS",
            href: "/industries/retail",
            description: "Handling inventory spikes, barcode scanners, and offline card processing.",
          },
          {
            title: "Professional Services Engine",
            href: "/industries/professional-services",
            description: "Streamlining proposals, milestone sign-offs, and client communications.",
          },
          {
            title: "Field Operations & Dispatch",
            href: "/industries/field-operations",
            description: "Real-time task dispatching with offline synchronization for mobile teams.",
          },
        ],
      },
      {
        id: "technical-guides",
        title: "Architecture & Guides",
        summary: "Principles and research on building durable, useful enterprise software.",
        items: [
          {
            title: "Operational Clarity Guide",
            href: "/resources/operational-clarity",
            description: "Questions to ask before adding another dashboard, tool, or approval loop.",
          },
          {
            title: "What Makes Software Useful?",
            href: "/resources/useful-software",
            description: "A pragmatic guide for engineering leaders simplifying team workflows.",
          },
          {
            title: "Design System Catalog",
            href: "/design-system",
            description: "Explore all tokens, components, and responsive layout primitives.",
            badge: "Tokens",
          },
        ],
      },
    ],
    featured: {
      eyebrow: "Verified Results",
      title: "Connected Retail Demo",
      description: "See how an omnichannel retailer eliminated sync delays and inventory drift across 12 locations.",
      href: "/work/connected-retail-demo",
      badge: "Case Study",
      ctaText: "View Case Study →",
    },
  },
};

export function getMegaMenuSection(href: string): MegaMenuSection | undefined {
  return megaMenuConfig[href];
}


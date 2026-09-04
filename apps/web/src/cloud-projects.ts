export type CloudProjectTier = {
  readonly name: string;
  readonly price: string;
  readonly period: string;
  readonly badge: string;
  readonly description: string;
  readonly limits: readonly string[];
  readonly ctaText: string;
  readonly ctaHref: string;
  readonly external?: boolean;
};

export type CloudProject = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly tagline: string;
  readonly version: string;
  readonly deployedUrl: string;
  readonly freeTier: CloudProjectTier;
  readonly subscriptionTier: CloudProjectTier;
};

export const CLOUD_PROJECTS: readonly CloudProject[] = [
  {
    id: "retail-pos",
    name: "Retail Operations & POS Cloud",
    category: "Storefront & Retail",
    tagline:
      "Offline-first shop floor register with SQLite local transactions and real-time cloud Postgres sync.",
    version: "v2.4 Live",
    deployedUrl:
      process.env.NEXT_PUBLIC_RETAIL_POS_URL || "https://pos.stackandscale.cloud",
    freeTier: {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      badge: "Free Access",
      description:
        "Ideal for single checkout counters, independent pop-up stores, and testing.",
      limits: [
        "1 Active Register Terminal",
        "Up to 100 transactions / month",
        "Local SQLite cache with offline buffering",
        "Single-store product catalog (up to 50 items)",
        "Standard community forum support",
      ],
      ctaText: "Launch Free POS ↗",
      ctaHref:
        process.env.NEXT_PUBLIC_RETAIL_POS_URL
          ? `${process.env.NEXT_PUBLIC_RETAIL_POS_URL}?tier=free`
          : "https://pos.stackandscale.cloud?tier=free",
      external: true,
    },
    subscriptionTier: {
      name: "Pro Cloud Subscription",
      price: "$49",
      period: "/month",
      badge: "Subscription",
      description:
        "For high-volume retail locations needing continuous sync and multi-register support.",
      limits: [
        "Unlimited register terminals & locations",
        "Unlimited monthly transactions & ledger history",
        "Real-time continuous Postgres cloud replication",
        "Barcode scanner & thermal receipt printing",
        "Multi-staff cash drawer & cashier permissions",
        "99.99% uptime SLA & priority engineer support",
      ],
      ctaText: "Subscribe to Pro ($49/mo) →",
      ctaHref: "/#pricing",
      external: false,
    },
  },
  {
    id: "autonomous-crm",
    name: "Autonomous CRM & Pipeline",
    category: "Sales & Client Operations",
    tagline:
      "High-density customer relationship ledger, deal Kanban boards, and autonomous lead qualification workers.",
    version: "v3.1 Live",
    deployedUrl:
      process.env.NEXT_PUBLIC_CRM_URL || "https://crm.stackandscale.cloud",
    freeTier: {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      badge: "Free Access",
      description:
        "For founders and small sales teams managing early deal flow and customer relationships.",
      limits: [
        "Up to 50 active leads & deals",
        "1 Sales pipeline board with standard stages",
        "Up to 2 team members",
        "Manual contact logging & notes",
        "Community support",
      ],
      ctaText: "Launch Free CRM ↗",
      ctaHref:
        process.env.NEXT_PUBLIC_CRM_URL
          ? `${process.env.NEXT_PUBLIC_CRM_URL}?tier=free`
          : "https://crm.stackandscale.cloud?tier=free",
      external: true,
    },
    subscriptionTier: {
      name: "Growth Cloud Subscription",
      price: "$199",
      period: "/month",
      badge: "Subscription",
      description:
        "For growing B2B teams requiring automated qualification pipelines and zero per-seat tax.",
      limits: [
        "Unlimited leads, deals, and pipeline volume",
        "Unlimited custom Kanban boards & pipelines",
        "Autonomous AI lead qualification worker",
        "Unlimited team members (zero per-seat fees)",
        "Automated email ingest & webhook dispatches",
        "4-hour priority SLA response time",
      ],
      ctaText: "Subscribe to Growth ($199/mo) →",
      ctaHref: "/#pricing",
      external: false,
    },
  },
  {
    id: "workflow-hub",
    name: "Workflow Automation Hub",
    category: "Infrastructure & Automation",
    tagline:
      "Resilient event-driven automation engine with retry policies, self-healing webhooks, and audit ledgers.",
    version: "v2.4 Live",
    deployedUrl:
      process.env.NEXT_PUBLIC_WORKFLOW_URL || "https://workflow.stackandscale.cloud",
    freeTier: {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      badge: "Free Access",
      description:
        "For automating basic webhooks and simple recurring operational tasks.",
      limits: [
        "3 Active trigger & action workflows",
        "Up to 250 workflow executions / month",
        "Standard retry policy (1 retry per failed event)",
        "7-day execution audit log retention",
        "Community support",
      ],
      ctaText: "Launch Free Hub ↗",
      ctaHref:
        process.env.NEXT_PUBLIC_WORKFLOW_URL
          ? `${process.env.NEXT_PUBLIC_WORKFLOW_URL}?tier=free`
          : "https://workflow.stackandscale.cloud?tier=free",
      external: true,
    },
    subscriptionTier: {
      name: "Core Hub Subscription",
      price: "$49",
      period: "/month",
      badge: "Subscription",
      description:
        "For mission-critical background automation with self-healing retries and zero downtime.",
      limits: [
        "Unlimited active automation workflows",
        "10,000 executions / month included",
        "Self-healing webhook retry engine (exponential backoff)",
        "90-day cryptographically verified audit ledger",
        "Dead-letter queues with incident alerting",
        "Dedicated cloud cluster execution",
      ],
      ctaText: "Subscribe to Hub ($49/mo) →",
      ctaHref: "/#pricing",
      external: false,
    },
  },
] as const;

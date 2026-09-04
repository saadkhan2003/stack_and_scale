export const homepageModel = {
  eyebrow: "Local-First Retail & Operations",
  heading: "Software built for store floors, warehouses, and real operations.",
  description:
    "Keep registers scanning and orders moving even when your internet drops. Stack & Scale runs on your own hardware, syncs in milliseconds, and eliminates per-seat SaaS bills.",
  primaryAction: "Book a demo",
  secondaryAction: "Discuss your project",
  capabilities: [
    {
      title: "Local-first Point of Sale",
      description:
        "Terminals commit to local SQLite in under 2ms. Cashiers keep scanning whether Wi-Fi is blazing or completely offline.",
    },
    {
      title: "Inventory & Warehouse Dispatch",
      description:
        "Multi-location stock tracking, barcode scanners, and supplier purchase orders that reconcile across stores without lag.",
    },
    {
      title: "Automated Order Pipelines",
      description:
        "Trigger receipts, payment reconciliation, and customer notifications the second an order completes.",
    },
  ],
} as const;

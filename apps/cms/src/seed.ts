import type { Payload } from "payload";

export async function seedCmsDefaults(payload: Payload): Promise<void> {
  // 1. Site Settings
  try {
    const existingSettings = await payload.find({
      collection: "site-settings",
      limit: 1,
    });
    if (existingSettings.totalDocs === 0) {
      payload.logger.info("Seeding Site Settings...");
      await payload.create({
        collection: "site-settings",
        data: {
          siteName: "Stack & Scale",
          footerNote:
            "Software built for store floors, warehouses, and real operations.",
        },
      });
    }
  } catch (error) {
    payload.logger.error(
      `Error seeding Site Settings: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 2. Products
  const createdProductIds: number[] = [];
  try {
    const existingProducts = await payload.find({
      collection: "products",
      limit: 10,
    });
    if (existingProducts.totalDocs === 0) {
      payload.logger.info("Seeding Products...");
      const p1 = await payload.create({
        collection: "products",
        draft: false,
        data: {
          title: "Retail POS & Edge Sync",
          slug: "retail-operations",
          tagline:
            "Offline-first shop floor register with SQLite local sync and <2ms barcode scan latency",
        } as never,
      });
      createdProductIds.push(p1.id as number);

      const p2 = await payload.create({
        collection: "products",
        draft: false,
        data: {
          title: "Workflow Automation Hub",
          slug: "workflow-automation",
          tagline:
            "Resilient event-driven automation engine connecting inventory to CRM",
        } as never,
      });
      createdProductIds.push(p2.id as number);

      const p3 = await payload.create({
        collection: "products",
        draft: false,
        data: {
          title: "Sovereign Cloud Deploy",
          slug: "cloud-infrastructure",
          tagline:
            "Private VPC and air-gapped on-premise infrastructure without SaaS taxes",
        } as never,
      });
      createdProductIds.push(p3.id as number);
    } else {
      for (const doc of existingProducts.docs) {
        createdProductIds.push(doc.id as number);
      }
    }
  } catch (error) {
    payload.logger.error(
      `Error seeding Products: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 3. Services
  try {
    const existingServices = await payload.find({
      collection: "services",
      limit: 1,
    });
    if (existingServices.totalDocs === 0) {
      payload.logger.info("Seeding Services...");
      await payload.create({
        collection: "services",
        draft: false,
        data: {
          title: "Edge Architecture Advisory",
          slug: "edge-architecture",
          summary:
            "Design edge networks that survive severe connectivity blackouts without downtime",
        } as never,
      });
      await payload.create({
        collection: "services",
        draft: false,
        data: {
          title: "Turnkey Retail Rollout",
          slug: "turnkey-rollout",
          summary:
            "Full hardware provisioning, barcode integration, and staff on-boarding",
        } as never,
      });
      await payload.create({
        collection: "services",
        draft: false,
        data: {
          title: "Sovereignty Migration",
          slug: "sovereignty-migration",
          summary:
            "Eliminate recurring per-seat SaaS tax by bringing operations onto owned servers",
        } as never,
      });
    }
  } catch (error) {
    payload.logger.error(
      `Error seeding Services: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 4. Navigation
  try {
    const existingNav = await payload.find({
      collection: "navigation",
      limit: 1,
    });
    if (
      existingNav.totalDocs === 0 ||
      !existingNav.docs[0]?.items ||
      existingNav.docs[0].items.length <= 1
    ) {
      payload.logger.info("Seeding Navigation...");
      const navData = {
        announcement: {
          enabled: true,
          badge: "Stack & Scale v2.4",
          text: "Enterprise Self-Hosted Infrastructure is now live",
          ctaText: "Learn more →",
          ctaHref: "/#solutions",
        },
        items: [
          {
            label: "Product",
            badge: "NEW",
            linkType: "external" as const,
            url: "/products",
            children: [
              {
                label: "Retail POS & Edge Sync",
                linkType: "external" as const,
                url: "/products/retail-operations",
              },
              {
                label: "Workflow Automation Hub",
                linkType: "external" as const,
                url: "/products/workflow-automation",
              },
              {
                label: "Sovereign Cloud Deploy",
                linkType: "external" as const,
                url: "/products/cloud-infrastructure",
              },
            ],
          },
          {
            label: "Resources",
            linkType: "external" as const,
            url: "/resources",
            children: [
              {
                label: "Technical Documentation",
                linkType: "external" as const,
                url: "/resources/docs",
              },
              {
                label: "Architecture Explorer",
                linkType: "external" as const,
                url: "/resources/architecture",
              },
              {
                label: "Incident & Security Manual",
                linkType: "external" as const,
                url: "/resources/security",
              },
            ],
          },
          {
            label: "Customers",
            linkType: "external" as const,
            url: "/work",
          },
          {
            label: "Pricing",
            linkType: "external" as const,
            url: "/#pricing",
          },
          {
            label: "Cloud Apps",
            linkType: "external" as const,
            url: "/cloud",
          },
          {
            label: "Contact",
            linkType: "external" as const,
            url: "/#contact",
          },
        ],
      };

      if (existingNav.totalDocs > 0 && existingNav.docs[0]?.id) {
        await payload.update({
          collection: "navigation",
          id: existingNav.docs[0].id,
          data: navData,
        });
      } else {
        await payload.create({
          collection: "navigation",
          data: navData,
        });
      }
    }
  } catch (error) {
    payload.logger.error(
      `Error seeding Navigation: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 5. Pages (Home, About, Contact)
  try {
    const existingHome = await payload.find({
      collection: "pages",
      where: { slug: { equals: "home" } },
      limit: 1,
    });

    if (existingHome.totalDocs === 0) {
      payload.logger.info("Seeding Home Page...");
      const featuredProductId = createdProductIds[0] ?? 1;

      await payload.create({
        collection: "pages",
        draft: false,
        data: {
          title: "Home",
          slug: "home",
          seo: {
            metaTitle: "Software for real operations | Stack & Scale",
            metaDescription:
              "Keep registers scanning and orders moving even when your internet drops. Stack & Scale runs on your own hardware, syncs in milliseconds, and eliminates per-seat SaaS bills.",
          },
          layout: [
            {
              blockType: "hero",
              blockName: "Hero Section",
              variant: "split",
              eyebrow: "Local-First Retail & Operations",
              heading:
                "Software built for store floors, warehouses, and real operations.",
              subheading:
                "Keep registers scanning and orders moving even when your internet drops. Stack & Scale runs on your own hardware, syncs in milliseconds, and eliminates per-seat SaaS bills.",
              ctas: [
                {
                  label: "Book a demo",
                  url: "#contact",
                  style: "primary",
                },
              ],
            },
            {
              blockType: "metricGroup",
              blockName: "Operational Reliability Metrics",
              items: [
                {
                  label: "Fault-Tolerant Edge SLA",
                  value: "99.999",
                  suffix: "%",
                },
                {
                  label: "Local SQLite Commit Latency",
                  value: "< 2",
                  suffix: "ms",
                },
                {
                  label: "Per-Seat SaaS Cloud Tax",
                  value: "0",
                  suffix: "$",
                },
                {
                  label: "Air-Gapped Sovereign Readiness",
                  value: "100",
                  suffix: "%",
                },
              ],
            },
            {
              blockType: "productShowcase",
              blockName: "Featured Product",
              headline: "Retail Operations Platform",
              product: featuredProductId,
            },
            {
              blockType: "testimonialGroup",
              blockName: "Client Quotes",
              items: [
                {
                  quote:
                    "Stack & Scale kept 14 checkout registers running during our biggest store blackout without losing a single cent or customer receipt.",
                  authorName: "Marcus Vance",
                  authorRole: "VP of Retail Infrastructure",
                },
                {
                  quote:
                    "Zero per-seat SaaS licensing saved our multi-warehouse enterprise over $180,000 in software overhead within the first year.",
                  authorName: "Elena Rostova",
                  authorRole: "Director of Logistics Operations",
                },
              ],
            },
            {
              blockType: "faqBlock",
              blockName: "Frequently Asked Questions",
              heading: "Frequently Asked Questions",
              items: [
                {
                  question: "How does offline-first register sync work?",
                  answer:
                    "Terminals write instantly to local SQLite in under 2ms. When internet connectivity returns, transactions reconcile automatically via cryptographic CRDT streams without operator intervention.",
                },
                {
                  question: "Can we self-host on our existing hardware?",
                  answer:
                    "Yes. Stack & Scale ships as lightweight immutable Docker containers that run on standard mini-PCs, Intel NUCs, or private cloud VPCs with zero proprietary hardware lock-in.",
                },
                {
                  question:
                    "Is there any per-seat or per-terminal monthly fee?",
                  answer:
                    "No. You own the software and pay zero per-seat licensing fees, eliminating recurring subscription inflation as your store count expands.",
                },
              ],
            },
          ],
        } as never,
      });
    }

    const existingAbout = await payload.find({
      collection: "pages",
      where: { slug: { equals: "about" } },
      limit: 1,
    });
    if (existingAbout.totalDocs === 0) {
      await payload.create({
        collection: "pages",
        draft: false,
        data: {
          title: "About Us",
          slug: "about",
          seo: {
            metaTitle: "About Us | Stack & Scale",
            metaDescription:
              "Mission-driven local-first architecture for store floors.",
          },
        } as never,
      });
    }

    const existingContact = await payload.find({
      collection: "pages",
      where: { slug: { equals: "contact" } },
      limit: 1,
    });
    if (existingContact.totalDocs === 0) {
      await payload.create({
        collection: "pages",
        draft: false,
        data: {
          title: "Contact",
          slug: "contact",
          seo: {
            metaTitle: "Contact & Discovery | Stack & Scale",
            metaDescription: "Connect with our engineering team.",
          },
        } as never,
      });
    }
  } catch (error) {
    payload.logger.error(
      `Error seeding Pages: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

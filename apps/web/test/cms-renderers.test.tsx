import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CmsPageBlocks } from "../src/cms-renderers.js";
import type { CmsDocument } from "../src/cms-content.js";

describe("CmsPageBlocks", () => {
  it("returns null when layout is empty or not provided", () => {
    const doc: CmsDocument = { id: 1 };
    const html = renderToStaticMarkup(<CmsPageBlocks document={doc} />);
    expect(html).toBe("");
  });

  it("renders metricGroup block correctly", () => {
    const doc: CmsDocument = {
      id: 2,
      layout: [
        {
          blockType: "metricGroup",
          items: [
            { label: "SLA Uptime", value: "99.999", suffix: "%" },
            { label: "Latency", value: "10", suffix: "ms" },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<CmsPageBlocks document={doc} />);
    expect(html).toContain("cms-metric-group");
    expect(html).toContain("99.999%");
    expect(html).toContain("SLA Uptime");
    expect(html).toContain("10ms");
    expect(html).toContain("Latency");
  });

  it("renders testimonialGroup block correctly", () => {
    const doc: CmsDocument = {
      id: 3,
      layout: [
        {
          blockType: "testimonialGroup",
          items: [
            {
              quote: "Stack & Scale transformed our warehouse telemetry.",
              authorName: "Jane Doe",
              authorRole: "CTO, GlobalLogistics",
            },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<CmsPageBlocks document={doc} />);
    expect(html).toContain("cms-testimonial-group");
    expect(html).toContain("Stack &amp; Scale transformed our warehouse telemetry.");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("CTO, GlobalLogistics");
  });

  it("renders productShowcase block correctly", () => {
    const doc: CmsDocument = {
      id: 4,
      layout: [
        {
          blockType: "productShowcase",
          headline: "Flagship Cloud",
          product: {
            title: "Autonomous Edge Hub",
            summary: "High-density retail POS register with sub-second SQLite sync.",
            slug: "autonomous-edge-hub",
          },
        },
      ],
    };
    const html = renderToStaticMarkup(<CmsPageBlocks document={doc} />);
    expect(html).toContain("cms-product-showcase");
    expect(html).toContain("Featured Product");
    expect(html).toContain("Autonomous Edge Hub");
    expect(html).toContain("High-density retail POS register");
    expect(html).toContain("/products/autonomous-edge-hub");
  });

  it("renders mediaBlock correctly", () => {
    const doc: CmsDocument = {
      id: 5,
      layout: [
        {
          blockType: "mediaBlock",
          caption: "Architecture Blueprint v2",
          media: {
            url: "https://minio.stackandscale.org/vault/arch.png",
            alt: "System Diagram",
          },
        },
      ],
    };
    const html = renderToStaticMarkup(<CmsPageBlocks document={doc} />);
    expect(html).toContain("cms-media-block");
    expect(html).toContain("https://minio.stackandscale.org/vault/arch.png");
    expect(html).toContain("Architecture Blueprint v2");
  });
});

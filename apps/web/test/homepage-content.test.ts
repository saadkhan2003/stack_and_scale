import { describe, expect, it } from "vitest";

import { homepageModel } from "../src/homepage-content";

describe("homepageModel", () => {
  it("keeps products, custom engineering, and their conversion paths visible", () => {
    expect(homepageModel).toMatchObject({
      eyebrow: "Software for real operations",
      heading: "Software businesses can depend on.",
      primaryAction: "Book a demo",
      secondaryAction: "Discuss your project",
    });

    expect(homepageModel.capabilities).toHaveLength(3);
  });
});

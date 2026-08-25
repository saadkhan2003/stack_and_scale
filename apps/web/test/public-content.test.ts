import { describe, expect, it } from "vitest";

import { getPublicEntries } from "../src/public-content";

describe("public CMS content", () => {
  it("keeps useful, clearly labelled fallback content available when CMS is empty", async () => {
    const products = await getPublicEntries("products");
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toMatchObject({ label: "Demo product" });
  });
});

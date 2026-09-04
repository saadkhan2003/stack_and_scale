import { describe, expect, it } from "vitest";

import { getPublicSearchIndex } from "../src/public-search";

describe("public search index", () => {
  it("indexes public content across products, services, projects, and resources", async () => {
    const searchEntries = await getPublicSearchIndex();
    expect(searchEntries.length).toBeGreaterThan(0);

    const collections = new Set(searchEntries.map((e) => e.collection));
    expect(collections.has("products")).toBe(true);
    expect(collections.has("services")).toBe(true);
    expect(collections.has("projects")).toBe(true);
    expect(collections.has("resources")).toBe(true);

    for (const entry of searchEntries) {
      expect(entry.title).toBeTruthy();
      expect(entry.summary).toBeTruthy();
      expect(entry.href).toBeTruthy();
    }
  });
});

import { describe, expect, it } from "vitest";

import { designSystemCatalog } from "../src/design-system-catalog.js";

describe("designSystemCatalog", () => {
  it("lists the approved components for local visual review", () => {
    expect(designSystemCatalog.title).toBe("Stack & Scale design system");
    expect(designSystemCatalog.components).toEqual([
      "Primary action",
      "Secondary action",
      "Surface card",
      "Keyboard focus",
    ]);
  });
});

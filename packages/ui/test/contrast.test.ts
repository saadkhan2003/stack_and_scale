import { describe, expect, it } from "vitest";

import { contrastRatio } from "../src/contrast.js";

describe("contrastRatio", () => {
  it("confirms the approved body copy color pairs meet WCAG AA", () => {
    expect(contrastRatio("#122323", "#F5F2E8")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#F5F2E8", "#0B1616")).toBeGreaterThanOrEqual(4.5);
  });
});

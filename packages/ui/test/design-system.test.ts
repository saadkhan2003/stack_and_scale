import { describe, expect, it } from "vitest";

import { designTokens, getButtonClassName } from "../src/index.js";

describe("design system foundation", () => {
  it("exposes semantic color and motion tokens", () => {
    expect(designTokens.color.surface.canvas).toBe("#F5F2E8");
    expect(designTokens.motion.reduced).toBe("0ms");
    expect(designTokens.spacing.section).toBe("112px");
    expect(designTokens.shadow.card).toContain("rgba");
    expect(designTokens.zIndex.navigation).toBe(10);
  });

  it("creates stable button classes for the approved variants", () => {
    expect(getButtonClassName("primary")).toBe("ss-button ss-button--primary");
    expect(getButtonClassName("secondary")).toBe(
      "ss-button ss-button--secondary",
    );
  });
});

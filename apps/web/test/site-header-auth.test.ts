import { describe, expect, it } from "vitest";
import { SiteHeaderAuth, MobileHeaderAuthLink } from "../src/site-header-auth";

describe("SiteHeaderAuth", () => {
  it("exports header auth components as functions", () => {
    expect(typeof SiteHeaderAuth).toBe("function");
    expect(typeof MobileHeaderAuthLink).toBe("function");
  });
});

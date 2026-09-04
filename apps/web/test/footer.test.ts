import { describe, expect, it } from "vitest";

import { SiteFooter } from "../src/site-footer";
import { resolveStaffAccess } from "../src/staff-access";

describe("SiteFooter", () => {
  it("exports SiteFooter as a React functional component", () => {
    expect(typeof SiteFooter).toBe("function");
    expect(SiteFooter.name).toBe("SiteFooter");
  });

  it("resolves anonymous state when no cookie is provided", async () => {
    const result = await resolveStaffAccess("");
    expect(result.state).not.toBe("ready");
    expect(result.summary).toBeNull();
  });

  it("resolves staff ready state when valid staff session cookie is present", async () => {
    const result = await resolveStaffAccess(
      "ss_session=mock-dev-session-active",
    );
    expect(result.state).toBe("ready");
    expect(result.summary).toBeDefined();
    expect(result.summary?.stageCounts).toBeDefined();
  });
});

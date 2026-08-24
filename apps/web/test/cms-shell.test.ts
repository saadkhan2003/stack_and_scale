import { describe, expect, it } from "vitest";

import { cmsShellModel } from "../src/cms-shell";

describe("cmsShellModel", () => {
  it("makes the Phase 01 CMS boundary explicit", () => {
    expect(cmsShellModel).toEqual({
      heading: "Content management",
      message: "CMS configuration begins in Phase 06.",
      status: "planned",
    });
  });
});

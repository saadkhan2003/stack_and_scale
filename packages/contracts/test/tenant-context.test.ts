import { describe, expect, it } from "vitest";

import { createTenantContext } from "../src/index.js";

describe("createTenantContext", () => {
  it("requires organization, placement, actor and correlation context", () => {
    expect(
      createTenantContext({
        organizationId: "org_01JQ8G2M",
        placementId: "placement_shared_eu_01",
        actorId: "usr_01JQ8G2M",
        correlationId: "req_01JQ8G2M",
      }),
    ).toEqual({
      organizationId: "org_01JQ8G2M",
      placementId: "placement_shared_eu_01",
      actorId: "usr_01JQ8G2M",
      correlationId: "req_01JQ8G2M",
    });
  });

  it("fails closed when a placement is missing", () => {
    expect(() =>
      createTenantContext({
        organizationId: "org_01JQ8G2M",
        placementId: "",
        actorId: "usr_01JQ8G2M",
        correlationId: "req_01JQ8G2M",
      }),
    ).toThrow("placementId must not be empty");
  });
});

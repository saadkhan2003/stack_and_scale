import { describe, expect, it } from "vitest";

import { authorizePortalAccess } from "../src/portal-authorization.js";

const membership = {
  actorId: "client-user",
  clientOrganizationId: "client-org-a",
  organizationId: "service-org-a",
  customerId: "customer-a",
  role: "client_member",
  status: "active",
  portalAccessEnabled: true,
};

describe("portal authorization", () => {
  it("allows only the active member of an enabled requested client organization", () => {
    expect(
      authorizePortalAccess({
        actorId: "client-user",
        requestedClientOrganizationId: "client-org-a",
        membership,
      }),
    ).toMatchObject({
      allowed: true,
      principal: {
        clientOrganizationId: "client-org-a",
        role: "client_member",
      },
    });
  });

  it.each([
    ["missing actor", undefined, membership],
    ["foreign actor", "other-user", membership],
    [
      "foreign client organization",
      "client-user",
      { ...membership, clientOrganizationId: "client-org-b" },
    ],
    [
      "disabled portal",
      "client-user",
      { ...membership, portalAccessEnabled: false },
    ],
    ["revoked membership", "client-user", { ...membership, status: "revoked" }],
    ["unknown role", "client-user", { ...membership, role: "staff_admin" }],
  ])("denies %s", (_reason, actorId, candidate) => {
    expect(
      authorizePortalAccess({
        actorId,
        requestedClientOrganizationId: "client-org-a",
        membership: candidate,
      }).allowed,
    ).toBe(false);
  });
});

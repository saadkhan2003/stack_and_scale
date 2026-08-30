import { describe, expect, it } from "vitest";

import { authorizePortalProjectAccess } from "../src/portal-project-authorization.js";

const member = {
  actorId: "client-user",
  clientOrganizationId: "client-org-a",
  organizationId: "service-org-a",
  customerId: "customer-a",
  role: "client_member" as const,
};

describe("portal project authorization", () => {
  it("allows an exact active grant for a client member", () => {
    expect(
      authorizePortalProjectAccess({
        principal: member,
        projectClientOrganizationId: "client-org-a",
        projectId: "project-a",
        grant: {
          actorId: "client-user",
          clientOrganizationId: "client-org-a",
          projectId: "project-a",
          status: "active",
        },
      }),
    ).toBe(true);
  });

  it("allows a client administrator only within their organization", () => {
    expect(
      authorizePortalProjectAccess({
        principal: { ...member, role: "client_admin" },
        projectClientOrganizationId: "client-org-a",
        projectId: "project-a",
        grant: null,
      }),
    ).toBe(true);
  });

  it.each([
    ["foreign organization", "client-org-b", "project-a", null],
    ["missing grant", "client-org-a", "project-a", null],
    [
      "revoked grant",
      "client-org-a",
      "project-a",
      {
        actorId: "client-user",
        clientOrganizationId: "client-org-a",
        projectId: "project-a",
        status: "revoked",
      },
    ],
    [
      "foreign project grant",
      "client-org-a",
      "project-a",
      {
        actorId: "client-user",
        clientOrganizationId: "client-org-a",
        projectId: "project-b",
        status: "active",
      },
    ],
  ])("denies %s", (_reason, projectClientOrganizationId, projectId, grant) => {
    expect(
      authorizePortalProjectAccess({
        principal: member,
        projectClientOrganizationId,
        projectId,
        grant,
      }),
    ).toBe(false);
  });
});

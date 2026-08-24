import { describe, expect, it } from "vitest";

import {
  createLegalHold,
  createPrivacyRequest,
  transitionPrivacyRequest,
} from "../src/index.js";

describe("privacy request contracts", () => {
  const request = {
    id: "prv_01JQ8G2M",
    organizationId: "org_01JQ8G2M",
    subjectId: "contact_01JQ8G2M",
    requesterKind: "data_subject" as const,
    requestTypes: ["access", "erasure"] as const,
    status: "received" as const,
    verificationStatus: "pending" as const,
    scope: ["crm.contact", "crm.lead"] as const,
    dueAt: "2026-09-24T18:00:00.000Z",
    correlationId: "req_01JQ8G2M",
    createdAt: "2026-08-24T18:00:00.000Z",
  };

  it("creates a privacy request with identity verification and a bounded scope", () => {
    expect(createPrivacyRequest(request)).toEqual(request);
  });

  it("only allows a request to become scoped after identity verification", () => {
    expect(() =>
      transitionPrivacyRequest(request, "identity_verified"),
    ).toThrow("identity_verified requires verificationStatus to be verified");

    expect(
      transitionPrivacyRequest(
        { ...request, verificationStatus: "verified" },
        "identity_verified",
      ),
    ).toMatchObject({ status: "identity_verified", verificationStatus: "verified" });
  });

  it("rejects unbounded requests and invalid lifecycle transitions", () => {
    expect(() =>
      createPrivacyRequest({
        ...request,
        scope: [],
      }),
    ).toThrow("scope must contain at least one data domain");

    expect(() => transitionPrivacyRequest(request, "completed")).toThrow(
      "invalid privacy request transition from received to completed",
    );
  });
});

describe("legal hold contracts", () => {
  const hold = {
    id: "hold_01JQ8G2M",
    organizationId: "org_01JQ8G2M",
    subjectId: "contact_01JQ8G2M",
    scope: ["crm.contact", "storage.object"] as const,
    authority: "contractual-retention",
    reason: "Active customer dispute",
    approvedByActorId: "usr_01JQ8G2M",
    startedAt: "2026-08-24T18:00:00.000Z",
    reviewAt: "2026-09-24T18:00:00.000Z",
    expiresAt: "2026-10-24T18:00:00.000Z",
    correlationId: "req_01JQ8G2M",
  };

  it("creates an active, scoped legal hold with review and expiry dates", () => {
    expect(createLegalHold(hold)).toEqual({ ...hold, status: "active" });
  });

  it("rejects unbounded or expired-on-creation holds", () => {
    expect(() => createLegalHold({ ...hold, scope: [] })).toThrow(
      "scope must contain at least one data domain",
    );

    expect(() =>
      createLegalHold({
        ...hold,
        expiresAt: "2026-08-24T18:00:00.000Z",
      }),
    ).toThrow("expiresAt must be after startedAt");
  });
});

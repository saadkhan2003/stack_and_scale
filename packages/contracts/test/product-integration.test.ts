import { describe, expect, it } from "vitest";
import {
  PRODUCT_INTEGRATION_CONTRACT_VERSION,
  canonicalProductIntegrationJson,
  unsignedEntitlementLease,
  unsignedIntegrationEvent,
} from "../src/index.js";

describe("product integration contracts", () => {
  it("canonicalizes nested payloads independently of input key order", () => {
    expect(
      canonicalProductIntegrationJson({ z: [true, { b: 2, a: 1 }], a: "x" }),
    ).toBe('{"a":"x","z":[true,{"a":1,"b":2}]}');
    expect(() =>
      canonicalProductIntegrationJson({ missing: undefined }),
    ).toThrow("undefined");
  });

  it("requires versioned valid event and lease envelopes", () => {
    expect(
      unsignedIntegrationEvent({
        contractVersion: PRODUCT_INTEGRATION_CONTRACT_VERSION,
        eventId: "event-1",
        type: "entitlement.renewed",
        source: "platform",
        subject: { kind: "installation", id: "installation-1" },
        occurredAt: "2026-09-01T00:00:00.000Z",
        payloadVersion: 1,
        payload: {},
        keyId: "key-1",
      }),
    ).toMatchObject({ eventId: "event-1" });
    expect(
      unsignedEntitlementLease({
        contractVersion: PRODUCT_INTEGRATION_CONTRACT_VERSION,
        keyId: "key-1",
        installationId: "installation-1",
        accountOrganizationId: "account-1",
        sequence: 1,
        issuedAt: "2026-09-01T00:00:00.000Z",
        expiresAt: "2026-09-02T00:00:00.000Z",
        graceUntil: "2026-09-03T00:00:00.000Z",
        entitlements: {},
      }),
    ).toMatchObject({ sequence: 1 });
    expect(() =>
      unsignedEntitlementLease({
        contractVersion: PRODUCT_INTEGRATION_CONTRACT_VERSION,
        keyId: "key-1",
        installationId: "installation-1",
        accountOrganizationId: "account-1",
        sequence: 0,
        issuedAt: "2026-09-01T00:00:00.000Z",
        expiresAt: "2026-09-02T00:00:00.000Z",
        graceUntil: "2026-09-01T00:00:00.000Z",
        entitlements: {},
      }),
    ).toThrow("invalid");
  });
});

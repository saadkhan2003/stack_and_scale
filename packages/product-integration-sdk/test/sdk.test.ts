import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { canonicalProductIntegrationJson, PRODUCT_INTEGRATION_CONTRACT_VERSION, type EntitlementLease, type ProductIntegrationEvent } from "@stack-and-scale/contracts";
import { EventDeduplicator, OfflineLeaseStore, ProductIntegrationClient } from "../src/index.js";

const pair = generateKeyPairSync("ed25519");
const publicKeys = { "key-1": pair.publicKey.export({ format: "pem", type: "spki" }).toString() };
function lease(sequence: number): EntitlementLease { const unsigned = { contractVersion: PRODUCT_INTEGRATION_CONTRACT_VERSION, keyId: "key-1", installationId: "installation-1", accountOrganizationId: "account-1", sequence, issuedAt: "2026-09-01T00:00:00.000Z", expiresAt: "2026-09-02T00:00:00.000Z", graceUntil: "2026-09-03T00:00:00.000Z", entitlements: { offline: true } }; return { ...unsigned, signature: sign(null, Buffer.from(canonicalProductIntegrationJson(unsigned)), pair.privateKey).toString("base64url") }; }

describe("product integration SDK", () => {
  it("verifies leases, enforces monotonic sequence, and uses bounded grace", () => {
    const store = new OfflineLeaseStore(); store.accept(lease(2), publicKeys);
    expect(store.status(new Date("2026-09-01T12:00:00.000Z"))).toBe("valid");
    expect(store.status(new Date("2026-09-02T12:00:00.000Z"))).toBe("grace");
    expect(store.entitlements(new Date("2026-09-03T12:00:00.000Z"))).toEqual({});
    expect(() => store.accept(lease(1), publicKeys)).toThrow("advance");
    expect(() => new OfflineLeaseStore().accept(lease(3), { "key-1": { publicKey: publicKeys["key-1"], status: "revoked" } })).toThrow("revoked");
  });

  it("verifies and deduplicates signed unordered events", () => {
    const unsigned = { contractVersion: PRODUCT_INTEGRATION_CONTRACT_VERSION, eventId: "event-1", type: "entitlement.lease_issued", source: "platform" as const, subject: { kind: "installation" as const, id: "installation-1" }, occurredAt: "2026-09-01T00:00:00.000Z", payloadVersion: 1 as const, payload: {}, keyId: "key-1" };
    const event: ProductIntegrationEvent = { ...unsigned, signature: sign(null, Buffer.from(canonicalProductIntegrationJson(unsigned)), pair.privateKey).toString("base64url") };
    const deduplicator = new EventDeduplicator(); expect(deduplicator.accept(event, publicKeys)).toBe(true); expect(deduplicator.accept(event, publicKeys)).toBe(false);
    const reordered: ProductIntegrationEvent = { ...event, eventId: "event-0", signature: sign(null, Buffer.from(canonicalProductIntegrationJson({ ...unsigned, eventId: "event-0" })), pair.privateKey).toString("base64url") };
    expect(deduplicator.accept(reordered, publicKeys)).toBe(true);
    expect(() => new EventDeduplicator().accept({ ...event, signature: "tampered" }, publicKeys)).toThrow("invalid");
  });

  it("retries transport failures without embedding credentials", async () => {
    let calls = 0; const client = new ProductIntegrationClient({ request: () => { calls += 1; return calls < 3 ? Promise.reject(new Error("offline")) : Promise.resolve({ ok: true }); } });
    await expect(client.request("/lease", { method: "POST" })).resolves.toEqual({ ok: true }); expect(calls).toBe(3);
  });
});

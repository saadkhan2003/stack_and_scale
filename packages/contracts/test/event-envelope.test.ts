import { describe, expect, it } from "vitest";

import { createEventEnvelope } from "../src/index.js";

describe("createEventEnvelope", () => {
  it("creates a versioned, traceable event contract", () => {
    expect(
      createEventEnvelope({
        eventId: "evt_01JQ8G2M",
        eventType: "crm.lead.created",
        occurredAt: "2026-08-24T18:00:00.000Z",
        organizationId: "org_01JQ8G2M",
        payload: { leadId: "lead_01JQ8G2M" },
        correlationId: "req_01JQ8G2M",
      }),
    ).toMatchObject({
      eventId: "evt_01JQ8G2M",
      eventType: "crm.lead.created",
      schemaVersion: 1,
      organizationId: "org_01JQ8G2M",
      correlationId: "req_01JQ8G2M",
    });
  });

  it("rejects an event without a namespaced type or correlation id", () => {
    expect(() =>
      createEventEnvelope({
        eventId: "evt_01JQ8G2M",
        eventType: "created",
        occurredAt: "2026-08-24T18:00:00.000Z",
        payload: {},
        correlationId: "",
      }),
    ).toThrow("eventType must use domain.action format");
  });
});

import { describe, expect, it } from "vitest";

import { deliverLeadEmail, type EmailAdapter, type TransactionalEmail } from "../src/transactional-email.js";

class MemoryEmailAdapter implements EmailAdapter {
  public readonly sent: TransactionalEmail[] = [];
  public send(email: TransactionalEmail) { this.sent.push(email); return Promise.resolve(); }
}

describe("lead transactional email", () => {
  it("sends a visitor receipt and a minimal staff notification", async () => {
    const email = new MemoryEmailAdapter();
    await deliverLeadEmail({ id: "event-1", eventType: "crm.lead.created", attempts: 1, payload: { leadId: "lead-1" } }, { query: () => Promise.resolve({ rows: [{ name: "Ada", email: "ada@example.test", intake_type: "demo" }] }) }, email, "staff@example.test");
    expect(email.sent).toHaveLength(2);
    expect(email.sent[0]).toMatchObject({ to: "ada@example.test" });
    expect(email.sent[1]?.text).not.toContain("ada@example.test");
  });

  it("does not discard a delivery error", async () => {
    await expect(deliverLeadEmail({ id: "event-1", eventType: "crm.lead.created", attempts: 1, payload: {} }, { query: () => Promise.resolve({ rows: [] }) }, new MemoryEmailAdapter(), undefined)).rejects.toThrow("missing a lead ID");
  });
});

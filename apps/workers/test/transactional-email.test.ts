import { describe, expect, it } from "vitest";

import {
  deliverLeadEmail,
  type EmailAdapter,
  type TransactionalEmail,
} from "../src/transactional-email.js";

class MemoryEmailAdapter implements EmailAdapter {
  public readonly sent: TransactionalEmail[] = [];
  public send(email: TransactionalEmail) {
    this.sent.push(email);
    return Promise.resolve();
  }
}

describe("lead transactional email", () => {
  it("sends a visitor receipt and a minimal staff notification", async () => {
    const email = new MemoryEmailAdapter();
    await deliverLeadEmail(
      {
        id: "event-1",
        eventType: "crm.lead.created",
        attempts: 1,
        payload: { leadId: "lead-1" },
      },
      {
        query: () =>
          Promise.resolve({
            rows: [
              { name: "Ada", email: "ada@example.test", intake_type: "demo" },
            ],
          }),
      },
      email,
      "staff@example.test",
    );
    expect(email.sent).toHaveLength(2);
    expect(email.sent[0]).toMatchObject({ to: "ada@example.test" });
    expect(email.sent[1]?.text).not.toContain("ada@example.test");
  });

  it("does not discard a delivery error", async () => {
    await expect(
      deliverLeadEmail(
        {
          id: "event-1",
          eventType: "crm.lead.created",
          attempts: 1,
          payload: {},
        },
        { query: () => Promise.resolve({ rows: [] }) },
        new MemoryEmailAdapter(),
        undefined,
      ),
    ).rejects.toThrow("missing a lead ID");
  });

  it("delivers notification email and records the delivered state", async () => {
    const email = new MemoryEmailAdapter();
    const queries: string[] = [];
    await deliverLeadEmail(
      {
        id: "event-notification-1",
        eventType: "notification.email",
        attempts: 1,
        payload: { notificationId: "notification-1" },
      },
      {
        query: (query) => {
          queries.push(query);
          return Promise.resolve({
            rows: query.startsWith("SELECT")
              ? [
                  {
                    title: "MFA required",
                    body: "Review security.",
                    email: "staff@example.test",
                  },
                ]
              : [],
          });
        },
      },
      email,
      undefined,
    );
    expect(email.sent).toEqual([
      {
        to: "staff@example.test",
        subject: "MFA required",
        text: "Review security.",
      },
    ]);
    expect(queries.at(-1)).toContain("delivery_state = 'delivered'");
  });

  it("delivers an approved commercial communication and records its state", async () => {
    const email = new MemoryEmailAdapter();
    const queries: string[] = [];
    await deliverLeadEmail(
      {
        id: "event-communication-1",
        eventType: "communication.email",
        attempts: 1,
        payload: { communicationId: "communication-1" },
      },
      {
        query: (query) => {
          queries.push(query);
          return Promise.resolve({
            rows: query.startsWith("SELECT")
              ? [
                  {
                    subject: "Proposal ready",
                    body: "Please review.",
                    email: "customer@example.test",
                  },
                ]
              : [],
          });
        },
      },
      email,
      undefined,
    );
    expect(email.sent[0]).toEqual({
      to: "customer@example.test",
      subject: "Proposal ready",
      text: "Please review.",
    });
    expect(queries.at(-1)).toContain("commercial_communications");
  });
});

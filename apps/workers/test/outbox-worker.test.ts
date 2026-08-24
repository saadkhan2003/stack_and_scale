import { describe, expect, it } from "vitest";

import {
  authorizeDeadLetterReplay,
  runOutboxDeliveryCycle,
  type OutboxDeliveryRepository,
} from "../src/outbox-worker.js";

class FakeOutboxRepository implements OutboxDeliveryRepository {
  public state: "pending" | "processing" | "delivered" | "dead_letter" =
    "pending";
  public attempts = 0;
  public readonly log: string[] = [];

  async claimNext() {
    if (this.state !== "pending") {
      return null;
    }

    this.state = "processing";
    this.attempts += 1;
    this.log.push("claim:event-001");

    return {
      id: "event-001",
      eventType: "lead.created",
      payload: { leadId: "lead-001" },
      attempts: this.attempts,
    };
  }

  async markDelivered(eventId: string) {
    this.state = "delivered";
    this.log.push(`delivered:${eventId}`);
  }

  async releaseForRetry(eventId: string, delayMs: number, reason: string) {
    this.state = "pending";
    this.log.push(`retry:${eventId}:${delayMs}:${reason}`);
  }

  async markDeadLetter(eventId: string, reason: string) {
    this.state = "dead_letter";
    this.log.push(`dead-letter:${eventId}:${reason}`);
  }

  async authorizeReplay(eventId: string, approverId: string, reason: string) {
    this.state = "pending";
    this.log.push(`replay:${eventId}:${approverId}:${reason}`);
  }
}

describe("outbox worker delivery", () => {
  it("claims a pending event and marks it delivered after the handler succeeds", async () => {
    const repository = new FakeOutboxRepository();

    const result = await runOutboxDeliveryCycle(repository, async (event) => {
      expect(event.id).toBe("event-001");
    });

    expect(result).toEqual({
      processed: true,
      finalStatus: "delivered",
      eventId: "event-001",
    });
    expect(repository.log).toEqual(["claim:event-001", "delivered:event-001"]);
  });

  it("moves a repeatedly failing event to DLQ", async () => {
    const repository = new FakeOutboxRepository();

    const result = await runOutboxDeliveryCycle(
      repository,
      async () => {
        throw new Error("downstream unavailable");
      },
      { maxAttempts: 1, retryDelayMs: 25 },
    );

    expect(result).toEqual({
      processed: true,
      finalStatus: "dead_letter",
      eventId: "event-001",
    });
    expect(repository.log).toEqual([
      "claim:event-001",
      "dead-letter:event-001:downstream unavailable",
    ]);
  });

  it("requires explicit authorization before replaying a DLQ event", async () => {
    const repository = new FakeOutboxRepository();
    repository.state = "dead_letter";

    await expect(
      authorizeDeadLetterReplay(repository, {
        eventId: "event-001",
        approverId: "",
        reason: "retry after fix",
      }),
    ).rejects.toThrow("manual replay must include an approver");

    await authorizeDeadLetterReplay(repository, {
      eventId: "event-001",
      approverId: "ops-lead",
      reason: "retry after fix",
    });

    expect(repository.log).toEqual([
      "replay:event-001:ops-lead:retry after fix",
    ]);
  });
});

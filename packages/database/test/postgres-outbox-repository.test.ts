import { describe, expect, it } from "vitest";

import { PostgresOutboxRepository, type Queryable } from "../src/index.js";

class RecordingOutboxClient implements Queryable {
  public readonly calls: Array<{ text: string; values: readonly unknown[] }> =
    [];

  public nextRows: Record<string, unknown>[] = [];

  query(text: string, values: readonly unknown[] = []) {
    this.calls.push({ text, values });
    const rows = this.nextRows;
    this.nextRows = [];

    return Promise.resolve({ rows });
  }
}

describe("PostgresOutboxRepository", () => {
  it("claims the next pending event with a database lock-safe update", async () => {
    const client = new RecordingOutboxClient();
    client.nextRows = [
      {
        id: "event-001",
        event_type: "lead.created",
        payload: { leadId: "lead-001" },
        attempts: 2,
      },
    ];
    const repository = new PostgresOutboxRepository(client);

    const event = await repository.claimNext();

    expect(event).toEqual({
      id: "event-001",
      eventType: "lead.created",
      payload: { leadId: "lead-001" },
      attempts: 2,
    });
    expect(client.calls[0]?.text).toContain("FOR UPDATE SKIP LOCKED");
    expect(client.calls[0]?.text).toContain("RETURNING id, event_type, payload, attempts");
  });

  it("persists terminal delivery, retry, dead-letter and authorized replay states", async () => {
    const client = new RecordingOutboxClient();
    const repository = new PostgresOutboxRepository(client);

    await repository.markDelivered("event-001");
    await repository.releaseForRetry("event-002", 1500, "temporary outage");
    await repository.markDeadLetter("event-003", "contract rejected");
    await repository.authorizeReplay(
      "event-004",
      "ops-lead",
      "fixed destination contract",
    );

    expect(client.calls.map((call) => call.values)).toEqual([
      ["event-001"],
      ["event-002", 1500, "temporary outage"],
      ["event-003", "contract rejected"],
      ["event-004", "ops-lead", "fixed destination contract"],
    ]);
    expect(client.calls[0]?.text).toContain("delivered_at = now()");
    expect(client.calls[1]?.text).toContain("available_at = now() +");
    expect(client.calls[2]?.text).toContain("dead_lettered_at = now()");
    expect(client.calls[3]?.text).toContain("replay_authorized_by = $2");
  });
});

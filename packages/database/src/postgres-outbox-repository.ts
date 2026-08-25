import type { Queryable } from "./queryable.js";

export type PostgresOutboxEvent = Readonly<{
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  attempts: number;
}>;

export class PostgresOutboxRepository {
  public constructor(private readonly client: Queryable) {}

  public async claimNext(): Promise<PostgresOutboxEvent | null> {
    const result = await this.client.query(
      `UPDATE platform.outbox_events
      SET
        status = 'processing',
        attempts = attempts + 1,
        locked_at = now(),
        last_error = NULL
      WHERE id = (
        SELECT id
        FROM platform.outbox_events
        WHERE status = 'pending'
          AND available_at <= now()
        ORDER BY available_at ASC, created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING id, event_type, payload, attempts`,
    );

    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }

    return {
      id: String(row["id"]),
      eventType: String(row["event_type"]),
      payload: toPayload(row["payload"]),
      attempts: Number(row["attempts"]),
    };
  }

  public async markDelivered(eventId: string): Promise<void> {
    await this.client.query(
      `UPDATE platform.outbox_events
      SET
        status = 'delivered',
        delivered_at = now(),
        locked_at = NULL,
        last_error = NULL
      WHERE id = $1`,
      [eventId],
    );
  }

  public async releaseForRetry(
    eventId: string,
    delayMs: number,
    reason: string,
  ): Promise<void> {
    await this.client.query(
      `UPDATE platform.outbox_events
      SET
        status = 'pending',
        available_at = now() + ($2::integer * interval '1 millisecond'),
        locked_at = NULL,
        last_error = $3
      WHERE id = $1`,
      [eventId, delayMs, reason],
    );
  }

  public async markDeadLetter(eventId: string, reason: string): Promise<void> {
    await this.client.query(
      `UPDATE platform.outbox_events
      SET
        status = 'dead_letter',
        dead_lettered_at = now(),
        locked_at = NULL,
        last_error = $2
      WHERE id = $1`,
      [eventId, reason],
    );
  }

  public async authorizeReplay(
    eventId: string,
    approverId: string,
    reason: string,
  ): Promise<void> {
    await this.client.query(
      `UPDATE platform.outbox_events
      SET
        status = 'pending',
        available_at = now(),
        replay_authorized_by = $2,
        replay_authorized_at = now(),
        replay_reason = $3,
        locked_at = NULL
      WHERE id = $1
        AND status = 'dead_letter'`,
      [eventId, approverId, reason],
    );
  }
}

function toPayload(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

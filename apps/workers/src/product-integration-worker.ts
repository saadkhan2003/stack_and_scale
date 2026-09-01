import type { Queryable } from "@stack-and-scale/database";

/** Retains only bounded operational integration data; durable conflict evidence is preserved. */
export async function runProductIntegrationRetentionCycle(database: Queryable): Promise<{ heartbeats: number; deliveries: number }> {
  const heartbeats = await database.query(`DELETE FROM product.installation_heartbeats WHERE received_at < now() - interval '30 days' RETURNING id`);
  const deliveries = await database.query(`DELETE FROM product.integration_event_deliveries delivery USING product.integration_events event WHERE delivery.event_id = event.id AND delivery.status = 'delivered' AND event.created_at < now() - interval '30 days' RETURNING delivery.id`);
  return { heartbeats: heartbeats.rows.length, deliveries: deliveries.rows.length };
}

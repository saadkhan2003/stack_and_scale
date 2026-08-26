import { createPostgresPoolFromEnv, PostgresOutboxRepository } from "@stack-and-scale/database";

import { runOutboxDeliveryCycle } from "./outbox-worker.js";
import { createEmailAdapter, deliverLeadEmail } from "./transactional-email.js";

const pool = createPostgresPoolFromEnv();
const repository = new PostgresOutboxRepository(pool);
const pollMs = Number.parseInt(process.env["WORKER_POLL_MS"] ?? "5000", 10);
let stopping = false;

process.once("SIGTERM", () => { stopping = true; });
process.once("SIGINT", () => { stopping = true; });

try {
  while (!stopping) {
    const result = await runOutboxDeliveryCycle(repository, (event) =>
      deliverLeadEmail(event, pool, createEmailAdapter(), process.env["CRM_NOTIFICATION_EMAIL"]),
    );
    console.info(JSON.stringify(result));
    if (!result.processed && !stopping) await delay(Number.isFinite(pollMs) && pollMs > 0 ? pollMs : 5000);
  }
} finally {
  await pool.end();
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

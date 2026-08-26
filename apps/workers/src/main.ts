import { createPostgresPoolFromEnv, PostgresOutboxRepository } from "@stack-and-scale/database";

import { runOutboxDeliveryCycle } from "./outbox-worker.js";
import { createEmailAdapter, deliverLeadEmail } from "./transactional-email.js";

const pool = createPostgresPoolFromEnv();
const repository = new PostgresOutboxRepository(pool);

try {
  const result = await runOutboxDeliveryCycle(repository, (event) =>
    deliverLeadEmail(event, pool, createEmailAdapter(), process.env["CRM_NOTIFICATION_EMAIL"]),
  );
  console.info(JSON.stringify(result));
} finally {
  await pool.end();
}

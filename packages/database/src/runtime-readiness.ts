import type { Queryable } from "./queryable.js";

export type DatabaseReadinessStatus = "ready" | "not_ready";
export type DatabaseReadinessCheck = "up" | "missing" | "down";

export type DatabaseReadiness = Readonly<{
  status: DatabaseReadinessStatus;
  checks: Readonly<{
    database: "up" | "down";
    migrations: DatabaseReadinessCheck;
    outbox: DatabaseReadinessCheck;
    privacy: DatabaseReadinessCheck;
  }>;
}>;

const requiredTables = {
  migrations: "platform.schema_migrations",
  outbox: "platform.outbox_events",
  privacy: "platform.privacy_requests",
} as const;

export async function checkDatabaseReadiness(
  client: Queryable,
): Promise<DatabaseReadiness> {
  try {
    const [migrations, outbox, privacy] = await Promise.all([
      tableExists(client, requiredTables.migrations),
      tableExists(client, requiredTables.outbox),
      tableExists(client, requiredTables.privacy),
    ]);

    const checks = {
      database: "up" as const,
      migrations,
      outbox,
      privacy,
    };

    return {
      status:
        checks.migrations === "up" &&
        checks.outbox === "up" &&
        checks.privacy === "up"
          ? "ready"
          : "not_ready",
      checks,
    };
  } catch {
    return {
      status: "not_ready",
      checks: {
        database: "down",
        migrations: "down",
        outbox: "down",
        privacy: "down",
      },
    };
  }
}

async function tableExists(
  client: Queryable,
  tableName: string,
): Promise<DatabaseReadinessCheck> {
  const result = await client.query("SELECT to_regclass($1) AS regclass", [
    tableName,
  ]);

  return result.rows[0]?.["regclass"] === null ? "missing" : "up";
}

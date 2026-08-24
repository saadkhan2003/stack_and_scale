import { describe, expect, it } from "vitest";

import { checkDatabaseReadiness, type Queryable } from "../src/index.js";

function createQueryable(
  registry: Record<string, string | null>,
): Queryable<{ regclass: string | null }> {
  return {
    async query(_text, values) {
      const tableName = String(values?.[0] ?? "");

      return {
        rows: [{ regclass: registry[tableName] ?? null }],
      };
    },
  };
}

describe("checkDatabaseReadiness", () => {
  it("reports ready when migration, outbox and privacy tables exist", async () => {
    const result = await checkDatabaseReadiness(
      createQueryable({
        "platform.schema_migrations": "platform.schema_migrations",
        "platform.outbox_events": "platform.outbox_events",
        "platform.privacy_requests": "platform.privacy_requests",
      }),
    );

    expect(result).toEqual({
      status: "ready",
      checks: {
        database: "up",
        migrations: "up",
        outbox: "up",
        privacy: "up",
      },
    });
  });

  it("fails closed when a required runtime table is missing", async () => {
    const result = await checkDatabaseReadiness(
      createQueryable({
        "platform.schema_migrations": "platform.schema_migrations",
        "platform.outbox_events": "platform.outbox_events",
      }),
    );

    expect(result).toEqual({
      status: "not_ready",
      checks: {
        database: "up",
        migrations: "up",
        outbox: "up",
        privacy: "missing",
      },
    });
  });
});

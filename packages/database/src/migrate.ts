import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { createPostgresPoolFromEnv, type DatabasePool } from "./postgres.js";

const migrationsDirectory = new URL("../migrations", import.meta.url);

export function getMigrationName(filePath: string): string {
  return basename(filePath);
}

export function shouldApplyMigration(
  migrationName: string,
  appliedMigrations: readonly string[],
): boolean {
  return !appliedMigrations.includes(migrationName);
}

export async function runMigrations(
  client: DatabasePool = createPostgresPoolFromEnv(),
): Promise<readonly string[]> {
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS platform");
    await client.query(`CREATE TABLE IF NOT EXISTS platform.schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

    const applied = await getAppliedMigrations(client);
    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((fileName) => fileName.endsWith(".sql"))
      .sort();
    const appliedNow: string[] = [];

    for (const migrationFile of migrationFiles) {
      const migrationName = getMigrationName(migrationFile);
      if (!shouldApplyMigration(migrationName, applied)) {
        continue;
      }

      const sql = await readFile(
        join(migrationsDirectory.pathname, migrationFile),
        "utf8",
      );
      await client.query(sql);
      await client.query(
        "INSERT INTO platform.schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [migrationName],
      );
      appliedNow.push(migrationName);
    }

    return appliedNow;
  } finally {
    await client.end();
  }
}

async function getAppliedMigrations(
  client: DatabasePool,
): Promise<readonly string[]> {
  const result = await client.query(
    "SELECT name FROM platform.schema_migrations ORDER BY name",
  );

  return result.rows.map((row) => String(row["name"]));
}

if (
  process.argv[1] !== undefined &&
  import.meta.url.endsWith(process.argv[1])
) {
  const applied = await runMigrations();
  console.info(
    applied.length === 0
      ? "No pending migrations."
      : `Applied migrations: ${applied.join(", ")}`,
  );
}

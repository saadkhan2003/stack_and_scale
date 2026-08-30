import pg from "pg";

import type { Queryable } from "./queryable.js";

const { Pool } = pg;

export type DatabaseConnectionOptions = Readonly<{
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}>;

export type DatabasePool = Queryable &
  Readonly<{
    end(): Promise<void>;
    transaction<T>(work: (client: Queryable) => Promise<T>): Promise<T>;
  }>;

export function createPostgresPool(
  options: DatabaseConnectionOptions = {},
): DatabasePool {
  const pool = new Pool({
    connectionString: options.connectionString,
    host: options.host,
    port: options.port,
    database: options.database,
    user: options.user,
    password: options.password,
  });
  return {
    query: async (text, values) =>
      (await pool.query(text, values as unknown[])) as {
        rows: Record<string, unknown>[];
      },
    end: () => pool.end(),
    transaction: async <T>(work: (client: Queryable) => Promise<T>) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

export function createPostgresPoolFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): DatabasePool {
  const connectionString = env["DATABASE_URL"];
  if (connectionString !== undefined && connectionString.length > 0) {
    return createPostgresPool({ connectionString });
  }

  return createPostgresPool({
    host: env["POSTGRES_HOST"] ?? "127.0.0.1",
    port: Number.parseInt(env["POSTGRES_PORT"] ?? "5433", 10),
    database: env["POSTGRES_DB"] ?? "stack_and_scale",
    user: env["POSTGRES_USER"] ?? "stack_and_scale",
    password: env["POSTGRES_PASSWORD"] ?? "local-development-only",
  });
}

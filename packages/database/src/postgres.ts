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
  }>;

export function createPostgresPool(
  options: DatabaseConnectionOptions = {},
): DatabasePool {
  return new Pool({
    connectionString: options.connectionString,
    host: options.host,
    port: options.port,
    database: options.database,
    user: options.user,
    password: options.password,
  });
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

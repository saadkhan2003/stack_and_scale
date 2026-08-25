import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createPostgresPoolFromEnv,
  type DatabasePool,
} from "@stack-and-scale/database";

import { AppModule } from "../src/app.module.js";

const KEYCLOAK_BASE =
  process.env["KEYCLOAK_BASE_URL"] ?? "http://localhost:8084";
const REALM = "stack-and-scale";
const ISSUER = `${KEYCLOAK_BASE}/realms/${REALM}`;
const E2E_SUBJECT = "local-e2e-member-sub";
const ORG_ID = "org-keycloak-e2e";

const runLive = process.env["KEYCLOAK_E2E"] === "1";

describe.skipIf(!runLive)("live Keycloak sign-in", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  let accessToken: string;

  beforeAll(async () => {
    const tokenResponse = await fetch(
      `${ISSUER}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: "web",
          username: "test-user",
          password: "local-development-only",
        }),
      },
    );
    expect(tokenResponse.status).toBe(200);
    accessToken = ((await tokenResponse.json()) as { access_token: string })
      .access_token;

    process.env["STACK_AND_SCALE_OIDC_ISSUER"] = ISSUER;
    process.env["STACK_AND_SCALE_OIDC_AUDIENCE"] = "web";
    process.env["STACK_AND_SCALE_DEV_ACTOR_HEADER"] = "false";

    await runMigrationsSafe();

    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO platform.organizations (id, name) VALUES ($1, 'Keycloak E2E Org')
       ON CONFLICT (id) DO NOTHING`,
      [ORG_ID],
    );
    await pool.query(
      `INSERT INTO identity.users (id, external_subject, email) VALUES
         ('user-keycloak-e2e', $1, 'test-user@example.local')
       ON CONFLICT (id) DO NOTHING`,
      [E2E_SUBJECT],
    );
    await pool.query(
      `INSERT INTO identity.memberships (id, user_id, organization_id, role, status)
         VALUES ('ms-keycloak-e2e', 'user-keycloak-e2e', $1, 'member', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [ORG_ID],
    );

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (pool) {
      await pool.end();
    }
  });

  it("authenticates a real Keycloak bearer token on a protected route", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_ID}/members`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ data: { id: string }[] }>();
    expect(body.data.map((member) => member.id)).toEqual(["user-keycloak-e2e"]);
  });

  it("rejects the development actor header when OIDC mode is enforced", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_ID}/members`,
      headers: { "x-actor-id": "user-keycloak-e2e" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects a tampered bearer token", async () => {
    const tampered = `${accessToken.slice(0, -3)}abc`;
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/sessions`,
      headers: { authorization: `Bearer ${tampered}` },
    });

    expect(response.statusCode).toBe(401);
  });
});

async function runMigrationsSafe(): Promise<void> {
  const { runMigrations } = await import("@stack-and-scale/database");
  await runMigrations().catch(() => undefined);
}

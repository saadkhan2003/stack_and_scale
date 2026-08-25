import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";
import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";

const ORG_A = "org-direct-api-a";
const MEMBER = "user-direct-member";
const OUTSIDER = "user-direct-outsider";

describe("direct API access", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;

  beforeAll(async () => {
    await runMigrations();

    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO platform.organizations (id, name) VALUES ($1, 'Direct Org A')
       ON CONFLICT (id) DO NOTHING`,
      [ORG_A],
    );
    await pool.query(
      `INSERT INTO identity.users (id, external_subject, email) VALUES
         ($1, $1, 'direct-member@example.test'),
         ($2, $2, 'direct-outsider@example.test')
       ON CONFLICT (id) DO NOTHING`,
      [MEMBER, OUTSIDER],
    );
    await pool.query(
      `INSERT INTO identity.memberships (id, user_id, organization_id, role, status) VALUES
         ('msw-direct-member', $1, $2, 'member', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [MEMBER, ORG_A],
    );

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("treats hidden UI routes as no API access for outsiders", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/organizations/some-hidden-ui-resource",
      headers: { "x-actor-id": OUTSIDER },
    });

    expect([403, 404]).toContain(response.statusCode);
    const body = response.json<{ error: { code: string; message: string } }>();
    expect(body.error.code).toBeTruthy();
    expect(body.error.message).toBeTruthy();
  });

  it("returns the same envelope for outsider vs member on unknown paths", async () => {
    const outsider = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/unknown-subresource`,
      headers: { "x-actor-id": OUTSIDER },
    });
    const member = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/unknown-subresource`,
      headers: { "x-actor-id": MEMBER },
    });

    expect(outsider.statusCode).toBe(member.statusCode);
    expect(outsider.json<{ error: unknown }>().error).toEqual(
      member.json<{ error: unknown }>().error,
    );
  });

  it("rejects method mismatch without leaking internals", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_A}/members`,
      headers: { "x-actor-id": MEMBER },
      payload: {},
    });

    expect([403, 404, 405]).toContain(response.statusCode);
    const body = response.json<{
      error?: { message?: string };
      stack?: unknown;
    }>();
    expect(body.stack).toBeUndefined();
  });

  it("does not grant member-level users access to admin-only surfaces via unknown paths", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/audit-log`,
      headers: { "x-actor-id": MEMBER },
    });

    expect([403, 404]).toContain(response.statusCode);
  });
});

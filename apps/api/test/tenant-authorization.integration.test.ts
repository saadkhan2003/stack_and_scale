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

const ORG_A = "org-auth-test-a";
const ORG_B = "org-auth-test-b";
const OWNER_A = "user-owner-a";
const MEMBER_B = "user-member-b";
const SUSPENDED_B = "user-suspended-b";
const OUTSIDER = "user-outsider";

describe("tenant-safe authorization", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;

  beforeAll(async () => {
    await runMigrations();

    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO platform.organizations (id, name) VALUES
         ($1, 'Org A'), ($2, 'Org B')
       ON CONFLICT (id) DO NOTHING`,
      [ORG_A, ORG_B],
    );
    await pool.query(
      `INSERT INTO identity.users (id, external_subject, email) VALUES
         ($1, $1, 'owner-a@example.test'),
         ($2, $2, 'member-b@example.test'),
         ($3, $3, 'suspended-b@example.test'),
         ($4, $4, 'outsider@example.test')
       ON CONFLICT (id) DO NOTHING`,
      [OWNER_A, MEMBER_B, SUSPENDED_B, OUTSIDER],
    );
    await pool.query(
      `INSERT INTO identity.memberships (id, user_id, organization_id, role, status) VALUES
         ('msw-owner-a', $1, $2, 'owner', 'active'),
         ('msw-member-b', $3, $4, 'manager', 'active'),
         ('msw-susp-b', $5, $4, 'manager', 'suspended')
       ON CONFLICT (id) DO NOTHING`,
      [OWNER_A, ORG_A, MEMBER_B, ORG_B, SUSPENDED_B],
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

  it("rejects unauthenticated requests with 401", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/members`,
    });

    expect(response.statusCode).toBe(401);
  });

  it("denies an actor without membership the same as an unknown organization", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/members`,
      headers: { "x-actor-id": OUTSIDER },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: {
        code: "FORBIDDEN",
        message: "You do not have access to this resource.",
      },
    });
  });

  it("denies cross-tenant access without disclosing record existence", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/members`,
      headers: { "x-actor-id": MEMBER_B },
    });

    expect(response.statusCode).toBe(403);

    const missing = await fastify.inject({
      method: "GET",
      url: "/api/v1/organizations/org-does-not-exist/members",
      headers: { "x-actor-id": MEMBER_B },
    });
    expect(missing.statusCode).toBe(403);
    expect(missing.json<{ error: unknown }>().error).toEqual(
      response.json<{ error: unknown }>().error,
    );
  });

  it("denies suspended members even for their own organization", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_B}/members`,
      headers: { "x-actor-id": SUSPENDED_B },
    });

    expect(response.statusCode).toBe(403);
  });

  it("returns only the requesting organization's members for an authorized actor", async () => {
    const responseA = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_A}/members`,
      headers: { "x-actor-id": OWNER_A },
    });
    expect(responseA.statusCode).toBe(200);
    const bodyA = responseA.json<{ data: { id: string }[] }>();
    expect(bodyA.data.map((member) => member.id)).toEqual([OWNER_A]);

    const responseB = await fastify.inject({
      method: "GET",
      url: `/api/v1/organizations/${ORG_B}/members`,
      headers: { "x-actor-id": MEMBER_B },
    });
    expect(responseB.statusCode).toBe(200);
    const bodyB = responseB.json<{ data: { id: string }[] }>();
    expect(bodyB.data.map((member) => member.id)).toEqual([MEMBER_B]);
  });
});

import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ApiExceptionFilter } from "../src/common/http/api-exception.filter.js";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash, randomBytes } from "node:crypto";

import { InvitationModule } from "../src/identity/invitations/invitation.module.js";
import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";

const ORG_INV = "org-inv-test-a";
const OWNER = "user-inv-owner";
const MANAGER = "user-inv-manager";
const NEWCOMER = "user-inv-newcomer";

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

describe("invitation lifecycle", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;

  beforeAll(async () => {
    await runMigrations();

    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO platform.organizations (id, name) VALUES ($1, 'Inv Org')
       ON CONFLICT (id) DO NOTHING`,
      [ORG_INV],
    );
    await pool.query(
      `INSERT INTO identity.users (id, external_subject, email) VALUES
         ($1, $1, 'inv-owner@example.test'),
         ($2, $2, 'inv-manager@example.test'),
         ($3, $3, 'inv-newcomer@example.test')
       ON CONFLICT (id) DO NOTHING`,
      [OWNER, MANAGER, NEWCOMER],
    );
    await pool.query(
      `INSERT INTO identity.memberships (id, user_id, organization_id, role, status) VALUES
         ('ms-inv-owner', $1, $2, 'owner', 'active'),
         ('ms-inv-manager', $3, $4, 'manager', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [OWNER, ORG_INV, MANAGER, ORG_INV],
    );
    await pool.query(
      `DELETE FROM identity.invitations WHERE organization_id = $1`,
      [ORG_INV],
    );
    await pool.query(
      `DELETE FROM identity.memberships
        WHERE organization_id = $1 AND user_id = $2`,
      [ORG_INV, NEWCOMER],
    );

    const module = await Test.createTestingModule({
      imports: [InvitationModule],
      providers: [
        {
          provide: APP_FILTER,
          useClass: ApiExceptionFilter,
        },
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("denies creation without authentication with 401", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_INV}/invitations`,
      payload: { email: "nobody@example.test", role: "member" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("denies a manager assigning a role above their assignability with 403", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_INV}/invitations`,
      headers: { "x-actor-id": MANAGER },
      payload: { email: "elevated@example.test", role: "admin" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: {
        code: "FORBIDDEN",
        message: "You do not have access to this resource.",
      },
    });
  });

  it("creates an invitation and returns the raw token once", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_INV}/invitations`,
      headers: { "x-actor-id": OWNER },
      payload: { email: "newcomer@example.test", role: "member" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<{ data: { id: string; token: string } }>();
    expect(body.data.token.length).toBeGreaterThan(20);

    const stored = await pool.query(
      `SELECT token_hash FROM identity.invitations WHERE id = $1`,
      [body.data.id],
    );
    expect(stored.rows[0]?.["token_hash"]).toBe(tokenHash(body.data.token));
  });

  it("rejects a duplicate pending invitation for the same organization and email", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_INV}/invitations`,
      headers: { "x-actor-id": OWNER },
      payload: { email: "NEWCOMER@example.test", role: "member" },
    });

    expect(response.statusCode).toBe(409);
  });

  it("accepts a valid invitation once and grants membership", async () => {
    const created = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_INV}/invitations`,
      headers: { "x-actor-id": OWNER },
      payload: { email: "accept-me@example.test", role: "member" },
    });
    expect(created.statusCode).toBe(201);
    const { id, token } = created.json<{
      data: { id: string; token: string };
    }>().data;

    const accepted = await fastify.inject({
      method: "POST",
      url: `/api/v1/invitations/${id}/accept`,
      headers: { "x-actor-id": NEWCOMER },
      payload: { token },
    });
    expect(accepted.statusCode).toBe(201);

    const membership = await pool.query(
      `SELECT status FROM identity.memberships
        WHERE user_id = $1 AND organization_id = $2`,
      [NEWCOMER, ORG_INV],
    );
    expect(membership.rows[0]?.["status"]).toBe("active");
  });

  it("denies replay of a consumed invitation identically to an expired one", async () => {
    const created = await fastify.inject({
      method: "POST",
      url: `/api/v1/organizations/${ORG_INV}/invitations`,
      headers: { "x-actor-id": OWNER },
      payload: { email: "replay@example.test", role: "member" },
    });
    const { id, token } = created.json<{
      data: { id: string; token: string };
    }>().data;

    const first = await fastify.inject({
      method: "POST",
      url: `/api/v1/invitations/${id}/accept`,
      headers: { "x-actor-id": NEWCOMER },
      payload: { token },
    });
    expect(first.statusCode).toBe(201);

    const replay = await fastify.inject({
      method: "POST",
      url: `/api/v1/invitations/${id}/accept`,
      headers: { "x-actor-id": NEWCOMER },
      payload: { token },
    });
    expect(replay.statusCode).toBe(403);

    const expiredId = `inv-${randomBytes(12).toString("hex")}`;
    await pool.query(
      `INSERT INTO identity.invitations
           (id, organization_id, email, role, token_hash, status, invited_by_user_id, expires_at)
         VALUES ($1, $2, 'expired@example.test', 'member', $3, 'pending', $4, now() - interval '1 hour')`,
      [
        expiredId,
        ORG_INV,
        tokenHash(randomBytes(32).toString("base64url")),
        OWNER,
      ],
    );

    const expired = await fastify.inject({
      method: "POST",
      url: `/api/v1/invitations/${expiredId}/accept`,
      headers: { "x-actor-id": NEWCOMER },
      payload: { token: randomBytes(32).toString("base64url") },
    });
    expect(expired.statusCode).toBe(403);
    expect(replay.json<{ error: unknown }>().error).toEqual(
      expired.json<{ error: unknown }>().error,
    );
  });
});

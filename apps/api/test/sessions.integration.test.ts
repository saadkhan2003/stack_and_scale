import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";

import { SessionModule } from "../src/identity/sessions/session.module.js";

const ACTOR = "user-sess-actor";
const OTHER = "user-sess-other";
const OWN_ACTIVE = "sess-ws05-own-active";
const OWN_EXPIRED = "sess-ws05-own-expired";
const OWN_TO_REVOKE = "sess-ws05-own-revoke";
const FOREIGN_ACTIVE = "sess-ws05-foreign-active";
const FOREIGN_REVOKED = "sess-ws05-foreign-revoked";

describe("session lifecycle", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;

  beforeAll(async () => {
    await runMigrations();

    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO identity.users (id, external_subject, email) VALUES
         ($1, $1, 'sess-actor@example.test'),
         ($2, $2, 'sess-other@example.test')
       ON CONFLICT (id) DO NOTHING`,
      [ACTOR, OTHER],
    );
    await pool.query(
      `DELETE FROM identity.sessions WHERE id IN ($1, $2, $3, $4, $5)`,
      [OWN_ACTIVE, OWN_EXPIRED, OWN_TO_REVOKE, FOREIGN_ACTIVE, FOREIGN_REVOKED],
    );
    await pool.query(
      `INSERT INTO identity.sessions (id, user_id, status, expires_at) VALUES
         ($1, $2, 'active', now() + interval '12 hours'),
         ($3, $2, 'expired', now() - interval '1 hour'),
         ($4, $2, 'active', now() + interval '12 hours'),
         ($5, $6, 'active', now() + interval '12 hours'),
         ($7, $8, 'revoked', now() + interval '12 hours')`,
      [
        OWN_ACTIVE,
        ACTOR,
        OWN_EXPIRED,
        OWN_TO_REVOKE,
        FOREIGN_ACTIVE,
        OTHER,
        FOREIGN_REVOKED,
        OTHER,
      ],
    );

    const module = await Test.createTestingModule({
      imports: [SessionModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("rejects unauthenticated session listing with 401", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/sessions",
    });

    expect(response.statusCode).toBe(401);
  });

  it("lists only the actor's own active sessions and never exposes tokens", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/sessions",
      headers: { "x-actor-id": ACTOR },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      data: { id: string; token?: string }[];
    }>();
    expect(body.data.map((session) => session.id).sort()).toEqual([
      OWN_ACTIVE,
      OWN_TO_REVOKE,
    ]);
    for (const session of body.data) {
      expect(session).not.toHaveProperty("token");
    }
    expect(JSON.stringify(body)).not.toContain("token");
  });

  it("excludes expired sessions from the listing", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/sessions",
      headers: { "x-actor-id": ACTOR },
    });

    const body = response.json<{ data: { id: string; expiresAt: string }[] }>();
    expect(body.data.some((session) => session.id === OWN_EXPIRED)).toBe(false);
    for (const session of body.data) {
      expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
    }
  });

  it("revokes the actor's own session", async () => {
    const response = await fastify.inject({
      method: "DELETE",
      url: `/api/v1/sessions/${OWN_TO_REVOKE}`,
      headers: { "x-actor-id": ACTOR },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ revoked: true });

    const result = await pool.query(
      "SELECT status, revoked_at FROM identity.sessions WHERE id = $1",
      [OWN_TO_REVOKE],
    );
    expect(result.rows[0]?.["status"]).toBe("revoked");
    expect(result.rows[0]?.["revoked_at"]).not.toBeNull();
  });

  it("denies revoking another actor's session without disclosing existence", async () => {
    const response = await fastify.inject({
      method: "DELETE",
      url: `/api/v1/sessions/${FOREIGN_ACTIVE}`,
      headers: { "x-actor-id": ACTOR },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json<{ error: unknown }>().error).toMatchObject({
      code: "NOT_FOUND",
      message: "Session not found.",
    });

    const result = await pool.query(
      "SELECT status FROM identity.sessions WHERE id = $1",
      [FOREIGN_ACTIVE],
    );
    expect(result.rows[0]?.["status"]).toBe("active");
  });

  it("no longer lists a revoked session after revocation", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/sessions",
      headers: { "x-actor-id": ACTOR },
    });

    const body = response.json<{ data: { id: string }[] }>();
    expect(body.data.some((session) => session.id === OWN_TO_REVOKE)).toBe(
      false,
    );

    const reuse = await fastify.inject({
      method: "DELETE",
      url: `/api/v1/sessions/${OWN_TO_REVOKE}`,
      headers: { "x-actor-id": ACTOR },
    });
    expect(reuse.statusCode).toBe(404);
  });

  it("never validates or returns a pre-existing revoked foreign session", async () => {
    const response = await fastify.inject({
      method: "DELETE",
      url: `/api/v1/sessions/${FOREIGN_REVOKED}`,
      headers: { "x-actor-id": ACTOR },
    });

    expect(response.statusCode).toBe(404);

    const otherList = await fastify.inject({
      method: "GET",
      url: "/api/v1/sessions",
      headers: { "x-actor-id": OTHER },
    });
    const body = otherList.json<{ data: { id: string }[] }>();
    expect(body.data.some((session) => session.id === FOREIGN_REVOKED)).toBe(
      false,
    );
  });
});

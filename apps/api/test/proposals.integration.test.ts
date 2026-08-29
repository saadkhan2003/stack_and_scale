import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { FastifyInstance } from "fastify";
import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";
import { AppModule } from "../src/app.module.js";

describe("tenant-scoped proposal workflow", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  const suffix = randomUUID();
  const organizationId = `org-proposal-${suffix}`;
  const managerId = `user-proposal-manager-${suffix}`;
  const ownerId = `user-proposal-owner-${suffix}`;
  const leadId = `lead-proposal-${suffix}`;

  beforeAll(async () => {
    process.env["CRM_ORGANIZATION_ID"] = organizationId;
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query(
      "INSERT INTO platform.organizations (id, name) VALUES ($1, 'Proposal test')",
      [organizationId],
    );
    await pool.query(
      "INSERT INTO identity.users (id, external_subject, email) VALUES ($1, $1, $3), ($2, $2, $4)",
      [
        managerId,
        ownerId,
        `${managerId}@example.test`,
        `${ownerId}@example.test`,
      ],
    );
    await pool.query(
      "INSERT INTO identity.memberships (id, user_id, organization_id, role) VALUES ($1, $2, $3, 'manager'), ($4, $5, $3, 'owner')",
      [
        `membership-${managerId}`,
        managerId,
        organizationId,
        `membership-${ownerId}`,
        ownerId,
      ],
    );
    await pool.query(
      "INSERT INTO platform.leads (id, organization_id, email, name, source, idempotency_key) VALUES ($1, $2, 'proposal@example.test', 'Proposal Lead', 'test', $3)",
      [leadId, organizationId, `proposal-${suffix}`],
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
    delete process.env["CRM_ORGANIZATION_ID"];
  });

  it("rejects mixed currencies and records approved, immutable, accepted versions", async () => {
    const invalid = await fastify.inject({
      method: "POST",
      url: "/api/v1/proposals",
      headers: { "x-actor-id": managerId },
      payload: {
        title: "Mixed",
        leadId,
        currency: "USD",
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86_400_000).toISOString(),
        lineItems: [
          {
            description: "EUR item",
            quantity: 1,
            unitPriceMinorUnits: 100,
            currency: "EUR",
          },
        ],
      },
    });
    expect(invalid.statusCode).toBe(409);

    const created = await fastify.inject({
      method: "POST",
      url: "/api/v1/proposals",
      headers: { "x-actor-id": managerId },
      payload: {
        title: "Implementation proposal",
        leadId,
        currency: "USD",
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86_400_000).toISOString(),
        lineItems: [
          {
            description: "Implementation",
            quantity: 1,
            unitPriceMinorUnits: 1005,
          },
          {
            description: "Optional support",
            quantity: 1,
            unitPriceMinorUnits: 250,
            optional: true,
          },
        ],
      },
    });
    expect(created.statusCode).toBe(201);
    const proposalId = created.json<{ data: { id: string } }>().data.id;
    expect(
      (
        await fastify.inject({
          method: "POST",
          url: `/api/v1/proposals/${proposalId}/versions/1/submit`,
          headers: { "x-actor-id": managerId },
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await fastify.inject({
          method: "POST",
          url: `/api/v1/proposals/${proposalId}/versions/1/approve`,
          headers: { "x-actor-id": ownerId },
          payload: { reason: "Reviewed" },
        })
      ).statusCode,
    ).toBe(201);
    const published = await fastify.inject({
      method: "POST",
      url: `/api/v1/proposals/${proposalId}/versions/1/publish`,
      headers: { "x-actor-id": managerId },
    });
    expect(published.statusCode).toBe(201);
    const publishedData = published.json<{ data: { publicToken: string } }>()
      .data;
    const viewed = await fastify.inject({
      method: "GET",
      url: `/api/v1/public/proposals/${publishedData.publicToken}`,
    });
    expect(viewed.statusCode).toBe(200);
    expect(
      viewed.json<{
        data: { version: number; totals: { subtotal: { minorUnits: number } } };
      }>().data,
    ).toMatchObject({ version: 1, totals: { subtotal: { minorUnits: 1005 } } });
    const accepted = await fastify.inject({
      method: "POST",
      url: `/api/v1/public/proposals/${publishedData.publicToken}/accept`,
      headers: { "content-type": "application/json" },
      payload: { name: "Recipient", email: "recipient@example.test" },
    });
    expect(accepted.statusCode).toBe(201);
    expect(
      accepted.json<{ data: { status: string; version: number } }>().data,
    ).toMatchObject({ status: "accepted", version: 1 });
    const issued = await pool.query(
      "SELECT id FROM platform.proposal_versions WHERE proposal_id = $1",
      [proposalId],
    );
    await expect(
      pool.query(
        "UPDATE platform.proposal_versions SET notes = 'tampered' WHERE id = $1",
        [issued.rows[0]?.["id"]],
      ),
    ).rejects.toThrow("immutable");

    const expired = await fastify.inject({
      method: "POST",
      url: "/api/v1/proposals",
      headers: { "x-actor-id": managerId },
      payload: {
        title: "Expired proposal",
        leadId,
        currency: "USD",
        validFrom: new Date(Date.now() - 172_800_000).toISOString(),
        validUntil: new Date(Date.now() - 86_400_000).toISOString(),
        lineItems: [
          {
            description: "Expired work",
            quantity: 1,
            unitPriceMinorUnits: 100,
          },
        ],
      },
    });
    const expiredId = expired.json<{ data: { id: string } }>().data.id;
    expect(
      (
        await fastify.inject({
          method: "POST",
          url: `/api/v1/proposals/${expiredId}/versions/1/submit`,
          headers: { "x-actor-id": managerId },
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await fastify.inject({
          method: "POST",
          url: `/api/v1/proposals/${expiredId}/versions/1/approve`,
          headers: { "x-actor-id": ownerId },
          payload: { reason: "Reviewed" },
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await fastify.inject({
          method: "POST",
          url: `/api/v1/proposals/${expiredId}/versions/1/publish`,
          headers: { "x-actor-id": managerId },
        })
      ).statusCode,
    ).toBe(409);
  });
});

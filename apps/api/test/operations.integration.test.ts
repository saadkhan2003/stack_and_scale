import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";

import { AppModule } from "../src/app.module.js";

describe("staff operations approvals and authorized search", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  const suffix = randomUUID();
  const organizationId = `org-operations-${suffix}`;
  const managerId = `user-operations-manager-${suffix}`;
  const adminId = `user-operations-admin-${suffix}`;
  const ownerId = `user-operations-owner-${suffix}`;
  const foreignOrg = `org-operations-foreign-${suffix}`;

  beforeAll(async () => {
    process.env["CRM_ORGANIZATION_ID"] = organizationId;
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query(
      "INSERT INTO platform.organizations (id, name) VALUES ($1, 'Operations'), ($2, 'Foreign') ON CONFLICT (id) DO NOTHING",
      [organizationId, foreignOrg],
    );
    await pool.query(
      "INSERT INTO identity.users (id, external_subject, email) VALUES ($1, $1, $4), ($2, $2, $5), ($3, $3, $6) ON CONFLICT (id) DO NOTHING",
      [
        managerId,
        adminId,
        ownerId,
        `${managerId}@example.test`,
        `${adminId}@example.test`,
        `${ownerId}@example.test`,
      ],
    );
    await pool.query(
      "INSERT INTO identity.memberships (id, user_id, organization_id, role) VALUES ($1, $2, $4, 'manager'), ($5, $3, $4, 'admin'), ($6, $7, $4, 'owner') ON CONFLICT (id) DO NOTHING",
      [
        `membership-${managerId}`,
        managerId,
        adminId,
        organizationId,
        `membership-${adminId}`,
        `membership-${ownerId}`,
        ownerId,
      ],
    );
    await pool.query(
      "INSERT INTO platform.leads (id, organization_id, email, name, source, idempotency_key) VALUES ($1, $2, 'visible@example.test', 'Visible Search Lead', 'test', $3), ($4, $5, 'foreign@example.test', 'Foreign Search Lead', 'test', $6)",
      [
        `lead-visible-${suffix}`,
        organizationId,
        `key-visible-${suffix}`,
        `lead-foreign-${suffix}`,
        foreignOrg,
        `key-foreign-${suffix}`,
      ],
    );
    await pool.query(
      "INSERT INTO platform.operations_search_documents (id, organization_id, resource_type, title, body) VALUES ($1, $2, 'content', 'Visible procedure', 'approved internal content'), ($3, $4, 'document', 'Foreign procedure', 'do not disclose')",
      [
        `content-visible-${suffix}`,
        organizationId,
        `content-foreign-${suffix}`,
        foreignOrg,
      ],
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

  it("filters search records and snippets by the resolved organization", async () => {
    expect(
      (
        await fastify.inject({
          method: "GET",
          url: "/api/v1/operations/search?q=Search",
        })
      ).statusCode,
    ).toBe(401);
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/search?q=procedure",
      headers: { "x-actor-id": managerId },
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<{
      data: { title: string; excerpt: string | null }[];
    }>().data;
    expect(data.map((item) => item.title)).toEqual(["Visible procedure"]);
    expect(data[0]?.excerpt).toContain("approved internal content");
    expect(JSON.stringify(data)).not.toContain("do not disclose");
  });

  it("requires separated roles and records approval decisions", async () => {
    const created = await fastify.inject({
      method: "POST",
      url: "/api/v1/operations/approvals",
      headers: {
        "x-actor-id": adminId,
        "content-type": "application/json",
        "x-correlation-id": `corr-${suffix}`,
      },
      payload: {
        resourceType: "discount",
        resourceId: "deal-1",
        reason: "Approved commercial exception",
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    });
    expect(created.statusCode).toBe(201);
    const approvalId = created.json<{ data: { id: string } }>().data.id;
    const self = await fastify.inject({
      method: "POST",
      url: `/api/v1/operations/approvals/${approvalId}/decision`,
      headers: { "x-actor-id": adminId, "content-type": "application/json" },
      payload: { decision: "approved", reason: "self approval" },
    });
    expect(self.statusCode).toBe(409);
    const decided = await fastify.inject({
      method: "POST",
      url: `/api/v1/operations/approvals/${approvalId}/decision`,
      headers: {
        "x-actor-id": ownerId,
        "content-type": "application/json",
        "x-correlation-id": `corr-${suffix}`,
      },
      payload: { decision: "approved", reason: "Reviewed against policy" },
    });
    expect(decided.statusCode).toBe(201);
    expect(
      decided.json<{ data: { decision: string; approver_id: string } }>().data,
    ).toMatchObject({ decision: "approved", approver_id: ownerId });
    const audit = await pool.query(
      "SELECT event, actor_id FROM platform.approval_audit_trail WHERE approval_id = $1 ORDER BY created_at",
      [approvalId],
    );
    expect(audit.rows.map((row) => row["event"])).toEqual([
      "requested",
      "approved",
    ]);
  });
});

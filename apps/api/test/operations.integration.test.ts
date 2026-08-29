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

  it("expires due approvals and sends idempotent reminders without changing decisions", async () => {
    const approvalId = `approval-lifecycle-${suffix}`;
    await pool.query(
      "INSERT INTO platform.approval_requests (id, organization_id, requester_id, resource_type, resource_id, reason, expires_at, reminder_at, escalation_at) VALUES ($1, $2, $3, 'refund', 'refund-1', 'Review refund', now() + interval '1 day', now() - interval '1 minute', now() + interval '1 hour')",
      [approvalId, organizationId, managerId],
    );
    const lifecycle = await fastify.inject({
      method: "POST",
      url: "/api/v1/operations/approvals/lifecycle",
      headers: { "x-actor-id": ownerId, "x-correlation-id": `life-${suffix}` },
    });
    expect(lifecycle.statusCode).toBe(201);
    const approval = await pool.query(
      "SELECT decision, reminded_at FROM platform.approval_requests WHERE id = $1",
      [approvalId],
    );
    expect(approval.rows[0]).toMatchObject({ decision: "pending" });
    expect(approval.rows[0]?.["reminded_at"]).toBeTruthy();
    const notifications = await pool.query(
      "SELECT id FROM platform.notifications WHERE organization_id = $1 AND dedupe_key = $2",
      [organizationId, `approval-reminded-${approvalId}`],
    );
    expect(notifications.rows).toHaveLength(3);

    await pool.query(
      "UPDATE platform.approval_requests SET expires_at = now() - interval '1 minute' WHERE id = $1",
      [approvalId],
    );
    await fastify.inject({
      method: "POST",
      url: "/api/v1/operations/approvals/lifecycle",
      headers: { "x-actor-id": ownerId },
    });
    const expired = await pool.query(
      "SELECT decision FROM platform.approval_requests WHERE id = $1",
      [approvalId],
    );
    expect(expired.rows[0]?.["decision"]).toBe("expired");
    const trail = await pool.query(
      "SELECT event FROM platform.approval_audit_trail WHERE approval_id = $1 ORDER BY created_at",
      [approvalId],
    );
    expect(trail.rows.map((row) => row["event"])).toEqual([
      "reminded",
      "expired",
    ]);
    const audit = await pool.query(
      "SELECT action FROM platform.audit_events WHERE organization_id = $1 AND metadata->>'approvalId' = $2 ORDER BY occurred_at",
      [organizationId, approvalId],
    );
    expect(audit.rows.map((row) => row["action"])).toEqual([
      "staff.approval.reminded",
      "staff.approval.expired",
    ]);
  });

  it("rejects approval requests outside the governed action policy", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/api/v1/operations/approvals",
      headers: { "x-actor-id": managerId, "content-type": "application/json" },
      payload: {
        resourceType: "unreviewed_action",
        resourceId: "action-1",
        reason: "Should be rejected",
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    });
    expect(response.statusCode).toBe(409);
  });

  it("keeps knowledge tenant-scoped and mirrors it into authorized search", async () => {
    const created = await fastify.inject({
      method: "POST",
      url: "/api/v1/operations/knowledge",
      headers: { "x-actor-id": managerId, "content-type": "application/json" },
      payload: {
        title: "Visible onboarding",
        contentType: "onboarding",
        body: "Use the approved staff checklist.",
        reviewAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    });
    expect(created.statusCode).toBe(201);
    const articleId = created.json<{ data: { id: string } }>().data.id;
    const read = await fastify.inject({
      method: "GET",
      url: `/api/v1/operations/knowledge/${articleId}`,
      headers: { "x-actor-id": managerId },
    });
    expect(read.statusCode).toBe(200);
    expect(read.json<{ data: { body: string } }>().data.body).toContain(
      "approved",
    );
    const search = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/search?q=onboarding",
      headers: { "x-actor-id": managerId },
    });
    expect(search.statusCode).toBe(200);
    expect(
      search
        .json<{ data: { title: string }[] }>()
        .data.map((item) => item.title),
    ).toContain("Visible onboarding");
    const foreignRead = await pool.query(
      "SELECT id FROM platform.knowledge_articles WHERE id = $1 AND organization_id = $2",
      [articleId, foreignOrg],
    );
    expect(foreignRead.rows).toHaveLength(0);
    const audit = await pool.query(
      "SELECT action FROM platform.audit_events WHERE metadata->>'articleId' = $1",
      [articleId],
    );
    expect(audit.rows.map((row) => row["action"])).toContain(
      "staff.knowledge.created",
    );
    const deleted = await fastify.inject({
      method: "DELETE",
      url: `/api/v1/operations/knowledge/${articleId}`,
      headers: { "x-actor-id": managerId },
    });
    expect(deleted.statusCode).toBe(200);
    const removedSearch = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/search?q=onboarding",
      headers: { "x-actor-id": managerId },
    });
    expect(
      removedSearch.json<{ data: { title: string }[] }>().data,
    ).not.toContain(expect.objectContaining({ title: "Visible onboarding" }));
  });

  it("exports bounded aggregate reports without lead PII", async () => {
    const json = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/reports?type=funnel&format=json",
      headers: {
        "x-actor-id": managerId,
        "x-correlation-id": `report-${suffix}`,
      },
    });
    expect(json.statusCode).toBe(200);
    expect(JSON.stringify(json.json())).not.toContain("visible@example.test");
    expect(
      json.json<{ meta: { formula: string; timezone: string } }>().meta,
    ).toMatchObject({ timezone: "UTC" });
    const csv = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/reports?type=conversion&format=csv",
      headers: { "x-actor-id": managerId },
    });
    expect(csv.statusCode).toBe(200);
    expect(csv.headers["content-type"]).toContain("text/csv");
    expect(csv.body).not.toContain("visible@example.test");
    const bounded = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/reports?type=activity&from=2020-01-01T00:00:00.000Z&to=2021-01-01T00:00:00.000Z",
      headers: { "x-actor-id": managerId },
    });
    expect(bounded.statusCode).toBe(400);
    const invalidDate = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/reports?type=funnel&from=not-a-date",
      headers: { "x-actor-id": managerId },
    });
    expect(invalidDate.statusCode).toBe(400);
    const memberCsv = await fastify.inject({
      method: "GET",
      url: "/api/v1/operations/reports?type=funnel&format=csv",
      headers: { "x-actor-id": `missing-${suffix}` },
    });
    expect(memberCsv.statusCode).toBe(403);
    const audit = await pool.query(
      "SELECT correlation_id FROM platform.audit_events WHERE action = 'staff.report.exported' AND organization_id = $1 AND correlation_id = $2",
      [organizationId, `report-${suffix}`],
    );
    expect(audit.rows).toHaveLength(1);
  });
});

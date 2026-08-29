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

describe("staff notification inbox", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  const suffix = randomUUID();
  const organizationId = `org-notifications-${suffix}`;
  const foreignOrganizationId = `org-notifications-foreign-${suffix}`;
  const managerId = `user-notifications-manager-${suffix}`;
  const foreignUserId = `user-notifications-foreign-${suffix}`;

  beforeAll(async () => {
    process.env["CRM_ORGANIZATION_ID"] = organizationId;
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query(
      "INSERT INTO platform.organizations (id, name) VALUES ($1, 'Notifications'), ($2, 'Foreign')",
      [organizationId, foreignOrganizationId],
    );
    await pool.query(
      "INSERT INTO identity.users (id, external_subject, email) VALUES ($1, $1, $3), ($2, $2, $4)",
      [
        managerId,
        foreignUserId,
        `${managerId}@example.test`,
        `${foreignUserId}@example.test`,
      ],
    );
    await pool.query(
      "INSERT INTO identity.memberships (id, user_id, organization_id, role) VALUES ($1, $2, $3, 'manager'), ($4, $5, $6, 'manager')",
      [
        `membership-${managerId}`,
        managerId,
        organizationId,
        `membership-${foreignUserId}`,
        foreignUserId,
        foreignOrganizationId,
      ],
    );
    await pool.query(
      "INSERT INTO platform.notifications (id, organization_id, recipient_id, category, urgency, title, body, deep_link, dedupe_key) VALUES ($1, $2, $3, 'crm', 'high', 'Visible', 'Visible body', '/staff/leads', 'visible')",
      [`notification-${suffix}`, organizationId, managerId],
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

  it("requires notification permission and never lists another tenant", async () => {
    expect(
      (await fastify.inject({ method: "GET", url: "/api/v1/notifications" }))
        .statusCode,
    ).toBe(401);
    const response = await fastify.inject({
      method: "GET",
      url: "/api/v1/notifications",
      headers: { "x-actor-id": managerId },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json<{ data: { title: string }[] }>().data).toEqual([
      expect.objectContaining({ title: "Visible" }),
    ]);
    expect(JSON.stringify(response.json())).not.toContain(foreignUserId);
  });

  it("deduplicates notifications, records read state, and protects security preferences", async () => {
    const headers = {
      "x-actor-id": managerId,
      "content-type": "application/json",
    };
    const input = {
      recipientId: managerId,
      category: "security",
      urgency: "critical",
      title: "MFA required",
      body: "Review account security.",
      deepLink: "/staff/leads",
      dedupeKey: `security-${suffix}`,
    };
    const created = await fastify.inject({
      method: "POST",
      url: "/api/v1/notifications",
      headers,
      payload: input,
    });
    expect(created.statusCode).toBe(201);
    const duplicate = await fastify.inject({
      method: "POST",
      url: "/api/v1/notifications",
      headers,
      payload: input,
    });
    expect(duplicate.statusCode).toBe(201);
    expect(duplicate.json<{ data: { id: string } }>().data.id).toBe(
      created.json<{ data: { id: string } }>().data.id,
    );
    const read = await fastify.inject({
      method: "PATCH",
      url: `/api/v1/notifications/${created.json<{ data: { id: string } }>().data.id}/read`,
      headers: { "x-actor-id": managerId },
    });
    expect(read.statusCode).toBe(200);
    const disabled = await fastify.inject({
      method: "PATCH",
      url: "/api/v1/notifications/preferences/security",
      headers,
      payload: { enabled: false },
    });
    expect(disabled.statusCode).toBe(409);
    const outbox = await pool.query(
      "SELECT event_type FROM platform.outbox_events WHERE payload->>'notificationId' = $1",
      [created.json<{ data: { id: string } }>().data.id],
    );
    expect(outbox.rows).toHaveLength(1);
    expect(outbox.rows[0]?.["event_type"]).toBe("notification.email");
  });
});

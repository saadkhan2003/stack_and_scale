import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createPostgresPoolFromEnv, runMigrations, type DatabasePool } from "@stack-and-scale/database";

import { AppModule } from "../src/app.module.js";

describe("CRM staff workflow", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  const suffix = randomUUID();
  const organizationId = `org-crm-${suffix}`;
  const managerId = `user-crm-manager-${suffix}`;
  const memberId = `user-crm-member-${suffix}`;
  const leadId = `lead-crm-${suffix}`;

  beforeAll(async () => {
    process.env["CRM_ORGANIZATION_ID"] = organizationId;
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query("INSERT INTO platform.organizations (id, name) VALUES ($1, 'CRM Test')", [organizationId]);
    await pool.query("INSERT INTO identity.users (id, external_subject, email) VALUES ($1, $1, $3), ($2, $2, $4)", [managerId, memberId, `manager-crm-${suffix}@example.test`, `member-crm-${suffix}@example.test`]);
    await pool.query("INSERT INTO identity.memberships (id, user_id, organization_id, role, status) VALUES ($1, $2, $3, 'manager', 'active'), ($4, $5, $3, 'member', 'active')", [`membership-manager-${suffix}`, managerId, organizationId, `membership-member-${suffix}`, memberId]);
    await pool.query("INSERT INTO platform.leads (id, email, name, source, idempotency_key) VALUES ($1, 'crm-lead@example.test', 'CRM Lead', 'test', $2)", [leadId, `crm-${suffix}`]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterAll(async () => { if (app) await app.close(); if (pool) await pool.end(); delete process.env["CRM_ORGANIZATION_ID"]; });

  it("keeps the inbox closed to unauthenticated and member-only users", async () => {
    expect((await fastify.inject({ method: "GET", url: "/api/v1/crm/leads" })).statusCode).toBe(401);
    expect((await fastify.inject({ method: "GET", url: "/api/v1/crm/leads", headers: { "x-actor-id": memberId } })).statusCode).toBe(403);
  });

  it("lets a manager assign, progress, note, and complete a follow-up", async () => {
    const headers = { "x-actor-id": managerId, "content-type": "application/json" };
    const update = await fastify.inject({ method: "PATCH", url: `/api/v1/crm/leads/${leadId}`, headers, payload: { ownerId: managerId, stage: "qualified", probability: 40 } });
    expect(update.statusCode).toBe(200);
    expect(update.json<{ data: { stage: string; ownerId: string } }>().data).toMatchObject({ stage: "qualified", ownerId: managerId });
    const note = await fastify.inject({ method: "POST", url: `/api/v1/crm/leads/${leadId}/notes`, headers, payload: { body: "Called to discuss the demo scope." } });
    expect(note.statusCode).toBe(201);
    const task = await fastify.inject({ method: "POST", url: `/api/v1/crm/leads/${leadId}/tasks`, headers, payload: { title: "Send follow-up", assigneeId: managerId } });
    expect(task.statusCode).toBe(201);
    const taskId = task.json<{ data: { id: string } }>().data.id;
    const complete = await fastify.inject({ method: "PATCH", url: `/api/v1/crm/leads/${leadId}/tasks/${taskId}/complete`, headers: { "x-actor-id": managerId } });
    expect(complete.statusCode).toBe(200);
    const detail = await fastify.inject({ method: "GET", url: `/api/v1/crm/leads/${leadId}`, headers });
    expect(detail.statusCode).toBe(200);
    expect(detail.json<{ data: { notes: unknown[]; tasks: { completed_at: string | null }[] } }>().data.notes).toHaveLength(1);
    expect(detail.json<{ data: { tasks: { completed_at: string | null }[] } }>().data.tasks[0]?.completed_at).toBeTruthy();
  });
});

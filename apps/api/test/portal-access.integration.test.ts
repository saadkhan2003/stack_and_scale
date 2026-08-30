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

const ORG = "portal-access-org";
const FOREIGN_ORG = "portal-access-foreign-org";
const USER = "portal-access-user";
const REVOKED_USER = "portal-access-foreign-user";
const ADMIN = "portal-access-admin";
const CLIENT_ORG = "portal-client-org";
const DISABLED_CLIENT_ORG = "portal-disabled-client-org";
const PROJECT = "portal-project-a";
const FOREIGN_PROJECT = "portal-project-b";

function portalTicketId(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "ticket" in value &&
    typeof value.ticket === "object" &&
    value.ticket !== null &&
    "id" in value.ticket &&
    typeof value.ticket.id === "string"
  ) {
    return value.ticket.id;
  }
  throw new Error("Expected a portal ticket response.");
}

describe("portal access boundary", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;

  beforeAll(async () => {
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO platform.organizations (id, name) VALUES
         ($1, 'Portal Org'), ($2, 'Portal Foreign Org')
       ON CONFLICT (id) DO NOTHING`,
      [ORG, FOREIGN_ORG],
    );
    await pool.query(
      `INSERT INTO identity.users (id, external_subject, email) VALUES
         ($1, $1, 'portal-user@example.test'),
         ($2, $2, 'portal-foreign@example.test'),
         ($3, $3, 'portal-admin@example.test')
       ON CONFLICT (id) DO NOTHING`,
      [USER, REVOKED_USER, ADMIN],
    );
    await pool.query(
      `INSERT INTO portal.client_organizations
         (id, organization_id, customer_id, portal_access_enabled,
          portal_home_enabled, portal_projects_enabled, portal_support_enabled) VALUES
         ($1, $2, 'customer-a', true, true, true, true),
         ($3, $2, 'customer-b', false, false, false)
       ON CONFLICT (id) DO UPDATE SET
         portal_access_enabled = EXCLUDED.portal_access_enabled,
         portal_home_enabled = EXCLUDED.portal_home_enabled,
         portal_projects_enabled = EXCLUDED.portal_projects_enabled,
         portal_support_enabled = EXCLUDED.portal_support_enabled`,
      [CLIENT_ORG, ORG, DISABLED_CLIENT_ORG],
    );
    await pool.query(
      `INSERT INTO portal.client_memberships
         (id, client_organization_id, user_id, role, status) VALUES
         ('portal-membership-active', $1, $2, 'client_member', 'active'),
         ('portal-membership-revoked', $1, $3, 'client_admin', 'revoked'),
         ('portal-membership-admin', $1, $5, 'client_admin', 'active'),
         ('portal-membership-disabled', $4, $2, 'client_member', 'active')
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [CLIENT_ORG, USER, REVOKED_USER, DISABLED_CLIENT_ORG, ADMIN],
    );
    await pool.query(
      `INSERT INTO portal.project_projections
         (id, client_organization_id, source_project_id, title, scope_summary, status, next_action) VALUES
         ($1, $2, 'source-project-a', 'Portal project', 'Approved scope only', 'active', 'Review milestone'),
         ($3, $2, 'source-project-b', 'Foreign project', 'Never returned', 'planned', NULL)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title`,
      [PROJECT, CLIENT_ORG, FOREIGN_PROJECT],
    );
    await pool.query(
      `INSERT INTO portal.project_milestone_projections
         (id, project_projection_id, label, status, due_on) VALUES
         ('portal-milestone-a', $1, 'Discovery', 'in_progress', '2030-01-15')
       ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label`,
      [PROJECT],
    );
    await pool.query(
      `INSERT INTO portal.project_grants
         (id, client_organization_id, user_id, project_id, status) VALUES
         ('portal-project-grant-a', $1, $2, $3, 'active')
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [CLIENT_ORG, USER, PROJECT],
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

  it("requires authentication", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/access`,
    });
    expect(response.statusCode).toBe(401);
  });

  it("returns only the allowed portal principal fields", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/access`,
      headers: { "x-actor-id": USER },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      clientOrganizationId: CLIENT_ORG,
      role: "client_member",
    });
  });

  it.each([
    ["unknown client organization", USER, "portal-unknown-client-org"],
    ["revoked member", REVOKED_USER, CLIENT_ORG],
    ["disabled portal", USER, DISABLED_CLIENT_ORG],
  ])(
    "denies %s without revealing the record",
    async (_reason, actorId, clientOrganizationId) => {
      const response = await fastify.inject({
        method: "GET",
        url: `/api/v1/portal/client-organizations/${clientOrganizationId}/access`,
        headers: { "x-actor-id": actorId },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this resource.",
        },
      });
    },
  );

  it("returns only an active member's exact project projection", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/projects/${PROJECT}`,
      headers: { "x-actor-id": USER },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: PROJECT,
      title: "Portal project",
      scopeSummary: "Approved scope only",
      status: "active",
      nextAction: "Review milestone",
      milestones: [
        {
          id: "portal-milestone-a",
          label: "Discovery",
          status: "in_progress",
          dueOn: "2030-01-15",
        },
      ],
    });
  });

  it("denies an ungranted project without revealing it", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/projects/${FOREIGN_PROJECT}`,
      headers: { "x-actor-id": USER },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: {
        code: "FORBIDDEN",
        message: "You do not have access to this resource.",
      },
    });
  });

  it("uses a separate home flag and returns the client-safe project summary", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/home`,
      headers: { "x-actor-id": USER },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      projects: [
        {
          id: PROJECT,
          title: "Portal project",
          scopeSummary: "Approved scope only",
          status: "active",
          nextAction: "Review milestone",
        },
      ],
    });
  });

  it("creates and comments on a ticket without accepting staff-owned fields", async () => {
    const create = await fastify.inject({
      method: "POST",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/support/tickets`,
      headers: { "x-actor-id": USER },
      payload: {
        subject: "Portal question",
        description: "Please confirm the next project milestone.",
        category: "question",
        severity: "critical",
        ownerId: "staff-user",
      },
    });
    expect(create.statusCode).toBe(201);
    const createBody: unknown = create.json();
    expect(createBody).toMatchObject({ ticket: { priority: "normal" } });
    const ticketId = portalTicketId(createBody);

    const comment = await fastify.inject({
      method: "POST",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/support/tickets/${ticketId}/comments`,
      headers: { "x-actor-id": USER },
      payload: { body: "Thank you." },
    });
    expect(comment.statusCode).toBe(201);
    const commentBody: unknown = comment.json();
    expect(commentBody).toMatchObject({
      comment: {
        ticket_id: ticketId,
        author_id: USER,
        visibility: "public",
        body: "Thank you.",
      },
    });
  });

  it("does not disclose another customer's support ticket", async () => {
    await pool.query(
      `INSERT INTO platform.support_tickets
         (id, organization_id, customer_id, subject, description, category,
          severity, priority, sla_target_seconds, created_by)
       VALUES ('portal-foreign-ticket', $1, 'other-customer', 'Private', 'Private',
               'question', 'medium', 'normal', 86400, $2)
       ON CONFLICT (id) DO NOTHING`,
      [ORG, REVOKED_USER],
    );
    const response = await fastify.inject({
      method: "POST",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/support/tickets/portal-foreign-ticket/comments`,
      headers: { "x-actor-id": USER },
      payload: { body: "Attempted access" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: {
        code: "FORBIDDEN",
        message: "You do not have access to this resource.",
      },
    });
  });

  it("limits membership management to the client administrator and audits a revocation", async () => {
    const memberDenied = await fastify.inject({
      method: "GET",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/members`,
      headers: { "x-actor-id": USER },
    });
    expect(memberDenied.statusCode).toBe(403);

    const memberAdded = await fastify.inject({
      method: "POST",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/members`,
      headers: { "x-actor-id": ADMIN },
      payload: { email: "portal-user@example.test", role: "client_admin" },
    });
    expect(memberAdded.statusCode).toBe(201);
    expect(memberAdded.json()).toMatchObject({
      member: { userId: USER, role: "client_admin", status: "active" },
    });

    const active = await pool.query(
      `SELECT id FROM portal.client_memberships
        WHERE client_organization_id = $1 AND user_id = $2`,
      [CLIENT_ORG, USER],
    );
    const membershipId = active.rows[0]?.["id"];
    if (typeof membershipId !== "string") {
      throw new Error("Expected the active portal membership.");
    }
    const revoked = await fastify.inject({
      method: "POST",
      url: `/api/v1/portal/client-organizations/${CLIENT_ORG}/members/${membershipId}/revoke`,
      headers: { "x-actor-id": ADMIN },
    });
    expect(revoked.statusCode).toBe(201);
    const events = await pool.query(
      `SELECT event_type FROM portal.membership_events
        WHERE membership_id = $1 ORDER BY created_at ASC`,
      [membershipId],
    );
    expect(events.rows.map((row) => row["event_type"])).toEqual([
      "member_added",
      "member_revoked",
    ]);
  });
});

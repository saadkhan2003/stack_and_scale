import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { authorizePortalReviewDecision } from "@stack-and-scale/contracts";
import type { FastifyRequest } from "fastify";

import { PlatformDatabaseService } from "../platform-database.service.js";
import { PortalAccessService } from "./portal-access.service.js";
import { PortalProjectsService } from "./portal-projects.service.js";

type ReviewRow = {
  id: string;
  project_id: string;
  target_type: "proposal" | "deliverable";
  target_id: string;
  target_version: string;
  rendered_checksum_sha256: string;
  assigned_user_id: string;
  status: string;
  expires_at: string;
};

@Injectable()
export class PortalReviewsService {
  public constructor(
    @Inject(PortalAccessService)
    private readonly access: PortalAccessService,
    @Inject(PortalProjectsService)
    private readonly projects: PortalProjectsService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.requireFeature(request, clientOrganizationId);
    const result = await this.database.query(
      `SELECT review.id, review.project_id, review.target_type, review.target_id,
              review.target_version, review.rendered_checksum_sha256,
              review.status, review.expires_at
         FROM portal.review_requests AS review
        WHERE review.client_organization_id = $1
          AND review.assigned_user_id = $2
          AND review.status = 'open'
        ORDER BY review.expires_at ASC, review.id ASC
        LIMIT 50`,
      [principal.clientOrganizationId, principal.actorId],
    );
    return result.rows.map((row) => this.dto(row as ReviewRow));
  }

  public async decide(
    request: FastifyRequest,
    clientOrganizationId: string,
    reviewId: string,
    input: Readonly<{
      idempotencyKey: string;
      decision: string;
      targetVersion: string;
      renderedChecksumSha256: string;
      comment?: string;
    }>,
  ) {
    if (
      input.idempotencyKey.trim().length < 8 ||
      !["accepted", "rejected"].includes(input.decision) ||
      input.targetVersion.trim().length === 0 ||
      !/^[a-f0-9]{64}$/.test(input.renderedChecksumSha256)
    ) {
      throw new BadRequestException("The review decision is invalid.");
    }
    const principal = await this.requireFeature(request, clientOrganizationId);
    const result = await this.database.query(
      `SELECT review.id, review.project_id, review.target_type, review.target_id,
              review.target_version, review.rendered_checksum_sha256,
              review.assigned_user_id, review.status, review.expires_at
         FROM portal.review_requests AS review
        WHERE review.id = $1 AND review.client_organization_id = $2`,
      [reviewId, principal.clientOrganizationId],
    );
    const review = result.rows[0] as ReviewRow | undefined;
    if (
      review === undefined ||
      !authorizePortalReviewDecision({
        actorId: principal.actorId,
        review:
          review === undefined
            ? null
            : {
                assignedUserId: review.assigned_user_id,
                status: review.status,
                expiresAt: review.expires_at,
                targetVersion: review.target_version,
                renderedChecksumSha256: review.rendered_checksum_sha256,
              },
        now: new Date().toISOString(),
        targetVersion: input.targetVersion,
        renderedChecksumSha256: input.renderedChecksumSha256,
      })
    ) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    // Reuse the portal project boundary before accepting a decision for it.
    await this.projects.detail(
      request,
      clientOrganizationId,
      review.project_id,
    );

    const existing = await this.database.query(
      `SELECT id, actor_id, idempotency_key, decision, comment, created_at
         FROM portal.review_decisions
        WHERE review_request_id = $1`,
      [review.id],
    );
    const prior = existing.rows[0] as
      | {
          id: string;
          actor_id: string;
          idempotency_key: string;
          decision: string;
          comment: string | null;
          created_at: string;
        }
      | undefined;
    if (prior !== undefined) {
      if (
        prior.actor_id === principal.actorId &&
        prior.idempotency_key === input.idempotencyKey
      ) {
        return this.decisionDto(prior);
      }
      throw new ConflictException("This review already has a decision.");
    }
    const decision = await this.database.query(
      `INSERT INTO portal.review_decisions
         (id, review_request_id, actor_id, idempotency_key, decision, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, actor_id, idempotency_key, decision, comment, created_at`,
      [
        `portal_review_decision_${randomUUID()}`,
        review.id,
        principal.actorId,
        input.idempotencyKey,
        input.decision,
        input.comment?.trim() || null,
      ],
    );
    await this.database.query(
      `UPDATE portal.review_requests SET status = $1 WHERE id = $2 AND status = 'open'`,
      [input.decision, review.id],
    );
    return this.decisionDto(
      decision.rows[0] as {
        id: string;
        actor_id: string;
        idempotency_key: string;
        decision: string;
        comment: string | null;
        created_at: string;
      },
    );
  }

  private async requireFeature(
    request: FastifyRequest,
    clientOrganizationId: string,
  ) {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const feature = await this.database.query(
      `SELECT portal_reviews_enabled
         FROM portal.client_organizations
        WHERE id = $1 AND organization_id = $2`,
      [principal.clientOrganizationId, principal.organizationId],
    );
    if (feature.rows[0]?.["portal_reviews_enabled"] !== true) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    return principal;
  }

  private dto(row: ReviewRow) {
    return {
      id: row.id,
      projectId: row.project_id,
      target: {
        type: row.target_type,
        id: row.target_id,
        version: row.target_version,
        renderedChecksumSha256: row.rendered_checksum_sha256,
      },
      status: row.status,
      expiresAt: row.expires_at,
    };
  }

  private decisionDto(
    row: Readonly<{
      id: string;
      decision: string;
      comment: string | null;
      created_at: string;
    }>,
  ) {
    return {
      id: row.id,
      decision: row.decision,
      comment: row.comment,
      decidedAt: row.created_at,
    };
  }
}

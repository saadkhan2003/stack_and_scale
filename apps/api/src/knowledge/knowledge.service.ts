import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

type ArticleInput = {
  title: string;
  contentType: string;
  body: string;
  ownerId: string | undefined;
  reviewAt: string;
  status: string;
  allowedRoles: string[];
  contextTags: string[];
};

@Injectable()
export class KnowledgeService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(organizationId: string) {
    const result = await this.database.query(
      `SELECT id, title, content_type, owner_id, review_at, status, allowed_roles, context_tags, created_at, updated_at
         FROM platform.knowledge_articles WHERE organization_id = $1
        ORDER BY review_at ASC, updated_at DESC LIMIT 200`,
      [organizationId],
    );
    return { data: result.rows };
  }

  public async read(organizationId: string, id: string) {
    const result = await this.database.query(
      `SELECT id, title, content_type, body, owner_id, review_at, status, allowed_roles, context_tags, created_at, updated_at
         FROM platform.knowledge_articles WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    );
    if (!result.rows[0])
      throw new NotFoundException("Knowledge article not found.");
    return { data: result.rows[0] };
  }

  public async suggestions(
    organizationId: string,
    actorRole: string,
    leadId: string | undefined,
    workflow: string | undefined,
  ) {
    const context = new Set<string>();
    if (workflow) context.add(workflow.trim().toLowerCase());
    if (leadId) {
      const lead = await this.database.query(
        `SELECT intake_type, stage, source, attribution->>'product' AS product
           FROM platform.leads WHERE id = $1 AND organization_id = $2`,
        [leadId, organizationId],
      );
      if (!lead.rows[0]) throw new NotFoundException("Lead not found.");
      for (const value of Object.values(lead.rows[0])) {
        if (typeof value === "string" && value.trim())
          context.add(value.trim().toLowerCase());
      }
    }
    if (context.size === 0)
      throw new BadRequestException("A lead or workflow is required.");
    const result = await this.database.query(
      `SELECT id, title, content_type, review_at, context_tags
         FROM platform.knowledge_articles
        WHERE organization_id = $1 AND status = 'published'
          AND allowed_roles @> ARRAY[$2]::text[]
          AND (cardinality(context_tags) = 0 OR context_tags && $3::text[])
        ORDER BY review_at ASC, updated_at DESC LIMIT 20`,
      [organizationId, actorRole, [...context]],
    );
    return { data: result.rows };
  }

  public async create(
    organizationId: string,
    actorId: string,
    input: ArticleInput,
    correlationId: string,
  ) {
    const id = `knowledge_${randomUUID()}`;
    const ownerId = input.ownerId ?? actorId;
    await this.ensureActiveMember(organizationId, ownerId);
    const result = await this.database.query(
      `INSERT INTO platform.knowledge_articles (id, organization_id, title, content_type, body, owner_id, review_at, status, allowed_roles, context_tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8, $9::text[], $10::text[])
       RETURNING id, title, content_type, body, owner_id, review_at, status, allowed_roles, context_tags, created_at, updated_at`,
      [
        id,
        organizationId,
        input.title,
        input.contentType,
        input.body,
        ownerId,
        input.reviewAt,
        input.status,
        input.allowedRoles,
        input.contextTags,
      ],
    );
    await this.syncSearch(organizationId, id, input.title, input.body);
    await this.audit(
      organizationId,
      actorId,
      "staff.knowledge.created",
      id,
      correlationId,
    );
    return { data: result.rows[0] };
  }

  public async update(
    organizationId: string,
    actorId: string,
    id: string,
    input: ArticleInput,
    correlationId: string,
  ) {
    if (input.ownerId !== undefined) {
      await this.ensureActiveMember(organizationId, input.ownerId);
    }
    const result = await this.database.query(
      `UPDATE platform.knowledge_articles SET title = $3, content_type = $4, body = $5, owner_id = COALESCE($6, owner_id), review_at = $7::timestamptz,
           status = $8, allowed_roles = $9::text[], context_tags = $10::text[], updated_at = now() WHERE id = $1 AND organization_id = $2
       RETURNING id, title, content_type, body, owner_id, review_at, status, allowed_roles, context_tags, created_at, updated_at`,
      [
        id,
        organizationId,
        input.title,
        input.contentType,
        input.body,
        input.ownerId ?? null,
        input.reviewAt,
        input.status,
        input.allowedRoles,
        input.contextTags,
      ],
    );
    if (!result.rows[0])
      throw new NotFoundException("Knowledge article not found.");
    await this.syncSearch(organizationId, id, input.title, input.body);
    await this.audit(
      organizationId,
      actorId,
      "staff.knowledge.updated",
      id,
      correlationId,
    );
    return { data: result.rows[0] };
  }

  public async remove(
    organizationId: string,
    actorId: string,
    id: string,
    correlationId: string,
  ) {
    const result = await this.database.query(
      "DELETE FROM platform.knowledge_articles WHERE id = $1 AND organization_id = $2 RETURNING id",
      [id, organizationId],
    );
    if (!result.rows[0])
      throw new NotFoundException("Knowledge article not found.");
    await this.database.query(
      "DELETE FROM platform.operations_search_documents WHERE id = $1 AND organization_id = $2",
      [`knowledge-${id}`, organizationId],
    );
    await this.audit(
      organizationId,
      actorId,
      "staff.knowledge.deleted",
      id,
      correlationId,
    );
    return { data: { id, deleted: true } };
  }

  private async syncSearch(
    organizationId: string,
    id: string,
    title: string,
    body: string,
  ) {
    await this.database.query(
      `INSERT INTO platform.operations_search_documents (id, organization_id, resource_type, title, body)
       VALUES ($1, $2, 'content', $3, $4) ON CONFLICT (id) DO UPDATE SET title = $3, body = $4`,
      [`knowledge-${id}`, organizationId, title, body],
    );
  }

  private async ensureActiveMember(organizationId: string, userId: string) {
    const result = await this.database.query(
      `SELECT 1 FROM identity.memberships
        WHERE organization_id = $1 AND user_id = $2 AND status = 'active'`,
      [organizationId, userId],
    );
    if (result.rows.length === 0) {
      throw new BadRequestException(
        "The article owner must be an active staff member in this organization.",
      );
    }
  }

  private async audit(
    organizationId: string,
    actorId: string,
    action: string,
    articleId: string,
    correlationId: string,
  ) {
    await this.database.query(
      `INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata)
       VALUES ($1, $2, $3, $4, $5, jsonb_build_object('articleId', $6::text))`,
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        action,
        correlationId,
        articleId,
      ],
    );
  }
}

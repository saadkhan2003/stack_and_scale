import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import {
  authorizePortalProjectAccess,
  type PortalPrincipal,
} from "@stack-and-scale/contracts";
import type { FastifyRequest } from "fastify";

import { PlatformDatabaseService } from "../platform-database.service.js";
import { PortalAccessService } from "./portal-access.service.js";

type ProjectRow = {
  id: string;
  title: string;
  scope_summary: string;
  status: "planned" | "active" | "on_hold" | "completed";
  next_action: string | null;
  published_at: string;
};

type MilestoneRow = {
  id: string;
  label: string;
  status: "planned" | "in_progress" | "completed" | "blocked";
  due_on: string | Date | null;
};

@Injectable()
export class PortalProjectsService {
  public constructor(
    @Inject(PortalAccessService)
    private readonly access: PortalAccessService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.resolveProjectsPrincipal(
      request,
      clientOrganizationId,
    );
    return this.listFor(principal);
  }

  public async home(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.resolveFeaturePrincipal(
      request,
      clientOrganizationId,
      "portal_home_enabled",
    );
    const featureResult = await this.database.query(
      `SELECT portal_projects_enabled
         FROM portal.client_organizations
        WHERE id = $1 AND organization_id = $2`,
      [principal.clientOrganizationId, principal.organizationId],
    );
    if (featureResult.rows[0]?.["portal_projects_enabled"] !== true) {
      return { projects: [] };
    }
    return { projects: (await this.listFor(principal)).slice(0, 5) };
  }

  private async listFor(principal: PortalPrincipal) {
    const result = await this.database.query(
      `SELECT project.id, project.title, project.scope_summary, project.status,
              project.next_action, project.published_at
         FROM portal.project_projections AS project
        WHERE project.client_organization_id = $1
          AND ($2 = 'client_admin' OR EXISTS (
            SELECT 1 FROM portal.project_grants AS project_grant
             WHERE project_grant.client_organization_id = project.client_organization_id
               AND project_grant.project_id = project.id
               AND project_grant.user_id = $3
               AND project_grant.status = 'active'
          ))
        ORDER BY project.published_at DESC, project.id ASC
        LIMIT 50`,
      [principal.clientOrganizationId, principal.role, principal.actorId],
    );
    return result.rows.map((row) => this.projectDto(row as ProjectRow));
  }

  public async detail(
    request: FastifyRequest,
    clientOrganizationId: string,
    projectId: string,
  ) {
    const principal = await this.resolveProjectsPrincipal(
      request,
      clientOrganizationId,
    );
    const projectResult = await this.database.query(
      `SELECT project.id, project.title, project.scope_summary, project.status,
              project.next_action, project.published_at
         FROM portal.project_projections AS project
        WHERE project.id = $1 AND project.client_organization_id = $2`,
      [projectId, clientOrganizationId],
    );
    const project = projectResult.rows[0] as ProjectRow | undefined;
    if (project === undefined) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const grantResult = await this.database.query(
      `SELECT project_grant.user_id AS actor_id,
              project_grant.client_organization_id, project_grant.project_id,
              project_grant.status
         FROM portal.project_grants AS project_grant
        WHERE project_grant.client_organization_id = $1
          AND project_grant.project_id = $2
          AND project_grant.user_id = $3`,
      [clientOrganizationId, projectId, principal.actorId],
    );
    const grant =
      (grantResult.rows[0] as
        | {
            actor_id: string | null;
            client_organization_id: string;
            project_id: string;
            status: string;
          }
        | undefined) ?? null;
    if (
      !authorizePortalProjectAccess({
        principal,
        projectClientOrganizationId: clientOrganizationId,
        projectId,
        grant:
          grant === null
            ? null
            : {
                actorId: grant.actor_id,
                clientOrganizationId: grant.client_organization_id,
                projectId: grant.project_id,
                status: grant.status,
              },
      })
    ) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const milestones = await this.database.query(
      `SELECT milestone.id, milestone.label, milestone.status, milestone.due_on
         FROM portal.project_milestone_projections AS milestone
        WHERE milestone.project_projection_id = $1
        ORDER BY milestone.due_on NULLS LAST, milestone.id ASC`,
      [projectId],
    );
    return {
      ...this.projectDto(project),
      milestones: milestones.rows.map((row) =>
        this.milestoneDto(row as MilestoneRow),
      ),
    };
  }

  private async resolveProjectsPrincipal(
    request: FastifyRequest,
    clientOrganizationId: string,
  ): Promise<PortalPrincipal> {
    return this.resolveFeaturePrincipal(
      request,
      clientOrganizationId,
      "portal_projects_enabled",
    );
  }

  private async resolveFeaturePrincipal(
    request: FastifyRequest,
    clientOrganizationId: string,
    feature: "portal_home_enabled" | "portal_projects_enabled",
  ): Promise<PortalPrincipal> {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const result = await this.database.query(
      `SELECT portal_home_enabled, portal_projects_enabled
         FROM portal.client_organizations
        WHERE id = $1 AND organization_id = $2`,
      [principal.clientOrganizationId, principal.organizationId],
    );
    if (result.rows[0]?.[feature] !== true) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    return principal;
  }

  private projectDto(row: ProjectRow) {
    return {
      id: row.id,
      title: row.title,
      scopeSummary: row.scope_summary,
      status: row.status,
      nextAction: row.next_action,
    };
  }

  private milestoneDto(row: MilestoneRow) {
    return {
      id: row.id,
      label: row.label,
      status: row.status,
      dueOn:
        row.due_on === null
          ? null
          : new Date(row.due_on).toISOString().slice(0, 10),
    };
  }
}

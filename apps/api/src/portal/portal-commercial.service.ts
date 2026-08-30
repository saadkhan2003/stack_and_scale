import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { PlatformDatabaseService } from "../platform-database.service.js";
import { PortalAccessService } from "./portal-access.service.js";

@Injectable()
export class PortalCommercialService {
  public constructor(
    @Inject(PortalAccessService) private readonly access: PortalAccessService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async documents(
    request: FastifyRequest,
    clientOrganizationId: string,
  ) {
    const principal = await this.requireFeature(
      request,
      clientOrganizationId,
      "portal_commercial_enabled",
    );
    const result = await this.database.query(
      `SELECT id, document_type, display_name, document_number, status, currency,
              total_minor_units, issued_at, due_at, payment_instructions,
              receipt_available, published_at
         FROM portal.commercial_document_projections
        WHERE client_organization_id = $1
        ORDER BY published_at DESC, id ASC LIMIT 100`,
      [principal.clientOrganizationId],
    );
    return result.rows.map((row) => ({
      id: row["id"],
      type: row["document_type"],
      name: row["display_name"],
      number: row["document_number"],
      status: row["status"],
      currency: row["currency"],
      totalMinorUnits: row["total_minor_units"],
      issuedAt: row["issued_at"],
      dueAt: row["due_at"],
      paymentInstructions: row["payment_instructions"],
      receiptAvailable: row["receipt_available"],
      publishedAt: row["published_at"],
    }));
  }

  public async files(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.requireFeature(
      request,
      clientOrganizationId,
      "portal_files_enabled",
    );
    const result = await this.database.query(
      `SELECT file.id, file.project_id, file.display_name, file.version_label,
              file.content_type, file.size_bytes, file.published_at
         FROM portal.file_projections AS file
         JOIN portal.project_grants AS grant
           ON grant.client_organization_id = file.client_organization_id
          AND grant.project_id = file.project_id
          AND grant.user_id = $2 AND grant.status = 'active'
        WHERE file.client_organization_id = $1 AND file.scan_status = 'clean'
        ORDER BY file.published_at DESC, file.id ASC LIMIT 100`,
      [principal.clientOrganizationId, principal.actorId],
    );
    return result.rows.map((row) => ({
      id: row["id"],
      projectId: row["project_id"],
      name: row["display_name"],
      versionLabel: row["version_label"],
      contentType: row["content_type"],
      sizeBytes: row["size_bytes"],
      publishedAt: row["published_at"],
    }));
  }

  private async requireFeature(
    request: FastifyRequest,
    clientOrganizationId: string,
    feature: "portal_commercial_enabled" | "portal_files_enabled",
  ) {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null)
      throw new ForbiddenException("You do not have access to this resource.");
    const result = await this.database.query(
      `SELECT portal_commercial_enabled, portal_files_enabled
         FROM portal.client_organizations WHERE id = $1 AND organization_id = $2`,
      [principal.clientOrganizationId, principal.organizationId],
    );
    if (result.rows[0]?.[feature] !== true)
      throw new ForbiddenException("You do not have access to this resource.");
    return principal;
  }
}

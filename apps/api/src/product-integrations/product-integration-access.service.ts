import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import type { FastifyRequest } from "fastify";

import { PlatformDatabaseService } from "../platform-database.service.js";

export type ProductInstallationPrincipal = Readonly<{
  installationId: string;
  accountOrganizationId: string;
  productId: string;
  licenseId: string;
}>;

@Injectable()
export class ProductIntegrationAccessService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async requireInstallation(
    request: FastifyRequest,
  ): Promise<ProductInstallationPrincipal> {
    const supplied = request.headers["x-product-installation-credential"];
    const credential = Array.isArray(supplied) ? undefined : supplied;
    if (!credential || credential.length < 32)
      throw new UnauthorizedException(
        "Installation authentication is required.",
      );
    const hash = createHash("sha256").update(credential).digest("hex");
    const result = await this.database.query(
      `SELECT installation.id AS installation_id, installation.account_organization_id, license.id AS license_id, account.product_id
         FROM product.installation_credentials credential
         JOIN product.installations installation ON installation.id = credential.installation_id
         JOIN product.licenses license ON license.id = installation.license_id
         JOIN product.account_organizations account ON account.id = installation.account_organization_id
        WHERE credential.credential_hash = $1 AND credential.status = 'active' AND credential.expires_at > now()
          AND installation.status = 'active' AND license.status IN ('granted','active')
          AND account.status = 'active' AND account.account_enabled = true AND account.integration_enabled = true`,
      [hash],
    );
    const row = result.rows[0] as
      | {
          installation_id: string;
          account_organization_id: string;
          product_id: string;
          license_id: string;
        }
      | undefined;
    if (!row)
      throw new ForbiddenException("Installation access is not available.");
    return {
      installationId: row.installation_id,
      accountOrganizationId: row.account_organization_id,
      productId: row.product_id,
      licenseId: row.license_id,
    };
  }
}

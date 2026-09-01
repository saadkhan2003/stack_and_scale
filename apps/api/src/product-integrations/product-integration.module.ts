import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { CrmModule } from "../crm/crm.module.js";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { ProductIntegrationAccessService } from "./product-integration-access.service.js";
import { ProductIntegrationAdminController } from "./product-integration-admin.controller.js";
import { ProductIntegrationController } from "./product-integration.controller.js";
import { ProductIntegrationService } from "./product-integration.service.js";

@Module({ imports: [AuthModule, CrmModule], controllers: [ProductIntegrationController, ProductIntegrationAdminController], providers: [PlatformDatabaseService, ProductIntegrationAccessService, ProductIntegrationService] })
export class ProductIntegrationModule {}

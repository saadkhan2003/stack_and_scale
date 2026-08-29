import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { KnowledgeController } from "./knowledge.controller.js";
import { KnowledgeService } from "./knowledge.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [KnowledgeController],
  providers: [TenantAccessService, CrmAccessService, KnowledgeService],
})
export class KnowledgeModule {}

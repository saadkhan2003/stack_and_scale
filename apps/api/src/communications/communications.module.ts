import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { CommunicationsController } from "./communications.controller.js";
import { CommunicationsService } from "./communications.service.js";
@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [CommunicationsController],
  providers: [TenantAccessService, CrmAccessService, CommunicationsService],
})
export class CommunicationsModule {}

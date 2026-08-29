import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "./crm-access.service.js";
import { CrmController, CrmSummaryController } from "./crm.controller.js";
import { CrmService } from "./crm.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [CrmController, CrmSummaryController],
  providers: [TenantAccessService, CrmAccessService, CrmService],
})
export class CrmModule {}

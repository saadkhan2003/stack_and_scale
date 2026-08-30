import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { SupportController } from "./support.controller.js";
import { SupportService } from "./support.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [SupportController],
  providers: [TenantAccessService, CrmAccessService, SupportService],
  exports: [SupportService],
})
export class SupportModule {}

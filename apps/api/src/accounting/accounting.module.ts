import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { AccountingController } from "./accounting.controller.js";
import { AccountingService } from "./accounting.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [AccountingController],
  providers: [TenantAccessService, CrmAccessService, AccountingService],
})
export class AccountingModule {}

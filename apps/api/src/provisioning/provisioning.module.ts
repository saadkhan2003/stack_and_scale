import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { ProvisioningController } from "./provisioning.controller.js";
import { ProvisioningService } from "./provisioning.service.js";
@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [ProvisioningController],
  providers: [TenantAccessService, CrmAccessService, ProvisioningService],
})
export class ProvisioningModule {}

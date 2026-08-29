import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [NotificationsController],
  providers: [TenantAccessService, CrmAccessService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

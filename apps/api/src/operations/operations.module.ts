import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { NotificationsModule } from "../notifications/notifications.module.js";
import {
  ApprovalController,
  CapacitySnapshotController,
  OperationsSearchController,
  ReleaseVisibilityController,
} from "./operations.controller.js";
import {
  ApprovalService,
  CapacitySnapshotService,
  OperationsSearchService,
  ReleaseVisibilityService,
} from "./operations.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule, NotificationsModule],
  controllers: [
    ApprovalController,
    OperationsSearchController,
    ReleaseVisibilityController,
    CapacitySnapshotController,
  ],
  providers: [
    TenantAccessService,
    CrmAccessService,
    ApprovalService,
    OperationsSearchService,
    ReleaseVisibilityService,
    CapacitySnapshotService,
  ],
})
export class OperationsModule {}

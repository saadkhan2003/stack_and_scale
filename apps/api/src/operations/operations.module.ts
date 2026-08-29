import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import {
  ApprovalController,
  OperationsSearchController,
} from "./operations.controller.js";
import {
  ApprovalService,
  OperationsSearchService,
} from "./operations.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [ApprovalController, OperationsSearchController],
  providers: [
    TenantAccessService,
    CrmAccessService,
    ApprovalService,
    OperationsSearchService,
  ],
})
export class OperationsModule {}

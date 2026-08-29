import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import {
  ContractController,
  EsignCallbackController,
} from "./contract.controller.js";
import { ContractService, ESIGN_PROVIDER_ADAPTER } from "./contract.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [ContractController, EsignCallbackController],
  providers: [
    TenantAccessService,
    CrmAccessService,
    ContractService,
    { provide: ESIGN_PROVIDER_ADAPTER, useValue: undefined },
  ],
})
export class ContractModule {}

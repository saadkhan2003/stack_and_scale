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
import { PrivateFilesModule } from "../files/private-files.module.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule, PrivateFilesModule],
  controllers: [ContractController, EsignCallbackController],
  providers: [
    TenantAccessService,
    CrmAccessService,
    ContractService,
    { provide: ESIGN_PROVIDER_ADAPTER, useValue: undefined },
  ],
})
export class ContractModule {}

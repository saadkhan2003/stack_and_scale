import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import {
  ProposalController,
  PublicProposalController,
} from "./proposal.controller.js";
import { ProposalService } from "./proposal.service.js";
import { PrivateFilesModule } from "../files/private-files.module.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule, PrivateFilesModule],
  controllers: [ProposalController, PublicProposalController],
  providers: [TenantAccessService, CrmAccessService, ProposalService],
})
export class ProposalModule {}

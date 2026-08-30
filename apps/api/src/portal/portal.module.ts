import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { SupportModule } from "../support/support.module.js";
import { PortalAccessController } from "./portal-access.controller.js";
import { PortalAccessService } from "./portal-access.service.js";
import { PortalProjectsService } from "./portal-projects.service.js";
import { PortalReviewsService } from "./portal-reviews.service.js";
import { PortalCommercialService } from "./portal-commercial.service.js";
import { PortalMembershipsService } from "./portal-memberships.service.js";
import { PortalSupportService } from "./portal-support.service.js";

@Module({
  imports: [AuthModule, SupportModule],
  controllers: [PortalAccessController],
  providers: [
    PlatformDatabaseService,
    PortalAccessService,
    PortalProjectsService,
    PortalReviewsService,
    PortalCommercialService,
    PortalSupportService,
    PortalMembershipsService,
  ],
})
export class PortalModule {}

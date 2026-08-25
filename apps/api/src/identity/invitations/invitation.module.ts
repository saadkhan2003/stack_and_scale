import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";

import { ApiExceptionFilter } from "../../common/http/api-exception.filter.js";
import { AuthModule } from "../../auth/auth.module.js";
import { RateLimitModule } from "../../common/http/rate-limit.module.js";
import { PlatformDatabaseService } from "../../platform-database.service.js";
import { InvitationController } from "./invitation.controller.js";
import { InvitationService } from "./invitation.service.js";

@Module({
  imports: [AuthModule, RateLimitModule],
  controllers: [InvitationController],
  providers: [
    PlatformDatabaseService,
    InvitationService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class InvitationModule {}

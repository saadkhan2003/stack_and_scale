import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";

import { ApiExceptionFilter } from "../../common/http/api-exception.filter.js";
import { AuthModule } from "../../auth/auth.module.js";
import { RateLimitModule } from "../../common/http/rate-limit.module.js";
import { PlatformDatabaseService } from "../../platform-database.service.js";
import { SessionController } from "./session.controller.js";
import { SessionService } from "./session.service.js";

@Module({
  imports: [AuthModule, RateLimitModule],
  controllers: [SessionController],
  providers: [
    PlatformDatabaseService,
    SessionService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class SessionModule {}

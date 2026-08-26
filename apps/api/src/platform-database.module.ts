import { Module } from "@nestjs/common";

import { PlatformDatabaseService } from "./platform-database.service.js";

@Module({ providers: [PlatformDatabaseService], exports: [PlatformDatabaseService] })
export class PlatformDatabaseModule {}

import { Module } from "@nestjs/common";

import { LeadController } from "./lead.controller.js";
import { LeadService } from "./lead.service.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";

@Module({ imports: [PlatformDatabaseModule], controllers: [LeadController], providers: [LeadService] })
export class LeadModule {}

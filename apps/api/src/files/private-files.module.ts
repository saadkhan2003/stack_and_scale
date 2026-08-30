import { Module } from "@nestjs/common";
import { LocalPrivateStorage } from "@stack-and-scale/storage";
import { AuthModule } from "../auth/auth.module.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { PrivateFilesController } from "./private-files.controller.js";
import {
  MALWARE_SCAN_HOOK,
  PRIVATE_STORAGE,
  PrivateFilesService,
} from "./private-files.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [PrivateFilesController],
  providers: [
    TenantAccessService,
    CrmAccessService,
    PrivateFilesService,
    {
      provide: PRIVATE_STORAGE,
      useFactory: () =>
        new LocalPrivateStorage({
          rootDirectory:
            process.env["PRIVATE_STORAGE_ROOT"] ??
            "/tmp/stack-and-scale-private",
          policy: {
            allowedContentTypes: [
              "application/pdf",
              "image/png",
              "image/jpeg",
              "text/plain",
            ],
            maxBytes: Number(
              process.env["PRIVATE_STORAGE_MAX_BYTES"] ?? 25_000_000,
            ),
          },
        }),
    },
    {
      provide: MALWARE_SCAN_HOOK,
      useValue: { scan: () => Promise.resolve("pending" as const) },
    },
  ],
})
export class PrivateFilesModule {}

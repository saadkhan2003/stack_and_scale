import { Module } from "@nestjs/common";
import { readFileSync } from "node:fs";
import {
  LocalPrivateStorage,
  S3PrivateStorage,
  type PrivateObjectStorage,
} from "@stack-and-scale/storage";
import { AuthModule } from "../auth/auth.module.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { PrivateFilesController } from "./private-files.controller.js";
import { CanonicalArtifactService } from "./canonical-artifact.service.js";
import { createMalwareScanner } from "./clamav-scanner.js";
import {
  MALWARE_SCAN_HOOK,
  PRIVATE_STORAGE,
  PrivateFilesService,
  PrivateFilesRetentionService,
} from "./private-files.service.js";

const allowedContentTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
] as const;

function readEnvironmentSecret(
  environment: NodeJS.ProcessEnv,
  name: string,
): string | undefined {
  const direct = environment[name]?.trim();
  if (direct) return direct;
  const file = environment[`${name}_FILE`]?.trim();
  return file ? readFileSync(file, "utf8").trim() : undefined;
}

export function createPrivateStorage(
  environment: NodeJS.ProcessEnv = process.env,
): PrivateObjectStorage {
  const maxBytes = Number(
    environment["PRIVATE_STORAGE_MAX_BYTES"] ?? 25_000_000,
  );
  if ((environment["PRIVATE_STORAGE_PROVIDER"] ?? "local") !== "s3")
    return new LocalPrivateStorage({
      rootDirectory:
        environment["PRIVATE_STORAGE_ROOT"] ?? "/tmp/stack-and-scale-private",
      policy: { allowedContentTypes, maxBytes },
    });

  const accessKeyId = readEnvironmentSecret(
    environment,
    "PRIVATE_STORAGE_S3_ACCESS_KEY",
  );
  const secretAccessKey = readEnvironmentSecret(
    environment,
    "PRIVATE_STORAGE_S3_SECRET_KEY",
  );
  if (!accessKeyId || !secretAccessKey)
    throw new Error(
      "S3 private storage requires access and secret key credentials",
    );
  return new S3PrivateStorage({
    endpoint: requiredEnvironment(environment, "PRIVATE_STORAGE_S3_ENDPOINT"),
    region: environment["PRIVATE_STORAGE_S3_REGION"] ?? "us-east-1",
    bucket: requiredEnvironment(environment, "PRIVATE_STORAGE_S3_BUCKET"),
    accessKeyId,
    secretAccessKey,
    forcePathStyle:
      environment["PRIVATE_STORAGE_S3_FORCE_PATH_STYLE"] !== "false",
    policy: { allowedContentTypes, maxBytes },
  });
}

function requiredEnvironment(
  environment: NodeJS.ProcessEnv,
  name: string,
): string {
  const value = environment[name]?.trim();
  if (!value)
    throw new Error(`${name} must be set when PRIVATE_STORAGE_PROVIDER=s3`);
  return value;
}

@Module({
  imports: [AuthModule, PlatformDatabaseModule],
  controllers: [PrivateFilesController],
  providers: [
    TenantAccessService,
    CrmAccessService,
    PrivateFilesService,
    CanonicalArtifactService,
    PrivateFilesRetentionService,
    {
      provide: PRIVATE_STORAGE,
      useFactory: createPrivateStorage,
    },
    {
      provide: MALWARE_SCAN_HOOK,
      useFactory: createMalwareScanner,
    },
  ],
  exports: [PRIVATE_STORAGE, CanonicalArtifactService],
})
export class PrivateFilesModule {}

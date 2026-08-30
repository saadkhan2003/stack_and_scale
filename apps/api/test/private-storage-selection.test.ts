import { describe, expect, it } from "vitest";
import {
  LocalPrivateStorage,
  S3PrivateStorage,
} from "@stack-and-scale/storage";
import { createMalwareScanner } from "../src/files/clamav-scanner.js";
import { createPrivateStorage } from "../src/files/private-files.module.js";

describe("private storage infrastructure selection", () => {
  it("keeps the local storage fallback when no provider is selected", () => {
    expect(
      createPrivateStorage({ PRIVATE_STORAGE_ROOT: "/tmp/files" }),
    ).toBeInstanceOf(LocalPrivateStorage);
  });

  it("selects the configured S3-compatible adapter", () => {
    const storage = createPrivateStorage({
      PRIVATE_STORAGE_PROVIDER: "s3",
      PRIVATE_STORAGE_S3_ENDPOINT: "http://minio:9000",
      PRIVATE_STORAGE_S3_BUCKET: "private-files",
      PRIVATE_STORAGE_S3_ACCESS_KEY: "test-access-key",
      PRIVATE_STORAGE_S3_SECRET_KEY: "test-secret-key",
    });
    expect(storage).toBeInstanceOf(S3PrivateStorage);
  });

  it("rejects an incomplete S3 selection instead of silently falling back", () => {
    expect(() =>
      createPrivateStorage({
        PRIVATE_STORAGE_PROVIDER: "s3",
        PRIVATE_STORAGE_S3_ENDPOINT: "http://minio:9000",
        PRIVATE_STORAGE_S3_BUCKET: "private-files",
      }),
    ).toThrow("credentials");
  });

  it("keeps the pending scanner hook until ClamAV is explicitly enabled", async () => {
    await expect(
      createMalwareScanner({}).scan({
        fileId: "file",
        versionId: "version",
        body: Buffer.from("test"),
        contentType: "text/plain",
      }),
    ).resolves.toBe("pending");
    expect(
      createMalwareScanner({ MALWARE_SCAN_PROVIDER: "clamav" }).constructor
        .name,
    ).toBe("ClamAvScanner");
  });
});

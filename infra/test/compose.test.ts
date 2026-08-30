import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

const productionComposePath = new URL(
  "../compose.production.yaml",
  import.meta.url,
);
const productionEnvironmentExamplePath = new URL(
  "../../.env.production.example",
  import.meta.url,
);
const phase14StorageComposePath = new URL(
  "../compose.phase14-storage.yaml",
  import.meta.url,
);

describe("Phase 14 infrastructure Compose manifest", () => {
  it("is valid YAML and keeps storage services off host ports", async () => {
    const document = parseDocument(
      await readFile(productionComposePath, "utf8"),
    );
    expect(document.errors).toEqual([]);
    const compose = document.toJS() as {
      services: Record<string, Record<string, unknown>>;
      networks: Record<string, { internal?: boolean }>;
    };

    expect(compose.networks.storage.internal).toBe(true);
    for (const service of ["minio", "minio-init", "clamav"])
      expect(compose.services[service].ports).toBeUndefined();
    expect(compose.services.minio.healthcheck).toBeDefined();
    expect(compose.services.clamav.healthcheck).toBeDefined();
    expect(compose.services.documenso.profiles).toEqual(["documenso"]);
    expect(compose.services.minio.profiles).toEqual(["phase14-storage"]);
    expect(compose.services["minio-init"].profiles).toEqual([
      "phase14-storage",
    ]);
    expect(compose.services.clamav.profiles).toEqual(["phase14-storage"]);
    expect(compose.services.api.depends_on).toBeUndefined();
    expect(compose.services.api.secrets).toBeUndefined();
  });

  it("mounts private storage credentials only through the opt-in overlay", async () => {
    const document = parseDocument(
      await readFile(phase14StorageComposePath, "utf8"),
    );
    expect(document.errors).toEqual([]);
    const compose = document.toJS() as {
      services: Record<string, Record<string, unknown>>;
    };
    expect(compose.services.api.secrets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "minio_api_access_key" }),
        expect.objectContaining({ source: "minio_api_secret_key" }),
      ]),
    );
  });

  it("keeps storage providers inactive in the ordinary production template", async () => {
    const environment = await readFile(
      productionEnvironmentExamplePath,
      "utf8",
    );
    expect(environment).toContain("PRIVATE_STORAGE_PROVIDER=local");
    expect(environment).toContain("MALWARE_SCAN_PROVIDER=pending");
  });
});

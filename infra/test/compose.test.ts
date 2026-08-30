import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

const productionComposePath = new URL(
  "../compose.production.yaml",
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
    expect(compose.services.api.secrets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "minio_api_access_key" }),
        expect.objectContaining({ source: "minio_api_secret_key" }),
      ]),
    );
  });
});

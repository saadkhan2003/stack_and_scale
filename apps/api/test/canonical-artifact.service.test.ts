import { describe, expect, it, vi } from "vitest";

import { CanonicalArtifactService } from "../src/files/canonical-artifact.service.js";

function database(...rows: Array<{ rows: Array<Record<string, unknown>> }>) {
  return {
    query: vi
      .fn()
      .mockImplementation(() => Promise.resolve(rows.shift() ?? { rows: [] })),
  };
}

describe("canonical artifact retention and access", () => {
  it("stores private metadata with retention and does not cross tenant boundaries", async () => {
    const storage = {
      putObject: vi.fn().mockResolvedValue({ access: "private" }),
      createSignedAccess: vi.fn(),
    };
    const db = database({
      rows: [
        {
          id: "artifact",
          resource_type: "proposal",
          resource_id: "proposal-a",
          resource_version_id: "version-a",
          storage_key: "documents/proposal/proposal-a/version-a.pdf",
          checksum_sha256: "a".repeat(64),
        },
      ],
    });
    const service = new CanonicalArtifactService(db as never, storage as never);

    const result = await service.retain({
      organizationId: "org-a",
      actorId: "actor-a",
      resourceType: "proposal",
      resourceId: "proposal-a",
      resourceVersionId: "version-a",
      filename: "proposal-a.pdf",
      body: Buffer.from("pdf"),
      checksumSha256: "a".repeat(64),
    });

    expect(result.data).toMatchObject({ resource_id: "proposal-a" });
    expect(storage.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-a",
        contentType: "application/pdf",
      }),
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("interval '1 day'"),
      expect.arrayContaining([
        "org-a",
        "proposal",
        "proposal-a",
        "version-a",
        2555,
      ]),
    );
  });

  it("checks tenant and resource identity before issuing signed access", async () => {
    const db = database({ rows: [] });
    const service = new CanonicalArtifactService(db as never, {} as never);

    await expect(
      service.signedAccess("org-other", "actor", "contract", "contract-a"),
    ).rejects.toThrow("Document artifact not found");
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("organization_id = $1"),
      ["org-other", "contract", "contract-a"],
    );
  });
});

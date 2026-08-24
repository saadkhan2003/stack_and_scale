import { describe, expect, it } from "vitest";

import { createStorageObjectMetadata } from "../src/index.js";

describe("createStorageObjectMetadata", () => {
  const validMetadata = {
    id: "file_01JQ8G2M",
    organizationId: "org_01JQ8G2M",
    storageKey: "organizations/org_01JQ8G2M/proposals/proposal-01.pdf",
    originalFilename: "Proposal 01.pdf",
    contentType: "application/pdf",
    sizeBytes: 42_000,
    classification: "restricted" as const,
    uploadedByActorId: "usr_01JQ8G2M",
    createdAt: "2026-08-24T18:00:00.000Z",
    checksumSha256:
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  };

  it("creates private, organization-owned storage metadata", () => {
    expect(createStorageObjectMetadata(validMetadata)).toEqual({
      ...validMetadata,
      access: "private",
    });
  });

  it("rejects public access, malformed storage keys and invalid file details", () => {
    expect(() =>
      createStorageObjectMetadata({
        ...validMetadata,
        access: "public",
      }),
    ).toThrow("access must be private");

    expect(() =>
      createStorageObjectMetadata({
        ...validMetadata,
        storageKey: "/public/proposal.pdf",
      }),
    ).toThrow("storageKey must be a relative object key");

    expect(() =>
      createStorageObjectMetadata({
        ...validMetadata,
        sizeBytes: 0,
      }),
    ).toThrow("sizeBytes must be a positive safe integer");

    expect(() =>
      createStorageObjectMetadata({
        ...validMetadata,
        checksumSha256: "not-a-checksum",
      }),
    ).toThrow("checksumSha256 must be a lowercase SHA-256 hex digest");
  });
});

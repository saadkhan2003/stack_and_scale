import { describe, expect, it, vi } from "vitest";
import type { Queryable } from "@stack-and-scale/database";
import type {
  PrivateObjectStorage,
  PutPrivateObjectInput,
} from "@stack-and-scale/storage";
import type { PlatformDatabaseService } from "../src/platform-database.service.js";
import {
  PrivateFilesRetentionService,
  PrivateFilesService,
  canAccessPrivateFile,
} from "../src/files/private-files.service.js";

function storageMock(): PrivateObjectStorage {
  return {
    putObject: vi.fn((input: PutPrivateObjectInput) =>
      Promise.resolve({
        storageKey: `${input.organizationId}/${input.objectKey}`,
        contentType: input.contentType,
        sizeBytes: input.body.byteLength,
        access: "private" as const,
      }),
    ),
    deleteObject: vi.fn(() => Promise.resolve()),
    getObject: vi.fn(() => Promise.resolve(Buffer.from("body"))),
    createSignedAccess: vi.fn(() =>
      Promise.resolve({
        url: "private://object",
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      }),
    ),
  };
}

function serviceWith(
  db: Queryable,
  storage: PrivateObjectStorage,
  scan = "clean" as const,
) {
  return new PrivateFilesService(db as PlatformDatabaseService, storage, {
    scan: vi.fn(() => Promise.resolve(scan)),
  });
}

describe("private file lifecycle policy", () => {
  it("limits classification access by owner and role", () => {
    const restricted = {
      owner_id: "owner",
      classification: "restricted" as const,
    };
    expect(canAccessPrivateFile("member", "member", restricted, "read")).toBe(
      false,
    );
    expect(canAccessPrivateFile("owner", "member", restricted, "read")).toBe(
      true,
    );
    expect(canAccessPrivateFile("manager", "manager", restricted, "read")).toBe(
      false,
    );
    expect(canAccessPrivateFile("member", "admin", restricted, "manage")).toBe(
      true,
    );
  });

  it("deletes a stored object when scanning fails", async () => {
    const storage = storageMock();
    const queries: string[] = [];
    const db: Queryable = {
      query: vi.fn((text: string) => {
        queries.push(text);
        if (text.includes("reserve_private_storage"))
          return Promise.resolve({ rows: [{ reserved: true }] });
        return Promise.resolve({ rows: [] });
      }),
    };
    const scanner = {
      scan: vi.fn(() => Promise.reject(new Error("scanner unavailable"))),
    };
    const service = new PrivateFilesService(
      db as PlatformDatabaseService,
      storage,
      scanner,
    );

    await expect(
      service.upload("org-test", "owner", "owner", {
        filename: "contract.pdf",
        classification: "restricted",
        contentType: "application/pdf",
        body: Buffer.from("x"),
      }),
    ).rejects.toThrow("scanner unavailable");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const deleteObject = vi.mocked(storage.deleteObject);
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(
      queries.some((query) => query.includes("reserved_bytes=GREATEST")),
    ).toBe(true);
  });

  it("does not write a blob when the atomic quota reservation fails", async () => {
    const storage = storageMock();
    const db: Queryable = {
      query: vi.fn(() => Promise.resolve({ rows: [{ reserved: false }] })),
    };
    const service = serviceWith(db, storage);
    await expect(
      service.upload("org-test", "owner", "owner", {
        filename: "large.pdf",
        classification: "internal",
        contentType: "application/pdf",
        body: Buffer.from("x"),
      }),
    ).rejects.toThrow("quota");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const putObject = vi.mocked(storage.putObject);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("denies signed access to quarantined files before issuing a URL", async () => {
    const storage = storageMock();
    const db: Queryable = {
      query: vi.fn((text: string) =>
        Promise.resolve(
          text.includes("private_file_versions")
            ? {
                rows: [
                  {
                    owner_id: "owner",
                    classification: "restricted",
                    status: "quarantined",
                    version_id: "v1",
                    storage_key: "files/f/v1.pdf",
                    scan_status: "clean",
                  },
                ],
              }
            : { rows: [] },
        ),
      ),
    };
    const service = serviceWith(db, storage);
    await expect(
      service.signedAccess("org-test", "owner", "owner", "f"),
    ).rejects.toThrow("not available");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createSignedAccess = vi.mocked(storage.createSignedAccess);
    expect(createSignedAccess).not.toHaveBeenCalled();
  });

  it("filters legal holds out of retention expiry", async () => {
    const queries: string[] = [];
    const db: Queryable = {
      query: vi.fn((text: string) => {
        queries.push(text);
        return Promise.resolve({ rows: [] });
      }),
    };
    const retention = new PrivateFilesRetentionService(
      serviceWith(db, storageMock()),
      db as PlatformDatabaseService,
    );
    await retention.expireDue(new Date("2026-01-01T00:00:00.000Z"));
    expect(queries[0]).toContain("legal_hold=false");
  });
});

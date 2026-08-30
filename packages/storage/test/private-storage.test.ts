import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { LocalPrivateStorage } from "../src/index.js";

const storageRoots: string[] = [];

async function createStorage(): Promise<LocalPrivateStorage> {
  const rootDirectory = await mkdtemp(
    join(tmpdir(), "stack-and-scale-storage-"),
  );
  storageRoots.push(rootDirectory);

  return new LocalPrivateStorage({
    rootDirectory,
    policy: {
      allowedContentTypes: ["application/pdf", "image/png"],
      maxBytes: 16,
    },
  });
}

afterEach(async () => {
  await Promise.all(
    storageRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("LocalPrivateStorage", () => {
  it("isolates physical object paths by organization", async () => {
    const storage = await createStorage();

    const first = await storage.putObject({
      organizationId: "org-alpha",
      objectKey: "contracts/statement.pdf",
      contentType: "application/pdf",
      body: Buffer.from("alpha"),
    });
    const second = await storage.putObject({
      organizationId: "org-beta",
      objectKey: "contracts/statement.pdf",
      contentType: "application/pdf",
      body: Buffer.from("beta"),
    });

    expect(first.storageKey).toBe("org-alpha/contracts/statement.pdf");
    expect(second.storageKey).toBe("org-beta/contracts/statement.pdf");
    expect(first.storageKey).not.toBe(second.storageKey);
    await expect(
      storage.getObject({
        organizationId: "org-alpha",
        objectKey: "contracts/statement.pdf",
      }),
    ).resolves.toEqual(Buffer.from("alpha"));
    await expect(
      storage.getObject({
        organizationId: "org-beta",
        objectKey: "contracts/statement.pdf",
      }),
    ).resolves.toEqual(Buffer.from("beta"));
  });

  it("rejects paths that would escape the configured local root", async () => {
    const storage = await createStorage();
    const stored = await storage.putObject({
      organizationId: "org-alpha",
      objectKey: "proofs/payment.pdf",
      contentType: "application/pdf",
      body: Buffer.from("proof"),
    });

    expect(stored.storageKey).toBe("org-alpha/proofs/payment.pdf");
    await expect(
      storage.putObject({
        organizationId: "org-alpha",
        objectKey: "../outside.pdf",
        contentType: "application/pdf",
        body: Buffer.from("no"),
      }),
    ).rejects.toThrow("objectKey must be a safe relative object key");
  });

  it("rejects disallowed content types and over-limit uploads", async () => {
    const storage = await createStorage();

    await expect(
      storage.putObject({
        organizationId: "org-alpha",
        objectKey: "notes.txt",
        contentType: "text/plain",
        body: Buffer.from("no"),
      }),
    ).rejects.toThrow("contentType is not allowed");

    await expect(
      storage.putObject({
        organizationId: "org-alpha",
        objectKey: "large.pdf",
        contentType: "application/pdf",
        body: Buffer.alloc(17),
      }),
    ).rejects.toThrow("body exceeds the configured maximum size");
  });

  it("returns private storage metadata without a public URL", async () => {
    const storage = await createStorage();
    const stored = await storage.putObject({
      organizationId: "org-alpha",
      objectKey: "invoices/invoice.pdf",
      contentType: "application/pdf",
      body: Buffer.from("invoice"),
    });

    expect(stored.access).toBe("private");
    expect(stored).not.toHaveProperty("url");
    expect(stored).not.toHaveProperty("publicUrl");
    expect("createPublicUrl" in storage).toBe(false);
  });

  it("issues only short-lived signed private access", async () => {
    const storage = await createStorage();
    await storage.putObject({
      organizationId: "org-alpha",
      objectKey: "contracts/statement.pdf",
      contentType: "application/pdf",
      body: Buffer.from("statement"),
    });

    await expect(
      storage.createSignedAccess(
        { organizationId: "org-alpha", objectKey: "contracts/statement.pdf" },
        901,
      ),
    ).rejects.toThrow("15 minutes");
    const access = await storage.createSignedAccess(
      { organizationId: "org-alpha", objectKey: "contracts/statement.pdf" },
      300,
    );
    expect(access.url).toContain("private://");
    expect(Date.parse(access.expiresAt)).toBeGreaterThan(Date.now());
  });
});

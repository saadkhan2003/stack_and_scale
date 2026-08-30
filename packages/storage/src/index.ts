import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

export type PrivateStorageAccess = "private";

export type PrivateObjectReference = Readonly<{
  organizationId: string;
  objectKey: string;
}>;

export type PutPrivateObjectInput = PrivateObjectReference &
  Readonly<{
    contentType: string;
    body: Uint8Array;
  }>;

export type StoredPrivateObject = Readonly<{
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  access: PrivateStorageAccess;
}>;

/**
 * Provider-neutral private object-storage contract. It intentionally has no
 * public URL operation: authorization belongs to the application boundary.
 */
export interface PrivateObjectStorage {
  putObject(input: PutPrivateObjectInput): Promise<StoredPrivateObject>;
  getObject(reference: PrivateObjectReference): Promise<Buffer>;
  createSignedAccess(
    reference: PrivateObjectReference,
    expiresInSeconds: number,
  ): Promise<SignedPrivateAccess>;
}

export type SignedPrivateAccess = Readonly<{
  url: string;
  expiresAt: string;
}>;

export type LocalPrivateStorageOptions = Readonly<{
  rootDirectory: string;
  policy: Readonly<{
    allowedContentTypes: readonly string[];
    maxBytes: number;
  }>;
}>;

const organizationIdPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;

/**
 * Local development adapter that follows S3 object semantics while keeping all
 * objects private on the server filesystem. Replace this adapter with an
 * S3-compatible provider implementation without changing callers.
 */
export class LocalPrivateStorage implements PrivateObjectStorage {
  private readonly rootDirectory: string;
  private readonly allowedContentTypes: ReadonlySet<string>;
  private readonly maxBytes: number;

  public constructor(options: LocalPrivateStorageOptions) {
    if (options.rootDirectory.trim().length === 0) {
      throw new Error("rootDirectory must not be empty");
    }

    if (
      !Number.isSafeInteger(options.policy.maxBytes) ||
      options.policy.maxBytes < 1
    ) {
      throw new Error("maxBytes must be a positive safe integer");
    }

    if (options.policy.allowedContentTypes.length === 0) {
      throw new Error("allowedContentTypes must not be empty");
    }

    this.rootDirectory = resolve(options.rootDirectory);
    this.allowedContentTypes = new Set(options.policy.allowedContentTypes);
    this.maxBytes = options.policy.maxBytes;
  }

  public async putObject(
    input: PutPrivateObjectInput,
  ): Promise<StoredPrivateObject> {
    this.assertAllowedUpload(input);

    const storageKey = this.createStorageKey(input);
    const filePath = this.resolvePrivatePath(storageKey);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body, { flag: "w", mode: 0o600 });

    return {
      storageKey,
      contentType: input.contentType,
      sizeBytes: input.body.byteLength,
      access: "private",
    };
  }

  public async getObject(reference: PrivateObjectReference): Promise<Buffer> {
    return readFile(this.resolvePrivatePath(this.createStorageKey(reference)));
  }

  public async createSignedAccess(
    reference: PrivateObjectReference,
    expiresInSeconds: number,
  ): Promise<SignedPrivateAccess> {
    if (
      !Number.isSafeInteger(expiresInSeconds) ||
      expiresInSeconds < 1 ||
      expiresInSeconds > 900
    )
      throw new Error("signed access must expire within 15 minutes");
    const storageKey = this.createStorageKey(reference);
    await this.getObject(reference);
    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    ).toISOString();
    return {
      url: `private://${encodeURIComponent(storageKey)}?expires=${encodeURIComponent(expiresAt)}`,
      expiresAt,
    };
  }

  private assertAllowedUpload(input: PutPrivateObjectInput): void {
    this.assertSafeReference(input);

    if (!this.allowedContentTypes.has(input.contentType)) {
      throw new Error("contentType is not allowed");
    }

    if (input.body.byteLength > this.maxBytes) {
      throw new Error("body exceeds the configured maximum size");
    }
  }

  private createStorageKey(reference: PrivateObjectReference): string {
    this.assertSafeReference(reference);
    return `${reference.organizationId}/${reference.objectKey}`;
  }

  private assertSafeReference(reference: PrivateObjectReference): void {
    if (!organizationIdPattern.test(reference.organizationId)) {
      throw new Error("organizationId must be a safe organization identifier");
    }

    const segments = reference.objectKey.split("/");
    if (
      reference.objectKey.length === 0 ||
      reference.objectKey.startsWith("/") ||
      reference.objectKey.includes("\\") ||
      segments.some(
        (segment) =>
          segment.length === 0 || segment === "." || segment === "..",
      )
    ) {
      throw new Error("objectKey must be a safe relative object key");
    }
  }

  private resolvePrivatePath(storageKey: string): string {
    const candidatePath = resolve(this.rootDirectory, storageKey);
    const relativePath = relative(this.rootDirectory, candidatePath);
    if (
      relativePath.length === 0 ||
      relativePath === ".." ||
      relativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        "object key resolves outside the configured storage root",
      );
    }

    return candidatePath;
  }
}

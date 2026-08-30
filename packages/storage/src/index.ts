import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  deleteObject(reference: PrivateObjectReference): Promise<void>;
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

export type S3PrivateStorageOptions = Readonly<{
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
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

  public async deleteObject(reference: PrivateObjectReference): Promise<void> {
    try {
      await unlink(this.resolvePrivatePath(this.createStorageKey(reference)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
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

/**
 * Private S3-compatible adapter for MinIO or another explicitly configured
 * endpoint. It does not create buckets or alter bucket policy; those are
 * deployment responsibilities so the application credential stays scoped.
 */
export class S3PrivateStorage implements PrivateObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly allowedContentTypes: ReadonlySet<string>;
  private readonly maxBytes: number;

  public constructor(options: S3PrivateStorageOptions) {
    if (!options.endpoint.trim())
      throw new Error("S3 endpoint must not be empty");
    if (!options.region.trim()) throw new Error("S3 region must not be empty");
    if (!options.bucket.trim()) throw new Error("S3 bucket must not be empty");
    if (!options.accessKeyId.trim() || !options.secretAccessKey.trim())
      throw new Error("S3 credentials must not be empty");
    if (
      !Number.isSafeInteger(options.policy.maxBytes) ||
      options.policy.maxBytes < 1
    )
      throw new Error("maxBytes must be a positive safe integer");
    if (options.policy.allowedContentTypes.length === 0)
      throw new Error("allowedContentTypes must not be empty");

    this.client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      forcePathStyle: options.forcePathStyle ?? true,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
    this.bucket = options.bucket;
    this.allowedContentTypes = new Set(options.policy.allowedContentTypes);
    this.maxBytes = options.policy.maxBytes;
  }

  public async putObject(
    input: PutPrivateObjectInput,
  ): Promise<StoredPrivateObject> {
    this.assertAllowedUpload(input);
    const storageKey = this.createStorageKey(input);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
    return {
      storageKey,
      contentType: input.contentType,
      sizeBytes: input.body.byteLength,
      access: "private",
    };
  }

  public async getObject(reference: PrivateObjectReference): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.createStorageKey(reference),
      }),
    );
    if (!response.Body)
      throw new Error("S3 object response did not contain a body");
    return Buffer.from(await response.Body.transformToByteArray());
  }

  public async deleteObject(reference: PrivateObjectReference): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: this.createStorageKey(reference),
      }),
    );
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
    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    ).toISOString();
    return {
      url: await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.createStorageKey(reference),
        }),
        { expiresIn: expiresInSeconds },
      ),
      expiresAt,
    };
  }

  private assertAllowedUpload(input: PutPrivateObjectInput): void {
    this.assertSafeReference(input);
    if (!this.allowedContentTypes.has(input.contentType))
      throw new Error("contentType is not allowed");
    if (input.body.byteLength > this.maxBytes)
      throw new Error("body exceeds the configured maximum size");
  }

  private createStorageKey(reference: PrivateObjectReference): string {
    this.assertSafeReference(reference);
    return `${reference.organizationId}/${reference.objectKey}`;
  }

  private assertSafeReference(reference: PrivateObjectReference): void {
    if (!organizationIdPattern.test(reference.organizationId))
      throw new Error("organizationId must be a safe organization identifier");
    const segments = reference.objectKey.split("/");
    if (
      reference.objectKey.length === 0 ||
      reference.objectKey.startsWith("/") ||
      reference.objectKey.includes("\\") ||
      segments.some(
        (segment) =>
          segment.length === 0 || segment === "." || segment === "..",
      )
    )
      throw new Error("objectKey must be a safe relative object key");
  }
}

export type CanonicalPdfLineItem = Readonly<{
  description: string;
  quantity: number;
  unitPriceMinorUnits: number;
  totalMinorUnits: number;
  optional?: boolean;
}>;

export type CanonicalPdfEvidence = Readonly<{
  label: string;
  value: string;
}>;

export type CanonicalPdfInput = Readonly<{
  title: string;
  documentNumber: string;
  currency: string;
  issuedAt: string;
  validUntil?: string;
  notes?: string;
  lineItems: readonly CanonicalPdfLineItem[];
  evidence?: readonly CanonicalPdfEvidence[];
}>;

export type CanonicalPdf = Readonly<{
  body: Buffer;
  checksumSha256: string;
}>;

/**
 * Creates a deliberately small, deterministic PDF. The caller owns the
 * canonical data and supplies the historical issuedAt timestamp; no current
 * time, random ID, or producer-specific metadata enters the bytes.
 */
export function createCanonicalPdf(input: CanonicalPdfInput): CanonicalPdf {
  const lines = [
    input.title,
    `Document ${input.documentNumber}`,
    `Issued ${input.issuedAt}`,
    ...(input.validUntil ? [`Valid until ${input.validUntil}`] : []),
    "",
    ...input.lineItems.map(
      (item) =>
        `${item.optional ? "Optional: " : ""}${item.description} | ${item.quantity} x ${item.unitPriceMinorUnits} ${input.currency} | ${item.totalMinorUnits} ${input.currency}`,
    ),
    "",
    `Total currency: ${input.currency}`,
    ...(input.notes ? ["", input.notes] : []),
    ...(input.evidence && input.evidence.length > 0
      ? [
          "",
          "Evidence",
          ...input.evidence.map((item) => `${item.label}: ${item.value}`),
        ]
      : []),
  ].flatMap((line) => wrapPdfText(normalizePdfText(line), 92));

  const content = [
    "BT",
    "/F1 11 Tf",
    "50 742 Td",
    ...lines.flatMap((line, index) => [
      `(${escapePdfText(line)}) Tj`,
      ...(index === lines.length - 1 ? [] : ["0 -15 Td"]),
    ]),
    "ET",
  ].join("\n");
  const metadataDate = pdfDate(input.issuedAt);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Title (${escapePdfText(input.title)}) /CreationDate (${metadataDate}) /ModDate (${metadataDate}) >>`,
  ];
  const chunks = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.concat(chunks).byteLength);
    chunks.push(
      Buffer.from(`${index + 1} 0 obj\n${objects[index]}\nendobj\n`, "ascii"),
    );
  }
  const xrefOffset = Buffer.concat(chunks).byteLength;
  chunks.push(
    Buffer.from(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`,
      "ascii",
    ),
  );
  for (let index = 1; index <= objects.length; index += 1)
    chunks.push(
      Buffer.from(
        `${String(offsets[index]).padStart(10, "0")} 00000 n \n`,
        "ascii",
      ),
    );
  chunks.push(
    Buffer.from(
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
      "ascii",
    ),
  );
  const body = Buffer.concat(chunks);
  return {
    body,
    checksumSha256: createSha256(body),
  };
}

function normalizePdfText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\n/g, " ")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(value: string): string {
  return normalizePdfText(value).replace(
    /[\\()]/g,
    (character) => `\\${character}`,
  );
}

function wrapPdfText(value: string, width: number): string[] {
  if (value.length <= width) return [value];
  const result: string[] = [];
  for (let offset = 0; offset < value.length; offset += width)
    result.push(value.slice(offset, offset + width));
  return result;
}

function pdfDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error("issuedAt must be an ISO-8601 timestamp");
  const iso = date.toISOString();
  return `D:${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}${iso.slice(11, 13)}${iso.slice(14, 16)}${iso.slice(17, 19)}Z`;
}

function createSha256(body: Uint8Array): string {
  return createHash("sha256").update(body).digest("hex");
}

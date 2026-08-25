import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

type UnknownRecord = Record<string, unknown>;

interface FieldConfigLike extends UnknownRecord {
  name?: string;
  type?: string;
  required?: boolean;
  hasMany?: boolean;
  options?: Array<string | UnknownRecord>;
  fields?: FieldConfigLike[];
}

interface BlockConfigLike extends UnknownRecord {
  slug?: string;
  fields?: FieldConfigLike[];
}

type PayloadInstance = Awaited<
  ReturnType<(typeof import("payload"))["getPayload"]>
>;

const integrationEnabled = process.env["CMS_IT"] === "1";

const SAMPLE_GENERATABLE_FIELD_TYPES = new Set([
  "text",
  "textarea",
  "email",
  "code",
  "number",
  "checkbox",
  "date",
  "select",
  "radio",
  "json",
  "richtext",
  "point",
]);

const createdPageIds: string[] = [];
const createdMediaIds: string[] = [];

let payloadInstance: PayloadInstance | undefined;
let allBlocks: BlockConfigLike[] = [];

function requireDb(): PayloadInstance {
  if (!payloadInstance) {
    throw new Error("payload instance was not initialised");
  }
  return payloadInstance;
}

function errorSignature(error: unknown): { name: string; text: string } {
  const shaped = error as {
    name?: string;
    message?: string;
    data?: { errors?: Array<{ path?: string; message?: string }> };
  };
  const segments = [shaped?.name ?? "", shaped?.message ?? ""];
  for (const issue of shaped?.data?.errors ?? []) {
    segments.push(issue.path ?? "", issue.message ?? "");
  }
  return {
    name: shaped?.name ?? "",
    text: segments.join(" ").toLowerCase(),
  };
}

async function captureError(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  return undefined;
}

function optionValue(option: string | UnknownRecord): string {
  if (typeof option === "string") {
    return option;
  }
  const value = option.value ?? option.label;
  return typeof value === "string" ? value : "";
}

function firstOptionValue(field: FieldConfigLike): string {
  const first = field.options?.[0];
  return first === undefined ? "" : optionValue(first);
}

function samplePrimitive(field: FieldConfigLike): unknown {
  switch (field.type) {
    case "text":
    case "textarea":
    case "code":
      return "t-sample";
    case "email":
      return "t-contract@example.com";
    case "number":
      return 1;
    case "checkbox":
      return true;
    case "date":
      return new Date().toISOString();
    case "select":
    case "radio": {
      const value = firstOptionValue(field);
      return field.hasMany === true ? [value] : value;
    }
    case "json":
      return {};
    case "richtext":
      return {
        root: {
          type: "root",
          children: [],
          direction: null,
          format: "",
          indent: 0,
          version: 1,
        },
      };
    case "point":
      return [12.34, 56.78];
    default:
      return undefined;
  }
}

function requiredFieldsSupported(fields: FieldConfigLike[]): boolean {
  return fields.every((field) => {
    if (field.required !== true) {
      return true;
    }
    if (field.type === "group" || field.type === "array") {
      return requiredFieldsSupported(field.fields ?? []);
    }
    return SAMPLE_GENERATABLE_FIELD_TYPES.has(field.type ?? "");
  });
}

function buildRequiredData(fields: FieldConfigLike[]): UnknownRecord {
  const data: UnknownRecord = {};
  for (const field of fields) {
    const name = field.name;
    if (typeof name !== "string" || field.required !== true) {
      continue;
    }
    if (field.type === "group") {
      data[name] = buildRequiredData(field.fields ?? []);
      continue;
    }
    if (field.type === "array") {
      data[name] = [buildRequiredData(field.fields ?? [])];
      continue;
    }
    const sampled = samplePrimitive(field);
    if (sampled !== undefined) {
      data[name] = sampled;
    }
  }
  return data;
}

function usableBlocks(candidates: BlockConfigLike[]): BlockConfigLike[] {
  return candidates.filter((block) => {
    const slug = block.slug;
    if (typeof slug !== "string" || slug.length === 0) {
      return false;
    }
    return requiredFieldsSupported(
      Array.isArray(block.fields) ? block.fields : [],
    );
  });
}

function basePageData(label: string): UnknownRecord {
  const token = randomUUID();
  return {
    title: `t-${label}-${token}`,
    slug: `t-${label}-${token}`,
    seo: {
      metaTitle: `t-${label}`,
      metaDescription: `Contract fixture page ${label}.`,
    },
  };
}

function expectSentPrimitivesIntact(
  actualBlock: UnknownRecord,
  sentBlock: UnknownRecord,
): void {
  for (const [key, value] of Object.entries(sentBlock)) {
    if (value !== null && typeof value === "object") {
      continue;
    }
    expect(actualBlock[key], `layout field "${key}"`).toEqual(value);
  }
}

async function deleteQuietly(collection: string, id: string): Promise<void> {
  if (!payloadInstance) {
    return;
  }
  try {
    await payloadInstance.delete({
      collection,
      id,
    } as Parameters<PayloadInstance["delete"]>[0]);
  } catch {
    return;
  }
}

describe.skipIf(!integrationEnabled)(
  "CMS content contracts (local postgres)",
  () => {
    beforeAll(async () => {
      process.env["CMS_DATABASE_URL"] ??=
        "postgresql://stack_and_scale:local-development-only@127.0.0.1:5433/stack_and_scale";
      process.env["PAYLOAD_SECRET"] ??= "local-development-only-secret";

      const [{ getPayload }, configModule] = await Promise.all([
        import("payload"),
        import("../src/payload.config.js"),
      ]);
      payloadInstance = await getPayload({ config: configModule.default });

      const blocksHref = new URL("../src/blocks/index.js", import.meta.url)
        .href;
      const blocksModule = (await import(blocksHref)) as {
        allBlocks?: BlockConfigLike[];
      };
      allBlocks = Array.isArray(blocksModule.allBlocks)
        ? blocksModule.allBlocks
        : [];
    });

    afterAll(async () => {
      for (const id of [...createdPageIds].reverse()) {
        await deleteQuietly("pages", id);
      }
      for (const id of [...createdMediaIds].reverse()) {
        await deleteQuietly("media", id);
      }
    });

    describe("required SEO contract", () => {
      it("rejects a page without the seo group", async () => {
        const db = requireDb();
        const data = basePageData("seo-group");
        delete data.seo;

        const error = await captureError(() =>
          db.create({
            collection: "pages",
            data,
            draft: false,
          } as never),
        );

        expect(error).toBeDefined();
        const signature = errorSignature(error);
        expect(signature.name).toBe("ValidationError");
        expect(signature.text).toContain("metatitle");
      });

      it("rejects a page missing seo.metaDescription", async () => {
        const db = requireDb();
        const data = basePageData("seo-desc");
        const seo = data.seo as UnknownRecord;
        delete seo.metaDescription;

        const error = await captureError(() =>
          db.create({
            collection: "pages",
            data,
            draft: false,
          } as never),
        );

        expect(error).toBeDefined();
        const signature = errorSignature(error);
        expect(signature.name).toBe("ValidationError");
        expect(signature.text).toContain("metadescription");
      });
    });

    describe("unique slugs", () => {
      it("rejects a duplicate page slug", async () => {
        const db = requireDb();
        const sharedToken = randomUUID();
        const firstData = {
          ...basePageData("dup-a"),
          slug: `t-dup-${sharedToken}`,
        };
        const secondData = {
          ...basePageData("dup-b"),
          slug: `t-dup-${sharedToken}`,
        };

        const first = (await db.create({
          collection: "pages",
          data: firstData,
          draft: false,
        } as never)) as unknown as UnknownRecord;
        createdPageIds.push(String(first.id));

        const error = await captureError(() =>
          db.create({
            collection: "pages",
            data: secondData,
            draft: false,
          } as never),
        );

        expect(error).toBeDefined();
        const signature = errorSignature(error);
        const rejectedAsDuplicate =
          signature.name === "ValidationError" ||
          /duplicate|unique|violates unique constraint/.test(signature.text);
        expect(rejectedAsDuplicate).toBe(true);
      });
    });

    describe("relationship integrity", () => {
      it("populates page seo.ogImage and tolerates deletion of the referenced media", async () => {
        const db = requireDb();

        const pngByte = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          "base64",
        );
        const mediaDoc = (await db.create({
          collection: "media",
          data: {
            alt: "t-contract og image",
            caption: "Created by content contract tests.",
          },
          file: {
            data: pngByte,
            mimetype: "image/png",
            name: "t-contract.png",
            size: pngByte.length,
          },
        } as never)) as unknown as UnknownRecord;
        const mediaId = mediaDoc.id;
        createdMediaIds.push(String(mediaId));

        const pageData = basePageData("rel");
        (pageData.seo as UnknownRecord).ogImage = mediaId;
        let page: UnknownRecord;
        try {
          page = (await db.create({
            collection: "pages",
            data: pageData,
            draft: false,
          } as never)) as unknown as UnknownRecord;
        } catch (error) {
          const details = error as { data?: { errors?: unknown } };
          console.log(
            "DBG verr:",
            JSON.stringify(details?.data?.errors ?? String(error)),
          );
          throw error;
        }
        const pageId = String(page.id);
        createdPageIds.push(pageId);

        const populated = (await db.findByID({
          collection: "pages",
          id: pageId,
          depth: 1,
        })) as unknown as UnknownRecord;
        const populatedSeo = populated.seo as UnknownRecord;
        const populatedOgImage = populatedSeo.ogImage as UnknownRecord;
        expect(populatedOgImage.id).toEqual(mediaId);

        await db.delete({
          collection: "media",
          id: mediaId,
        } as Parameters<PayloadInstance["delete"]>[0]);

        const afterDelete = (await db.findByID({
          collection: "pages",
          id: pageId,
          depth: 0,
        })) as unknown as UnknownRecord;
        const remainingOgImage = (afterDelete.seo as UnknownRecord).ogImage;
        const clearedOrStale =
          remainingOgImage === null ||
          remainingOgImage === undefined ||
          remainingOgImage !== mediaId;
        expect(clearedOrStale).toBe(true);
      });
    });

    describe("rendering fixtures", () => {
      it("round-trips a minimal page with an empty layout", async () => {
        const db = requireDb();
        const data = basePageData("minimal");
        data.layout = [];

        const page = (await db.create({
          collection: "pages",
          data,
          draft: false,
        } as never)) as unknown as UnknownRecord;
        createdPageIds.push(String(page.id));

        const stored = (await db.findByID({
          collection: "pages",
          id: String(page.id),
          depth: 0,
        })) as unknown as UnknownRecord;

        expect(stored.slug).toEqual(data.slug);
        expect(stored.layout).toEqual([]);
      });

      it("round-trips a typical page built from at least three registered blocks", async () => {
        const db = requireDb();
        const chosen = usableBlocks(allBlocks).slice(0, 3);

        expect(chosen.length, "usable blocks in src/blocks registry").toBe(3);

        const layout = chosen.map((block) => ({
          blockType: block.slug as string,
          ...buildRequiredData(Array.isArray(block.fields) ? block.fields : []),
        }));

        const data = basePageData("typical");
        data.layout = layout;

        const page = (await db.create({
          collection: "pages",
          data,
          draft: false,
        } as never)) as unknown as UnknownRecord;
        createdPageIds.push(String(page.id));

        const stored = (await db.findByID({
          collection: "pages",
          id: String(page.id),
          depth: 0,
        })) as unknown as UnknownRecord;

        const storedLayout = stored.layout as UnknownRecord[];
        expect(storedLayout.map((entry) => entry.blockType)).toEqual(
          layout.map((entry) => entry.blockType),
        );
        for (const [index, sentBlock] of layout.entries()) {
          expectSentPrimitivesIntact(storedLayout[index]!, sentBlock);
        }
      });
    });

    describe("role and workflow authorization", () => {
      it("denies unauthenticated creation on the cms-users collection", async () => {
        const db = requireDb();

        const error = await captureError(() =>
          db.create({
            collection: "cms-users",
            overrideAccess: false,
            data: {
              email: `t-${randomUUID()}@example.com`,
              password: "t-Contract-Password-123!",
              role: "author",
              displayName: "t-contract",
            },
          }),
        );

        expect(error).toBeDefined();
        const signature = errorSignature(error);
        const forbidden =
          /forbidden/i.test(signature.name) ||
          /forbidden/i.test(signature.text);
        expect(forbidden).toBe(true);
      });

      it("returns the published version, not the draft, without draft requested", async () => {
        const db = requireDb();
        const data = basePageData("draft");

        const draftPage = (await db.create({
          collection: "pages",
          data,
          draft: true,
        })) as unknown as UnknownRecord;
        const pageId = String(draftPage.id);
        createdPageIds.push(pageId);
        expect(draftPage._status).toEqual("draft");

        await db.update({
          collection: "pages",
          id: pageId,
          data: { _status: "published" },
          draft: false,
        } as never);

        const published = (await db.findByID({
          collection: "pages",
          id: pageId,
        })) as unknown as UnknownRecord;
        expect(published._status).toEqual("published");
        const publishedTitle = String(published.title);

        const editedDraft = (await db.update({
          collection: "pages",
          id: pageId,
          data: { title: `${String(data.title)}-edited` },
          draft: true,
        } as never)) as unknown as UnknownRecord;
        expect(editedDraft._status).toEqual("draft");

        const stillPublished = (await db.findByID({
          collection: "pages",
          id: pageId,
        })) as unknown as UnknownRecord;
        expect(stillPublished.title).toEqual(publishedTitle);

        const latestDraft = (await db.findByID({
          collection: "pages",
          id: pageId,
          draft: true,
        })) as unknown as UnknownRecord;
        expect(latestDraft.title).toEqual(`${String(data.title)}-edited`);
        expect(latestDraft._status).toEqual("draft");
      });
    });
  },
);

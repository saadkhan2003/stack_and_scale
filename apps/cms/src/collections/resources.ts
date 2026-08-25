import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";

function validateMaxLength(max: number) {
  return (value: unknown): true | string => {
    if (typeof value !== "string" || value.length === 0) {
      return true;
    }
    return value.length <= max ? true : `Must be ${max} characters or fewer.`;
  };
}

export const resources: CollectionConfig = {
  slug: "resources",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "type", "publishedAt", "slug", "_status"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Title",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Unique URL-safe identifier for this resource.",
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Article", value: "article" },
        { label: "Guide", value: "guide" },
        { label: "Whitepaper", value: "whitepaper" },
        { label: "Video", value: "video" },
      ],
      label: "Type",
    },
    {
      name: "authors",
      type: "relationship",
      relationTo: "authors",
      hasMany: true,
      label: "Authors",
    },
    {
      name: "body",
      type: "richText",
      required: true,
      label: "Body",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Cover image",
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
        },
      },
      label: "Published at",
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        {
          name: "metaTitle",
          type: "text",
          required: true,
          validate: validateMaxLength(60),
          admin: {
            description: "Recommended: up to 60 characters.",
          },
        },
        {
          name: "metaDescription",
          type: "textarea",
          required: true,
          validate: validateMaxLength(160),
          admin: {
            description: "Recommended: up to 160 characters.",
          },
        },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          label: "Open Graph image",
        },
      ],
    },
  ],
};

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

export const industries: CollectionConfig = {
  slug: "industries",
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
    defaultColumns: ["title", "slug", "_status"],
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
        description: "Unique URL-safe identifier for this industry.",
      },
    },
    {
      name: "description",
      type: "richText",
      required: true,
      label: "Description",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Hero image",
    },
    {
      name: "relatedServices",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      label: "Related services",
    },
    {
      name: "stats",
      type: "array",
      label: "Stats",
      labels: {
        singular: "Stat",
        plural: "Stats",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Label",
        },
        {
          name: "value",
          type: "text",
          required: true,
          label: "Value",
        },
      ],
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

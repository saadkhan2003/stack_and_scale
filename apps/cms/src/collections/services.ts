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

export const services: CollectionConfig = {
  slug: "services",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    useAsTitle: "title",
    group: "Offer",
    defaultColumns: ["title", "summary", "slug", "_status"],
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
        description: "Unique URL-safe identifier for this service.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      label: "Summary",
    },
    {
      name: "icon",
      type: "text",
      label: "Icon",
      admin: {
        description: "Label of the icon used to represent this service.",
      },
    },
    {
      name: "overview",
      type: "richText",
      required: true,
      label: "Overview",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "deliverables",
      type: "array",
      label: "Deliverables",
      labels: {
        singular: "Deliverable",
        plural: "Deliverables",
      },
      fields: [
        {
          name: "deliverable",
          type: "text",
          required: true,
          label: "Deliverable",
        },
      ],
    },
    {
      name: "relatedServices",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      label: "Related services",
    },
    {
      name: "relatedIndustries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
      label: "Related industries",
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

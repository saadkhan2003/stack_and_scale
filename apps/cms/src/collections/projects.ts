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

export const projects: CollectionConfig = {
  slug: "projects",
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
    defaultColumns: ["title", "clientName", "industry", "slug", "_status"],
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
        description: "Unique URL-safe identifier for this project.",
      },
    },
    {
      name: "clientName",
      type: "text",
      label: "Client name",
      admin: {
        description:
          "Free-text client name to avoid coupling to the clients collection.",
      },
    },
    {
      name: "industry",
      type: "relationship",
      relationTo: "industries",
      label: "Industry",
    },
    {
      name: "servicesDelivered",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      label: "Services delivered",
    },
    {
      name: "summary",
      type: "richText",
      required: true,
      label: "Summary",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "challenge",
      type: "richText",
      label: "Challenge",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "approach",
      type: "richText",
      label: "Approach",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "outcome",
      type: "richText",
      label: "Outcome",
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
      name: "metrics",
      type: "array",
      label: "Metrics",
      labels: {
        singular: "Metric",
        plural: "Metrics",
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
      name: "testimonialQuote",
      type: "text",
      label: "Testimonial quote",
    },
    {
      name: "testimonialAuthor",
      type: "text",
      label: "Testimonial author",
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

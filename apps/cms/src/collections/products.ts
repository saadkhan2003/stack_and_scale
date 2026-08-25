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

function validateCurrency(value: unknown): true | string {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  return typeof value === "string" && /^[A-Z]{3}$/.test(value)
    ? true
    : "Currency must be a three-letter uppercase ISO 4217 code.";
}

export const products: CollectionConfig = {
  slug: "products",
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
    defaultColumns: ["title", "tagline", "slug", "_status"],
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
        description: "Unique URL-safe identifier for this product.",
      },
    },
    {
      name: "tagline",
      type: "text",
      label: "Tagline",
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Hero image",
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
      name: "features",
      type: "array",
      label: "Features",
      labels: {
        singular: "Feature",
        plural: "Features",
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Title",
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          label: "Description",
        },
      ],
    },
    {
      name: "plans",
      type: "array",
      label: "Plans",
      labels: {
        singular: "Plan",
        plural: "Plans",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: "Name",
        },
        {
          name: "priceMonthly",
          type: "number",
          required: true,
          min: 0,
          label: "Price per month",
        },
        {
          name: "currency",
          type: "text",
          defaultValue: "USD",
          validate: validateCurrency,
          admin: {
            description: "Three-letter uppercase ISO 4217 code, e.g. USD.",
          },
        },
        {
          name: "highlights",
          type: "array",
          label: "Highlights",
          fields: [
            {
              name: "highlight",
              type: "text",
              required: true,
              label: "Highlight",
            },
          ],
        },
      ],
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      label: "Related products",
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
      name: "interfaceShowcase",
      type: "array",
      label: "Interface showcase",
      labels: {
        singular: "Screenshot",
        plural: "Screenshots",
      },
      fields: [
        {
          name: "screenshot",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Screenshot",
        },
        {
          name: "caption",
          type: "text",
          label: "Caption",
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

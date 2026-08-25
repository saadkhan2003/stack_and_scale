import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";

export const careers: CollectionConfig = {
  slug: "careers",
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
    defaultColumns: ["title", "location", "employmentType", "isOpen", "slug"],
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
        description: "Unique URL-safe identifier for this opening.",
      },
    },
    {
      name: "location",
      type: "text",
      label: "Location",
    },
    {
      name: "employmentType",
      type: "select",
      required: true,
      options: [
        { label: "Full-time", value: "full-time" },
        { label: "Part-time", value: "part-time" },
        { label: "Contract", value: "contract" },
      ],
      label: "Employment type",
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
      name: "isOpen",
      type: "checkbox",
      defaultValue: true,
      label: "Open for applications",
    },
    {
      name: "postedAt",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
      defaultValue: () => new Date().toISOString(),
      label: "Posted at",
    },
  ],
};

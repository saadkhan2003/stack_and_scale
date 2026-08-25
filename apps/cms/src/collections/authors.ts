import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";

export const authors: CollectionConfig = {
  slug: "authors",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    useAsTitle: "name",
    group: "Content",
    defaultColumns: ["name", "role", "slug"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Name",
    },
    {
      name: "role",
      type: "text",
      label: "Role",
    },
    {
      name: "bio",
      type: "richText",
      label: "Bio",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      label: "Avatar",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Unique URL-safe identifier for this author.",
      },
    },
  ],
};

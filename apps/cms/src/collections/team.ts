import type { CollectionConfig } from "payload";

export const team: CollectionConfig = {
  slug: "team",
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
    defaultColumns: ["name", "role", "order", "slug"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
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
      required: true,
      label: "Role",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Unique URL-safe identifier for this team member.",
      },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Photo",
    },
    {
      name: "bio",
      type: "text",
      label: "Bio",
    },
    {
      name: "order",
      type: "number",
      label: "Order",
      admin: {
        description: "Sort position on the team page. Lower numbers first.",
      },
    },
  ],
};

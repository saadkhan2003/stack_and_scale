import type { CollectionConfig } from "payload";

export const testimonials: CollectionConfig = {
  slug: "testimonials",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    useAsTitle: "authorName",
    group: "Content",
    defaultColumns: ["authorName", "company", "quote"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  fields: [
    {
      name: "quote",
      type: "textarea",
      required: true,
      maxLength: 600,
      label: "Quote",
    },
    {
      name: "authorName",
      type: "text",
      required: true,
      label: "Author name",
    },
    {
      name: "authorRole",
      type: "text",
      label: "Author role",
    },
    {
      name: "company",
      type: "text",
      label: "Company",
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      label: "Avatar",
    },
  ],
};

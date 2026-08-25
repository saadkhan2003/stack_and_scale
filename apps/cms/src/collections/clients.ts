import type { CollectionConfig } from "payload";

function validateUrl(value: unknown): true | string {
  if (typeof value !== "string" || value.length === 0) {
    return true;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return "Must be a valid absolute URL, e.g. https://example.com.";
  }
}

export const clients: CollectionConfig = {
  slug: "clients",
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
    defaultColumns: ["name", "url", "logo"],
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
      unique: true,
      label: "Name",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Logo",
    },
    {
      name: "url",
      type: "text",
      validate: validateUrl,
      admin: {
        description: "Optional. Absolute URL including https://.",
      },
    },
  ],
};

import type { CollectionConfig } from "payload";

export const siteSettings: CollectionConfig = {
  slug: "site-settings",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    group: "Configuration",
  },
  labels: {
    singular: "Site Settings",
    plural: "Site Settings",
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      required: true,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "defaultOgImage",
      type: "upload",
      relationTo: "media",
      label: "Default OG image",
    },
    {
      name: "socialLinks",
      type: "array",
      label: "Social links",
      fields: [
        {
          name: "platform",
          type: "text",
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "footerNote",
      type: "textarea",
    },
  ],
};

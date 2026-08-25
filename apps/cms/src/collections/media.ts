import type { CollectionConfig } from "payload";

export const media: CollectionConfig = {
  slug: "media",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    group: "Content",
  },
  upload: {
    staticDir: "../public/media",
    mimeTypes: ["image/*", "video/mp4", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 320, height: 320, position: "centre" },
      { name: "card", width: 768, height: 768, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alternative text",
      admin: {
        description:
          "Required for accessibility. Describe what the image shows.",
      },
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "classification",
      type: "select",
      defaultValue: "public",
      required: true,
      options: [
        { label: "Public website asset", value: "public" },
        { label: "Internal use only", value: "internal" },
      ],
      admin: {
        description:
          "Internal assets must never be referenced by public pages.",
      },
    },
  ],
};

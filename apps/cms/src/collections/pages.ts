import type { CollectionConfig } from "payload";

import { allBlocks } from "../blocks/index.js";

export const pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status"],
    livePreview: {
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 390, height: 844 },
        { label: "Desktop", name: "desktop", width: "100%", height: "100%" },
      ],
      url: ({ data }) => {
        if (typeof data.slug !== "string" || data.slug.length === 0) return null;
        const publicUrl = process.env["WEB_PUBLIC_URL"] ?? "http://127.0.0.1:3100";
        return `${publicUrl}/${data.slug}`;
      },
    },
  },
  labels: {
    singular: "Page",
    plural: "Pages",
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
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL path segment. Must be unique across all pages.",
      },
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
          maxLength: 60,
          admin: {
            description: "Shown in search results. Maximum 60 characters.",
          },
        },
        {
          name: "metaDescription",
          type: "text",
          required: true,
          maxLength: 160,
          admin: {
            description:
              "Shown under the title in search results. Maximum 160 characters.",
          },
        },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          label: "OG image",
        },
      ],
    },
    {
      name: "layout",
      type: "blocks",
      blocks: allBlocks,
    },
  ],
};

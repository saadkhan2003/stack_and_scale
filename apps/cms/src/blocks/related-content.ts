import type { Block } from "payload";

export const relatedContent: Block = {
  slug: "relatedContent",
  labels: {
    singular: "Related content",
    plural: "Related content blocks",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "heading",
      type: "text",
      label: "Heading",
    },
    {
      name: "pages",
      type: "relationship",
      label: "Pages",
      relationTo: "pages",
      hasMany: true,
    },
    {
      name: "products",
      type: "relationship",
      label: "Products",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "services",
      type: "relationship",
      label: "Services",
      relationTo: "services",
      hasMany: true,
    },
    {
      name: "projects",
      type: "relationship",
      label: "Projects",
      relationTo: "projects",
      hasMany: true,
    },
    {
      name: "resources",
      type: "relationship",
      label: "Resources",
      relationTo: "resources",
      hasMany: true,
    },
  ],
};

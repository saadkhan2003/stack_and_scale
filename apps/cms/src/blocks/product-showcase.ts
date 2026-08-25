import type { Block } from "payload";

export const productShowcase: Block = {
  slug: "productShowcase",
  labels: {
    singular: "Product showcase",
    plural: "Product showcases",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "headline",
      type: "text",
      label: "Headline",
    },
    {
      name: "product",
      type: "relationship",
      label: "Product",
      relationTo: "products",
      required: true,
    },
  ],
};

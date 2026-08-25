import type { Block } from "payload";

export const richText: Block = {
  slug: "richText",
  labels: {
    singular: "Rich text",
    plural: "Rich text blocks",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "content",
      type: "richText",
      label: "Content",
      required: true,
    },
  ],
};

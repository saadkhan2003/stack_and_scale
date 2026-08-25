import type { Block } from "payload";

export const cta: Block = {
  slug: "cta",
  labels: {
    singular: "CTA",
    plural: "CTA blocks",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "heading",
      type: "text",
      label: "Heading",
      required: true,
    },
    {
      name: "body",
      type: "textarea",
      label: "Body",
    },
    {
      name: "buttonLabel",
      type: "text",
      label: "Button label",
      required: true,
    },
    {
      name: "buttonUrl",
      type: "text",
      label: "Button URL",
      required: true,
    },
  ],
};

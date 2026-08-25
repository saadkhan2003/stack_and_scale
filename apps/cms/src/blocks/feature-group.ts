import type { Block } from "payload";

export const featureGroup: Block = {
  slug: "featureGroup",
  labels: {
    singular: "Feature group",
    plural: "Feature groups",
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
      name: "items",
      type: "array",
      label: "Features",
      minRows: 1,
      fields: [
        {
          name: "iconLabel",
          type: "text",
          label: "Icon label",
          admin: {
            description: "Short label used to pick or render the icon.",
          },
        },
        {
          name: "title",
          type: "text",
          label: "Title",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Description",
        },
      ],
    },
  ],
};

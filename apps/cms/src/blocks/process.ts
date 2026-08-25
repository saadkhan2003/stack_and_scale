import type { Block } from "payload";

export const process: Block = {
  slug: "process",
  labels: {
    singular: "Process",
    plural: "Process blocks",
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
      name: "steps",
      type: "array",
      label: "Steps",
      minRows: 2,
      required: true,
      labels: {
        singular: "Step",
        plural: "Steps",
      },
      admin: {
        description: "Steps render in the order listed here.",
      },
      fields: [
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

import type { Block } from "payload";

export const metricGroup: Block = {
  slug: "metricGroup",
  labels: {
    singular: "Metric group",
    plural: "Metric groups",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Metrics",
      minRows: 1,
      fields: [
        {
          name: "label",
          type: "text",
          label: "Label",
          required: true,
        },
        {
          name: "value",
          type: "text",
          label: "Value",
          required: true,
        },
        {
          name: "suffix",
          type: "text",
          label: "Suffix",
          admin: {
            description: "Optional unit shown after the value, such as % or x.",
          },
        },
      ],
    },
  ],
};

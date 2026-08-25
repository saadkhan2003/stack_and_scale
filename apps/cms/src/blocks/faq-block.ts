import type { Block } from "payload";

export const faqBlock: Block = {
  slug: "faqBlock",
  labels: {
    singular: "FAQ block",
    plural: "FAQ blocks",
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
      name: "faqs",
      type: "relationship",
      label: "Linked FAQs",
      relationTo: "faqs",
      hasMany: true,
      admin: {
        description:
          "Curated FAQs from the FAQ library. Used when at least one FAQ is selected.",
      },
    },
    {
      name: "items",
      type: "array",
      label: "Inline FAQs",
      labels: {
        singular: "Inline FAQ",
        plural: "Inline FAQs",
      },
      minRows: 1,
      admin: {
        description:
          "One-off fallback questions rendered when no linked FAQs are selected.",
      },
      fields: [
        {
          name: "question",
          type: "text",
          label: "Question",
          required: true,
        },
        {
          name: "answer",
          type: "textarea",
          label: "Answer",
          required: true,
        },
      ],
    },
  ],
};

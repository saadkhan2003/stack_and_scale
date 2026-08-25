import type { Block } from "payload";

export const hero: Block = {
  slug: "hero",
  labels: {
    singular: "Hero",
    plural: "Heroes",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "variant",
      type: "select",
      label: "Variant",
      required: true,
      defaultValue: "split",
      options: [
        { label: "Split", value: "split" },
        { label: "Centered", value: "centered" },
        { label: "Minimal", value: "minimal" },
      ],
    },
    {
      name: "eyebrow",
      type: "text",
      label: "Eyebrow",
      admin: {
        description: "Short line shown above the heading.",
      },
    },
    {
      name: "heading",
      type: "text",
      label: "Heading",
      required: true,
    },
    {
      name: "subheading",
      type: "textarea",
      label: "Subheading",
    },
    {
      name: "ctas",
      type: "array",
      label: "Calls to action",
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: "label",
          type: "text",
          label: "Label",
          required: true,
        },
        {
          name: "url",
          type: "text",
          label: "URL",
          required: true,
        },
        {
          name: "style",
          type: "select",
          label: "Style",
          defaultValue: "primary",
          required: true,
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
      ],
    },
    {
      name: "image",
      type: "upload",
      label: "Image",
      relationTo: "media",
      admin: {
        description:
          "Alternative text is inherited from the selected media record.",
      },
    },
  ],
};

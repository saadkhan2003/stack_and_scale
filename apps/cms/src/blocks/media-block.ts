import type { Block } from "payload";

export const mediaBlock: Block = {
  slug: "mediaBlock",
  labels: {
    singular: "Media",
    plural: "Media blocks",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "image",
      type: "upload",
      label: "Image",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Alternative text is inherited from the selected media record.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Caption",
    },
  ],
};

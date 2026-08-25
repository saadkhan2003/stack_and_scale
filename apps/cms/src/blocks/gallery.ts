import type { Block } from "payload";

export const gallery: Block = {
  slug: "gallery",
  labels: {
    singular: "Gallery",
    plural: "Galleries",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "images",
      type: "upload",
      label: "Images",
      relationTo: "media",
      hasMany: true,
      minRows: 2,
      required: true,
      admin: {
        description:
          "Pick at least two images. Alternative text is inherited from each media record.",
      },
    },
  ],
};

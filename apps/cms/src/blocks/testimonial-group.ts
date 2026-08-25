import type { Block } from "payload";

export const testimonialGroup: Block = {
  slug: "testimonialGroup",
  labels: {
    singular: "Testimonial group",
    plural: "Testimonial groups",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Testimonials",
      minRows: 1,
      fields: [
        {
          name: "quote",
          type: "textarea",
          label: "Quote",
          required: true,
          maxLength: 600,
        },
        {
          name: "authorName",
          type: "text",
          label: "Author name",
          required: true,
        },
        {
          name: "authorRole",
          type: "text",
          label: "Author role",
          admin: {
            description: "Role and company shown under the author name.",
          },
        },
      ],
    },
  ],
};

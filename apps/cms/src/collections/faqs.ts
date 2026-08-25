import type { CollectionConfig } from "payload";

export const faqs: CollectionConfig = {
  slug: "faqs",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    useAsTitle: "question",
    group: "Content",
    defaultColumns: ["question", "category", "order"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  fields: [
    {
      name: "question",
      type: "text",
      required: true,
      label: "Question",
    },
    {
      name: "answer",
      type: "textarea",
      required: true,
      label: "Answer",
    },
    {
      name: "category",
      type: "text",
      label: "Category",
    },
    {
      name: "order",
      type: "number",
      label: "Order",
      admin: {
        description: "Sort position. Lower numbers first.",
      },
    },
  ],
};

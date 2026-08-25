import type { CollectionConfig, Field } from "payload";

function linkFields(): Field[] {
  return [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "linkType",
      type: "radio",
      defaultValue: "internal",
      label: "Link type",
      options: [
        { label: "Internal page", value: "internal" },
        { label: "External URL", value: "external" },
      ],
    },
    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
      label: "Page",
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType !== "external",
      },
    },
    {
      name: "url",
      type: "text",
      label: "URL",
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType === "external",
      },
    },
  ];
}

export const navigation: CollectionConfig = {
  slug: "navigation",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    group: "Configuration",
    defaultColumns: ["items"],
  },
  labels: {
    singular: "Navigation",
    plural: "Navigation",
  },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      label: "Menu items",
      fields: [
        ...linkFields(),
        {
          name: "children",
          type: "array",
          label: "Child items",
          maxRows: 10,
          fields: [...linkFields()],
        },
      ],
    },
  ],
};

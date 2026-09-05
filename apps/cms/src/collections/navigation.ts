import type { CollectionConfig, Field } from "payload";

function linkFields(): Field[] {
  return [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "badge",
      type: "text",
      label: "Badge (e.g. NEW, BETA)",
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
  },
  labels: {
    singular: "Navigation",
    plural: "Navigation",
  },
  fields: [
    {
      name: "announcement",
      type: "group",
      label: "Global Announcement Bar",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: false,
          label: "Enable Announcement Bar",
        },
        {
          name: "badge",
          type: "text",
          label: "Badge (e.g. NEW, RELEASE)",
        },
        {
          name: "text",
          type: "text",
          label: "Announcement text",
        },
        {
          name: "ctaText",
          type: "text",
          label: "Call to action label",
        },
        {
          name: "ctaHref",
          type: "text",
          label: "Call to action destination URL / path",
        },
      ],
    },
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

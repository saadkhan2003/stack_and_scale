import type {
  CollectionConfig,
  RelationshipFieldValidation,
  TextFieldValidation,
} from "payload";

const requireTarget: TextFieldValidation = (value, { siblingData }) => {
  if (Boolean(value) || hasTarget(siblingData)) {
    return true;
  }
  return "Provide a destination URL or a destination page.";
};

const requirePageOrUrlTarget: RelationshipFieldValidation = (
  value,
  { siblingData },
) => {
  if (Boolean(value) || hasTarget(siblingData)) {
    return true;
  }
  return "Provide a destination URL or a destination page.";
};

function hasTarget(siblingData: unknown): boolean {
  if (typeof siblingData !== "object" || siblingData === null) {
    return false;
  }
  const candidate = siblingData as { toUrl?: unknown; toPage?: unknown };
  return Boolean(candidate.toUrl) || Boolean(candidate.toPage);
}

export const redirects: CollectionConfig = {
  slug: "redirects",
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    group: "Configuration",
    useAsTitle: "fromPath",
    defaultColumns: ["fromPath", "toPage", "toUrl", "permanent"],
  },
  labels: {
    singular: "Redirect",
    plural: "Redirects",
  },
  fields: [
    {
      name: "fromPath",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Original path starting with a slash, e.g. /old-page.",
      },
    },
    {
      name: "toUrl",
      type: "text",
      label: "Destination URL",
      validate: requireTarget,
    },
    {
      name: "toPage",
      type: "relationship",
      relationTo: "pages",
      label: "Destination page",
      validate: requirePageOrUrlTarget,
    },
    {
      name: "permanent",
      type: "checkbox",
      label: "Permanent redirect",
      defaultValue: true,
    },
  ],
};

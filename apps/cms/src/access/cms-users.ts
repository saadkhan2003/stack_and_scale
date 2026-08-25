import type { CollectionConfig } from "payload";

export const CMS_ROLES = [
  "administrator",
  "publisher",
  "editor",
  "author",
] as const;

export type CmsRole = (typeof CMS_ROLES)[number];

export const cmsUsers: CollectionConfig = {
  slug: "cms-users",
  auth: {
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 15,
    tokenExpiration: 60 * 60 * 8,
  },
  admin: {
    useAsTitle: "email",
    group: "Administration",
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user }, id }) => Boolean(user) && user?.id === id,
    delete: ({ req: { user } }) => Boolean(user && isAdministrator(user)),
    admin: ({ req: { user } }) => {
      if (!user) {
        return false;
      }
      return true;
    },
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "author",
      options: [...CMS_ROLES],
      access: {
        update: ({ req: { user } }) => Boolean(user && isAdministrator(user)),
      },
    },
    {
      name: "displayName",
      type: "text",
    },
  ],
};

function isAdministrator(user: unknown): boolean {
  if (typeof user !== "object" || user === null) {
    return false;
  }
  return (user as { role?: string }).role === "administrator";
}

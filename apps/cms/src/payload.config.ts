import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

import { pages } from "./collections/pages.js";
import { navigation } from "./collections/navigation.js";
import { siteSettings } from "./collections/site-settings.js";
import { redirects } from "./collections/redirects.js";
import { products } from "./collections/products.js";
import { services } from "./collections/services.js";
import { industries } from "./collections/industries.js";
import { projects } from "./collections/projects.js";
import { resources } from "./collections/resources.js";
import { authors } from "./collections/authors.js";
import { team } from "./collections/team.js";
import { testimonials } from "./collections/testimonials.js";
import { clients } from "./collections/clients.js";
import { careers } from "./collections/careers.js";
import { faqs } from "./collections/faqs.js";
import { media } from "./collections/media.js";

import { cmsUsers } from "./access/cms-users.js";
import { seedCmsDefaults } from "./seed.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: cmsUsers.slug,
  },
  collections: [
    cmsUsers,
    media,
    pages,
    navigation,
    siteSettings,
    redirects,
    products,
    services,
    industries,
    projects,
    resources,
    authors,
    team,
    testimonials,
    clients,
    careers,
    faqs,
  ],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env["CMS_DATABASE_URL"] ??
        "postgresql://stack_and_scale:local-development-only@127.0.0.1:5433/stack_and_scale",
    },
    push: false,
  }),
  secret: process.env["PAYLOAD_SECRET"] ?? "local-development-only-secret",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  onInit: async (payload) => {
    await seedCmsDefaults(payload);
  },
  telemetry: false,
});

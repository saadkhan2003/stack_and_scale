# Stack & Scale — CMS Operations & Content Extensibility Guide

> **Last Updated**: September 6, 2026  
> **Status**: Active / Production  
> **Target Service**: Payload CMS 3.x (`https://cms.stackandscale.org/admin`)  
> **Database**: Dedicated PostgreSQL cluster (`stack_and_scale`)

---

## Overview

You have complete control to add, edit, reorder, or delete whatever content you want, whenever you want.

Because the automatic application boot seeder has been removed and seeding has been transitioned to an idempotent one-time SQL baseline, **your production database is fully persistent and will never overwrite or erase your changes during future deployments or server restarts.**

---

## 1. Adding More Content Directly from the CMS Admin (No Coding Needed)

### Quick Reference Cheatsheet

For any of the existing collections, you can simply click the **Create New** button at [https://cms.stackandscale.org/admin](https://cms.stackandscale.org/admin):

- **New Pages**: Go to [Pages](https://cms.stackandscale.org/admin/collections/pages) → Click **Create New** → Give it a slug (e.g., `pricing`, `enterprise`, `whitepaper`), and use the **Block Builder** to assemble Heros, Metric Groups, FAQs, CTAs, and Rich Text.
- **New Products / Services**: Go to [Products](https://cms.stackandscale.org/admin/collections/products) or [Services](https://cms.stackandscale.org/admin/collections/services) → Click **Create New** to add your offer details, features, and taglines.
- **New Navigation Links**: Go to [Navigation](https://cms.stackandscale.org/admin/collections/navigation/1) → Scroll to **Menu items** → Click **Add Menu Item** (you can create top-level buttons or nested dropdown child links).
- **New FAQs & Testimonials**: Go to [Faqs](https://cms.stackandscale.org/admin/collections/faqs) or [Testimonials](https://cms.stackandscale.org/admin/collections/testimonials) → Click **Create New** to publish more quotes, case study metrics, or client questions.
- **New Projects, Careers, & Resources**: Click **Create New** in any of their respective tabs ([Projects](https://cms.stackandscale.org/admin/collections/projects), [Careers](https://cms.stackandscale.org/admin/collections/careers), [Resources](https://cms.stackandscale.org/admin/collections/resources)) to publish new job listings, case studies, or articles.

> **Note**: Every time you hit **"Publish changes"**, it saves directly to your PostgreSQL database.

---

### Step-by-Step Collection Guide

- **URL**: [`https://cms.stackandscale.org/admin/collections/pages`](https://cms.stackandscale.org/admin/collections/pages)
- **How to Add**:
  1. Click **Create New**.
  2. Provide a **Title** (e.g., `Enterprise Pricing`) and a URL-safe **Slug** (e.g., `pricing`, `whitepaper`, `case-study-logistics`).
  3. Fill out the **SEO** section (Meta Title, Meta Description, OpenGraph image).
  4. Use the interactive **Block Builder** under `Layout` to stack modular components:
     - **Hero Section**: Eyebrow, Heading, Subheading, Split or Centered variant.
     - **Operational Reliability Metrics**: Key stat figures, percentages, and latency metrics.
     - **FAQ Block**: Grouped collapsible questions & answers.
     - **Call To Action (CTA)**: Primary and secondary conversion buttons with direct routing.
     - **Rich Text / Media**: In-depth explanations, markdown, or embedded media assets.
  5. Click **Publish changes** to push live instantly.

### B. New Products & Solutions

- **URL**: [`https://cms.stackandscale.org/admin/collections/products`](https://cms.stackandscale.org/admin/collections/products)
- **How to Add**:
  1. Click **Create New**.
  2. Specify the **Product Title** (e.g., `Warehouse RFID Portal`).
  3. Add the **Slug** (e.g., `warehouse-rfid`) and punchy **Tagline**.
  4. Add feature matrices, interface showcases, and pricing tier metadata.
  5. Click **Publish changes**.

### C. New Engineering Services

- **URL**: [`https://cms.stackandscale.org/admin/collections/services`](https://cms.stackandscale.org/admin/collections/services)
- **How to Add**:
  1. Click **Create New**.
  2. Input the service **Title**, **Slug**, and a high-level operational **Summary**.
  3. Detail specific technical deliverables and SLA targets.
  4. Click **Publish changes**.

### D. Header & Global Navigation Links

- **URL**: [`https://cms.stackandscale.org/admin/collections/navigation/1`](https://cms.stackandscale.org/admin/collections/navigation/1)
- **How to Add / Modify**:
  1. Open Document `ID: 1` (Main Header Navigation).
  2. Scroll to the **Menu items** list.
  3. Click **Add Menu Item** to add a top-level link (e.g., `Partners` or `Changelog`).
  4. To create dropdown menus (like `Product` or `Resources`), scroll into the parent item and use the nested **Child items** array to add sub-links.
  5. Reorder menu items using drag-and-drop handles.
  6. Click **Save** to update the global header navigation across the website.

### E. Frequently Asked Questions (FAQs)

- **URL**: [`https://cms.stackandscale.org/admin/collections/faqs`](https://cms.stackandscale.org/admin/collections/faqs)
- **How to Add**:
  1. Click **Create New**.
  2. Enter the **Question**, detailed **Answer**, and assign a **Category** (e.g., `Deployment`, `Security`, `Pricing`, `Hardware`).
  3. Set a numeric **Order** to control sort priority on public FAQ lists.
  4. Click **Publish changes**.

### F. Customer Testimonials & Case Study Proof

- **URL**: [`https://cms.stackandscale.org/admin/collections/testimonials`](https://cms.stackandscale.org/admin/collections/testimonials)
- **How to Add**:
  1. Click **Create New**.
  2. Fill in the **Author Name**, **Author Role**, **Company Name**, and executive **Quote**.
  3. Optionally link an avatar from the Media collection.
  4. Click **Publish changes**.

### G. Client Projects & Case Studies

- **URL**: [`https://cms.stackandscale.org/admin/collections/projects`](https://cms.stackandscale.org/admin/collections/projects)
- **How to Add**:
  1. Click **Create New**.
  2. Enter **Project Title**, **Client Name**, **Industry**, **Challenge**, **Approach**, and **Measurable Outcomes**.
  3. Click **Publish changes**.

### H. Careers & Job Openings

- **URL**: [`https://cms.stackandscale.org/admin/collections/careers`](https://cms.stackandscale.org/admin/collections/careers)
- **How to Add**:
  1. Click **Create New**.
  2. Add **Job Title**, **Location** (e.g., `Remote`, `Berlin`, `London`), **Employment Type** (`full-time`, `contract`, `part-time`), and toggle `is_open`.
  3. Click **Publish changes**.

### I. Architecture Guides & Whitepapers (Resources)

- **URL**: [`https://cms.stackandscale.org/admin/collections/resources`](https://cms.stackandscale.org/admin/collections/resources)
- **How to Add**:
  1. Click **Create New**.
  2. Select Resource **Type** (`whitepaper`, `guide`, `article`, `video`), add the title, slug, and technical writeup.
  3. Click **Publish changes**.

### J. Global Site Settings & Branding

- **URL**: [`https://cms.stackandscale.org/admin/collections/site-settings/1`](https://cms.stackandscale.org/admin/collections/site-settings/1)
- **How to Modify**:
  1. Open Document `ID: 1`.
  2. Modify the **Site Name**, brand **Logo**, default social preview image (**OG Image**), and **Footer Note**.
  3. Click **Save**.

Every time you hit **"Publish changes"** or **"Save"**, the data is written directly to your PostgreSQL database.

---

## 2. Adding Brand New Fields or Whole New Collections in Code (If Needed Later)

If your platform requirements expand in the future and you want to introduce completely new collections (e.g., _Partners_, _Pricing Tiers_, _Changelogs_) or add new fields (e.g., _Direct Phone Support_ in Site Settings):

### Step 1: Create or Update the Collection Schema

Add or modify files in [`apps/cms/src/collections/`](file:///media/saad/Data/stack_and_scale/apps/cms/src/collections).

_Example: Creating `apps/cms/src/collections/partners.ts`:_

```typescript
import type { CollectionConfig } from "payload";

export const partners: CollectionConfig = {
  slug: "partners",
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as { role?: string }).role === "administrator"),
  },
  admin: {
    useAsTitle: "name",
    group: "Content",
    defaultColumns: ["name", "tier", "website"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "tier",
      type: "select",
      options: ["hardware", "cloud", "consulting"],
      required: true,
    },
    { name: "website", type: "text" },
  ],
};
```

### Step 2: Register in `payload.config.ts`

Import and add the collection to the `collections` array in [`apps/cms/src/payload.config.ts`](file:///media/saad/Data/stack_and_scale/apps/cms/src/payload.config.ts):

```typescript
import { partners } from "./collections/partners.js";

export default buildConfig({
  collections: [
    // ... existing collections
    partners,
  ],
  // ...
});
```

### Step 3: Generate a Clean Payload Migration

Payload uses migrations to add tables and columns safely without deleting any existing data:

```bash
pnpm --filter @stack-and-scale/cms payload migrate:create add_partners_collection
```

This generates a versioned migration file in `apps/cms/src/migrations/`.

### Step 4: Deploy via Git Push

Commit and push your changes to `main`:

```bash
git add apps/cms/
git commit -m "feat(cms): add partners collection schema and migration"
git push origin main
```

The automated promotion pipeline in [`scripts/deploy-promote.sh`](file:///media/saad/Data/stack_and_scale/scripts/deploy-promote.sh) will automatically:

1. Build and scan the updated immutable Docker images.
2. Run `payload migrate` against the production database to apply the new schema.
3. Start the updated CMS container with zero downtime.
4. Keep all your existing editorial changes and data completely intact.

---

## 3. Database Persistence & Safety Guarantees

- **Zero Data Loss on Restart**: Application containers mount the persistent PostgreSQL volume. Restarting or upgrading containers does not reset database state.
- **No Recurring Overwrites**: Because `apps/cms/src/seed.ts` was deleted and `onInit` removed, application code contains no reset routines.
- **Idempotent Baseline**: The SQL seeder ([`infra/seed-cms-data.sql`](file:///media/saad/Data/stack_and_scale/infra/seed-cms-data.sql)) uses `ON CONFLICT (id) DO UPDATE / NOTHING`. It never duplicates records or drops tables.
- **Drafts & Versions**: Collections configured with `versions: { drafts: true }` store changes in version tables (`_*_v`), allowing safe drafting, revision history, and instant publishing.

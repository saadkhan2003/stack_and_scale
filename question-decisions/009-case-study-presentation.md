# Question 009 — Case-study presentation

**Status:** Locked  
**Implementation:** Phase 1, expanded later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How deeply should individual projects be presented?

## Your chosen direction

Use immersive product-story experiences for three to five flagship projects and structured case studies for normal projects.

## Why this was chosen

The most important work deserves differentiated storytelling, while a reusable template keeps the rest affordable and maintainable.

## Why it is a strong fit

- Creates standout portfolio experiences
- Keeps routine publishing scalable
- Combines visual impact with business context

## Tradeoffs and safeguards

Flagship pages cost more to design, test and maintain, so they must be reserved for high-value work.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 9 — Project presentation

Since **Work will be one of the strongest parts of the website**, how deep should individual projects go?

### A — Showcase

Beautiful images + short explanation.

```text
Project
↓
What we built
↓
Screenshots
↓
Technology
↓
CTA
```

### B — Proper case study

```text
Hero
↓
Problem
↓
Client/business context
↓
Our approach
↓
UX/UI
↓
Engineering
↓
Screenshots
↓
Technology
↓
Challenges
↓
Results
↓
Next project
```

### C — Product-story experience

Same content as B, but each major project can have a **different storytelling presentation**.

For example:

POS case study:

```text
scroll
 ↓

dashboard appears

 ↓

sales numbers animate

 ↓

inventory interface expands

 ↓

mobile POS comes into view

 ↓

architecture / technology

 ↓

business outcome
```

Not every project gets crazy animation, but your **3–5 flagship projects feel almost like mini product websites inside the main website**.

For the website you're describing, my recommendation is **C for flagship projects + B for normal projects**.

That gives us the “not another software-house website” quality without making every page expensive and overengineered.

**Question 9: do you want that C + B approach?**

#### Your response 1

> waht if i make the cms for t...for all of the data which should be dynamic so

#### Explanation or resolution 1

Yes. **For this website, I now think CMS-first is better than JSON-first.**

But there is an important distinction:

> **We should build your content model, not build a CMS framework from scratch.**

I would use **Payload CMS** as the underlying open-source CMS and customize its collections/admin experience for your company. Payload currently supports modern Next.js 16.2.6+, PostgreSQL, image processing, and can live directly inside a Next.js application.

So instead of this:

```text
projects.json
products.json
services.json
blogs.json
```

the production architecture becomes:

```text
                        YOUR WEBSITE
                             │
                     Next.js + React
                             │
                  ┌──────────┴──────────┐
                  │                     │
             Payload CMS          Website code
                  │                     │
          PostgreSQL database     Components/layout
                  │
             Media Storage
          Cloudflare R2 / S3
```

And you get something like:

```text
yourdomain.com
→ public website

yourdomain.com/admin
→ CMS dashboard
```

You log into `/admin`, click **Projects → Create New**, fill everything in, upload screenshots, publish it — and the website generates the project page.

---

## What I would make dynamic

For your site, a lot can be CMS-controlled.

### Projects

A Project record could contain:

```text
Project
├── Title
├── Slug
├── Short description
├── Full description
├── Category
├── Featured?
├── Status
├── Client
├── Year
├── Technologies
├── Services provided
│
├── Cover image
├── Hero image
├── Logo
├── Desktop screenshots[]
├── Mobile screenshots[]
├── Gallery[]
├── Videos[]
│
├── Problem
├── Solution
├── Development process
├── Challenges
├── Results
│
├── Statistics[]
│   ├── label
│   └── value
│
├── Testimonial
├── Related projects[]
│
├── SEO title
├── SEO description
└── Social sharing image
```

Then you don't send me JSON whenever a new project comes.

You open:

```text
Admin
→ Projects
→ New Project
```

and enter it yourself.

---

## Images become much easier

This solves the issue you asked about earlier.

Instead of manually doing:

```json
{
  "hero": "/projects/pos/hero.webp"
}
```

the CMS gives you an upload field:

```text
Hero Image

┌──────────────────────────────────┐
│                                  │
│       Drop image here            │
│                                  │
│        [ Upload File ]           │
│                                  │
└──────────────────────────────────┘
```

You upload:

```text
pos-dashboard.png
```

Payload stores the metadata and our storage provider stores the actual file.

Payload's production documentation specifically notes that production deployments normally combine the application with a database and permanent file storage/CDN.

For scale I would probably use:

```text
PostgreSQL
     ↓
text/data/relationships

Cloudflare R2
     ↓
images/videos/files

Cloudflare CDN
     ↓
fast delivery worldwide
```

rather than storing hundreds of project screenshots inside Git.

---

# Products would also come from CMS

For example:

```text
Products
│
├── Retail POS
├── Tailor Management
├── Restaurant Management
├── Inventory System
└── Accounting System
```

Open `Retail POS`:

```text
Name
Tagline
Description

Features
    + Add feature

Screenshots
    + Upload screenshot

Demo video
Pricing
FAQs
Industries
Technologies

CTA
    "Book Free Demo"

Featured?
    ✓

SEO
    ...
```

Save → website updates.

---

# Services

Same idea:

```text
Services
├── Custom Software Development
├── Flutter Development
├── AI Agents
├── Workflow Automation
├── Data Analytics
├── SaaS Development
└── UI/UX
```

Each service gets its own data and page.

---

# Blog

CMS is particularly useful here.

```text
Admin
 → Blog
    → New Article
```

Editor enters:

```text
Title
Author
Category
Cover image
Article
Related projects
SEO
Publish date
```

and publishes.

No developer required.

---

# Careers

Same:

```text
Careers

Flutter Developer
├── Location
├── Employment type
├── Experience
├── Description
├── Requirements
├── Skills
├── Salary display
├── Deadline
└── Active / Closed
```

When you close a position:

```text
Active: OFF
```

and the website handles it automatically.

---

# Testimonials

```text
Testimonials
├── Customer
├── Company
├── Photo
├── Quote
├── Rating
├── Related project
└── Featured
```

Homepage can automatically pull featured testimonials.

---

# Clients

```text
Clients
├── Name
├── Logo
├── Website
├── Country
├── Industry
└── Featured
```

So later when you get US/UAE clients, changing your homepage does **not require redesigning it**.

---

# Team

```text
Team Member
├── Name
├── Photo
├── Position
├── Bio
├── LinkedIn
├── GitHub
└── Display order
```

---

# Homepage itself can be partly CMS-controlled

This is where I would be careful.

I **wouldn't make every pixel dynamically configurable**.

That becomes a page-builder nightmare.

Instead:

```text
Homepage settings
├── Hero eyebrow
├── Hero heading
├── Hero description
├── Hero CTA
│
├── Featured projects[]
├── Featured products[]
├── Featured testimonials[]
├── Featured services[]
│
├── Client logos[]
├── CTA heading
├── CTA description
└── SEO
```

But things such as:

```text
animation behavior
card architecture
grid system
responsive layout
typography system
spacing
visual effects
3D scenes
component implementation
accessibility
```

stay in **code**.

That's the correct separation.

---

# Think of it as three layers

```text
┌─────────────────────────────────────────┐
│            PRESENTATION                 │
│                                         │
│ Next.js / React / Tailwind / Motion     │
│ shadcn / Magic UI / custom composition  │
└─────────────────────┬───────────────────┘
                      │
                typed content
                      │
┌─────────────────────▼───────────────────┐
│              PAYLOAD CMS                │
│                                         │
│ Projects                                │
│ Products                                │
│ Services                                │
│ Case Studies                            │
│ Blog                                    │
│ Careers                                 │
│ Testimonials                            │
│ Team                                    │
│ Clients                                 │
└─────────────────────┬───────────────────┘
                      │
          ┌───────────┴──────────┐
          ▼                      ▼
     PostgreSQL             R2 / S3
      Content                Media
```

That's considerably better than making a collection of JSON files if you're already thinking about scaling the company.

---

## And we still get your JSON idea

The beautiful part is that the frontend **still receives structured data**.

Conceptually Payload returns:

```json
{
  "title": "Retail POS",
  "slug": "retail-pos",
  "featured": true,
  "category": "Business Software",
  "media": {
    "hero": {
      "url": "https://cdn.example.com/pos.webp"
    }
  }
}
```

So from the frontend's perspective:

```text
CMS
 ↓
structured data
 ↓
React components
 ↓
website
```

You haven't lost the JSON architecture.

You've just given it a **proper administration layer**.

---

# Why Payload instead of creating our own admin panel?

You originally told me something important:

> You don't want to waste time creating your own component SDK when mature open libraries exist.

I would apply exactly the same philosophy to the CMS.

Don't spend months building:

- Authentication
- admin dashboard
- rich-text editor
- media library
- upload handling
- user permissions
- CRUD APIs
- revisions
- publishing workflows
- database migrations
- relationships
- validation
- image handling

Payload already provides the infrastructure and integrates directly with the Next.js ecosystem we're considering. It supports PostgreSQL through its official adapter and migration tooling.

We customize **your data models and workflows**, not reinvent the CMS engine.

---

## Payload vs Strapi vs Sanity

All three are credible, but for **this project** I'd currently choose:

| | Payload | Strapi | Sanity |
|---|---|---|---|
| Open source/self-host | ✅ | ✅ | Hosted content platform |
| TypeScript | ✅ | ✅ | ✅ frontend ecosystem |
| PostgreSQL | ✅ | ✅ | Sanity Content Lake |
| Next.js relationship | **Excellent** | Excellent | Excellent |
| Same Next.js application | **Yes** | Usually separate backend | Separate service |
| Admin included | ✅ | ✅ | Studio |
| Media | ✅ | ✅ | ✅ |
| Content API | ✅ | ✅ | ✅ |
| Vendor dependence | Low | Low | Higher |
| My preference here | **#1** | #2 | #3 |

Strapi 5 remains an excellent MIT-licensed, self-hostable alternative and provides REST/GraphQL APIs and a visual content-type builder.

Sanity is extremely good for content workflows, but its Content Lake is a hosted service with usage-based plans rather than the fully self-controlled architecture you're describing.

For **your software house**, I like owning:

```text
our frontend
our CMS code
our PostgreSQL database
our media storage
our deployment
```

So Payload fits particularly well.

---

# Updated V1 architecture

I'm therefore changing our earlier architecture decision to:

```text
Next.js 16
React
TypeScript

        +

Tailwind CSS 4
shadcn/ui
selected Magic UI / registry components
Motion

        +

Payload CMS
PostgreSQL
Cloudflare R2/S3 media

        +

Zod
PostHog
Playwright
Vitest
GitHub Actions
```

We can even **seed the CMS with dummy data initially**.

So initially:

```text
Payload CMS
   ↓
6 fake/demo projects
5 demo products
7 services
6 testimonials
4 blog posts
3 careers
team
company information
```

Later you simply delete the demo records and enter real ones.

**No frontend rebuild.**

And we've already locked **Question 8 = B: full company website**.

### Question 9

Now that we're making it CMS-driven, this becomes the next important question:

**Who should be able to log into the CMS and change the website?**

For example, only **you/admin**, or eventually different roles such as **Admin, Content Editor, Marketing, HR**, where HR can manage Careers but cannot alter Projects or site settings?

For V1, I would start with **Admin + Editor**, while architecting permissions so more roles can be introduced later.

#### Your response 2

> the users i want..and me

#### Explanation or resolution 2

Perfect. Then we’ll design the CMS so **you are the owner/super-admin**, and you can create accounts only for the people you choose.

That means:

- **You / Super Admin** — full control over everything, including users and permissions.
- **Users you invite** — access only after you create or approve their account.
- You can later assign roles like **Editor, Marketing, HR, Project Manager**, etc.
- You can disable/remove a user at any time.
- We should avoid public CMS signup entirely.

So this is locked as **private, invite-only CMS access with role-based permissions**.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

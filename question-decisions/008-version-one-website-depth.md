# Question 008 — Version-one website depth

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How large should the first serious public website be?

## Your chosen direction

Build a full company website with Home, Work, Case Studies, Products, Services, About, Careers, Resources and Contact.

## Why this was chosen

This has enough depth to look established without launching dozens of thin or empty pages.

## Why it is a strong fit

- Supports sales and recruitment
- Provides strong SEO foundations
- Gives products and work dedicated space

## Tradeoffs and safeguards

A wider launch requires disciplined content preparation and phased publishing.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 8 — how large should version 1 be?

For the first serious production release, which scope do you want?

**A. Focused**
`Home / Work / Services / About / Contact`

**B. Full company website**
`Home / Work / Individual Case Studies / Products / Individual Product Pages / Services / About / Careers / Blog / Contact`

**C. Full platform-style website**
Everything in B, plus things such as resources, detailed solution pages, industries, integrations, pricing/demo flows, dynamic CMS architecture, search, etc.

For you, I currently recommend **B**.

It gives us enough depth to look like a real established software company without prematurely building 40 empty pages.

Would you choose **A, B, or C?**

#### Your response

> what about the picture and thgins of project...like i will gie data in jsson...also q8 answer is B

#### Explanation or resolution

Yes — **B is locked** for V1: a full company website with proper Work, Case Studies, Products, Services, About, Careers, Blog, and Contact.

And yes, **project pictures, screenshots, videos, logos, mockups, etc. can also be completely data-driven**. The JSON should not contain the actual image binary; it just contains the path or URL to the asset.

For example:

```json
{
  "slug": "retail-pos",
  "title": "Retail POS Platform",
  "summary": "A complete retail management platform.",

  "media": {
    "thumbnail": "/media/projects/pos/thumbnail.webp",
    "hero": "/media/projects/pos/hero.webp",

    "gallery": [
      {
        "src": "/media/projects/pos/dashboard.webp",
        "alt": "POS sales dashboard",
        "caption": "Real-time sales overview"
      },
      {
        "src": "/media/projects/pos/inventory.webp",
        "alt": "Inventory management screen",
        "caption": "Inventory and stock control"
      }
    ],

    "video": {
      "src": "/media/projects/pos/demo.mp4",
      "poster": "/media/projects/pos/video-poster.webp"
    }
  }
}
```

Then our component doesn't care which project it is:

```tsx
<ProjectHero project={project} />
<ProjectGallery media={project.media.gallery} />
```

You replace the data later and everything updates automatically.

### For V1

I would keep dummy assets organized like:

```text
public/
└── media/
    ├── projects/
    │   ├── pos/
    │   │   ├── hero.webp
    │   │   ├── dashboard.webp
    │   │   ├── inventory.webp
    │   │   └── mobile.webp
    │   │
    │   ├── tailor/
    │   └── ai-agent/
    │
    ├── products/
    ├── team/
    ├── clients/
    └── blog/
```

And the data:

```text
data/
├── projects.json
├── products.json
├── services.json
├── testimonials.json
├── team.json
└── posts.json
```

Later, we don't have to keep the pictures inside the repository.

We can change:

```json
"hero": "/media/projects/pos/hero.webp"
```

to:

```json
"hero": "https://cdn.yourcompany.com/projects/pos/hero.webp"
```

And the frontend remains essentially the same.

For production scale, I would eventually prefer something like:

```text
Payload CMS
     ↓
project metadata

Cloudflare R2 / S3-compatible storage
     ↓
screenshots, videos, media

CDN
     ↓
Next.js website
```

So an admin could eventually create a project, upload screenshots, add metrics, choose technologies, write the case study, and press Publish — without touching source code.

## Importantly: images shouldn't all be treated the same

I want our data model to understand the **purpose** of an asset.

A project might have:

```json
{
  "thumbnail": "...",
  "hero": "...",

  "desktopScreenshots": [],
  "mobileScreenshots": [],

  "gallery": [],

  "logo": "...",

  "video": "...",

  "architectureDiagram": "...",

  "beforeAfter": [],

  "featuredMockup": "..."
}
```

That lets us create much more interesting layouts.

For instance, a Flutter project could automatically use a phone presentation:

```text
      ┌─────────┐
      │         │
      │  APP    │
      │         │
      └─────────┘
```

while a dashboard project could use a browser-window presentation:

```text
┌──────────────────────────────┐
│ ● ● ●     dashboard.app      │
├──────────────────────────────┤
│                              │
│          Dashboard           │
│                              │
└──────────────────────────────┘
```

And an AI-agent project might instead have an interactive conversation/automation visualization.

That's how we avoid:

> Project 1
> picture
> text

> Project 2
> picture
> text

> Project 3
> picture
> text

which is exactly the old portfolio style you don't want.

### Dummy pictures

For the initial version, we can use **designed placeholder software interfaces/mockups**, rather than random stock photography.

For example:

**RetailFlow**
→ sophisticated POS dashboard

**Atelier**
→ tailor/order workflow

**Nexus Agent**
→ AI automation interface

**Pulse Analytics**
→ analytics dashboard

They can be explicitly demo projects/data until you replace them with your real material.

Then eventually you might provide:

```text
project.json
dashboard.webp
mobile.webp
checkout.webp
reports.webp
demo.mp4
```

and we simply plug them in.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

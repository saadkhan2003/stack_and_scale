# Question 076 — CMS composition model

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How customizable should CMS-managed content be?

## Your chosen direction

Use Payload CMS with structured models, controlled visual blocks, strong content customization, versions and workflow.

## Why this was chosen

Editors need broad content control, while layout and interaction quality must remain governed by the design system.

## Why it is a strong fit

- Editorial independence
- Predictable responsive quality
- Reusable structured content

## Tradeoffs and safeguards

New visual patterns still require development rather than unrestricted drag-and-drop editing.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 76 — CMS architecture

We already selected Payload CMS.

Now we need to decide how deeply CMS controls the website.

Options:

### A. Basic CMS

CMS manages:

- pages
- blog
- images
- team
- projects

Developers still build most sections manually.

---

### B. Structured content CMS (recommended)

CMS manages business content:

```text
Collections

Products
Services
Projects
Case Studies
Industries
Blog Posts
Team Members
Testimonials
Clients
Careers
FAQs
Downloads
```

with custom fields.

Example:

Product:

```text
Name
Slug
Description
Features
Screenshots
Demo URL
Industries
Related case studies
SEO metadata
```

---

### C. Full visual page builder

Marketing team can create arbitrary pages by dragging blocks.

Example:

```
Hero block
Feature block
Gallery block
CTA block
Pricing block
```

Like Webflow.

---

My recommendation for you:

**B + selected controlled blocks from C**

Why?

A full page builder often creates ugly inconsistent pages.

Instead:

Marketing can compose approved sections:

```text
Hero
Stats
Features
Product showcase
Case study
Testimonials
CTA
FAQ
```

but cannot destroy the design system.

Do you want to lock **B + controlled C — structured CMS with approved content blocks?**

#### Your response

> B + selected controlled blocks from C..yes but more cms content should also be customizable and managable

#### Explanation or resolution

Locked: **Question 76 = B + selected controlled blocks from C — structured CMS with highly customizable content management.**

Your clarification is important. We should not build a CMS where everything is hardcoded and every small change requires a developer.

The correct approach is:

> **Content should be fully manageable by your team, but the design system should control how that content is presented.**

Meaning:

✅ Marketing team can change content
✅ Add new products
✅ Update projects/case studies
✅ Publish blogs
✅ Change images/videos
✅ Update SEO
✅ Rearrange approved sections
❌ Cannot create visually inconsistent pages with random layouts

---

The CMS architecture would look like this:

```text
Payload CMS

Content Collections

├── Products
│   ├── Name
│   ├── Description
│   ├── Features
│   ├── Screenshots
│   ├── Demo
│   ├── Videos
│   ├── Industries
│   ├── Case studies
│   ├── FAQs
│   └── SEO

├── Services
│   ├── Title
│   ├── Description
│   ├── Process
│   ├── Technologies
│   ├── Projects
│   └── SEO

├── Projects
│   ├── Client
│   ├── Industry
│   ├── Problem
│   ├── Solution
│   ├── Technology
│   ├── Images
│   ├── Results
│   └── Case study

├── Industries
│   ├── Description
│   ├── Problems
│   ├── Solutions
│   ├── Products
│   └── SEO

├── Blog
│   ├── Article
│   ├── Author
│   ├── Category
│   ├── Related content
│   └── SEO

├── Testimonials

├── Clients

├── Team

├── Careers

├── FAQs

└── Media Library
```

---

For flexible pages:

Instead of:

```text
Homepage.tsx

Everything manually coded
```

we create controlled sections:

```text
Page Builder Blocks

Hero Section
├── heading
├── subtitle
├── CTA
├── visual


Stats Section
├── number
├── label


Product Showcase
├── products
├── layout style


Feature Grid
├── title
├── icon
├── description


Case Study Section

Testimonials

CTA Section

FAQ Section

Logo Cloud

Video Section
```

Then your CMS user can create:

Example:

```text
New Product Page

Hero
↓
Features
↓
Interactive Demo
↓
Screenshots
↓
Case Study
↓
Testimonials
↓
CTA
```

without touching code.

---

## But we add governance

Because you want premium quality:

Not every user gets everything.

Example:

### Marketing user

Can edit:

- text
- images
- SEO
- blogs
- products

Cannot:

- change system layouts
- remove required sections

---

### Developer/admin

Can:

- create new blocks
- modify components
- change structure

---

### Owner

Full control.

---

## Media management

The CMS should also manage:

```text
Media Library

Images
Videos
Documents
Product screenshots
Client logos
Case study assets

Metadata:
- alt text
- copyright
- usage
- optimization status
```

Because your website will be visual-heavy.

---

## Versioning and workflow

Since this is production-level:

```text
Draft
 ↓
Review
 ↓
Approved
 ↓
Published

Previous versions saved
```

So someone cannot accidentally destroy a major page.

---

## Preview system

Very important:

Before publishing:

```text
CMS

Edit Product Page

        ↓

Preview

        ↓

Looks good?

        ↓

Publish
```

---

So final lock:

**Question 76 = Payload CMS + structured content models + controlled visual blocks + strong customization + workflow/versioning.**

This gives you the power of a custom CMS without building a CMS from scratch.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

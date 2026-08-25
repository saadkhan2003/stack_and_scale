# Question 077 — CMS publishing workflow

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should multiple CMS users collaborate?

## Your chosen direction

Use invite-only roles, permissions, drafts, reviews, approvals, versions and publishing control.

## Why this was chosen

Content publishing becomes a business process once marketing, HR and project contributors are involved.

## Why it is a strong fit

- Prevents accidental publishing
- Creates accountability
- Supports specialized editors

## Tradeoffs and safeguards

Workflow must remain proportional so small edits are not unnecessarily blocked.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 77 — CMS users and content workflow

Because you said earlier:

> "the users I want and me"

Should CMS support multiple internal roles?

I recommend:

```text
CMS Roles

Owner
→ everything

Content Manager
→ pages, products, blogs

Marketing
→ SEO, campaigns, media

Developer
→ collections, settings, technical changes

Reviewer
→ approve before publishing
```

With:

- drafts
- approvals
- publishing permissions
- audit history

Do you want to lock **multi-user CMS workflow with roles and approvals?**

#### Your response

> yes...Question 76 = Payload CMS + structured content models + controlled visual blocks + strong customization + workflow/versioning....yes...Do you want to lock multi-user CMS workflow with roles and approvals?...yes

#### Explanation or resolution

Locked: **Question 76 = Payload CMS + structured content models + controlled visual blocks + strong customization + workflow/versioning.**

Locked: **Question 77 = multi-user CMS workflow with roles, permissions, approvals, drafts, and publishing control.**

This completes the CMS philosophy.

Final CMS direction:

```text
Payload CMS

Content Management
│
├── Structured Content
│   ├── Products
│   ├── Services
│   ├── Projects
│   ├── Case Studies
│   ├── Industries
│   ├── Blog
│   ├── Team
│   ├── Careers
│   ├── Testimonials
│   ├── Clients
│   └── FAQs
│
├── Controlled Page Builder
│   ├── Hero
│   ├── Product Showcase
│   ├── Feature Grid
│   ├── Stats
│   ├── Case Study
│   ├── Testimonials
│   ├── Video
│   ├── CTA
│   └── FAQ
│
├── Media Management
│   ├── Images
│   ├── Videos
│   ├── Documents
│   ├── Logos
│   └── Product assets
│
├── Workflow
│   ├── Draft
│   ├── Review
│   ├── Approval
│   ├── Publish
│   └── Version history
│
└── Permissions
    ├── Owner
    ├── Content Manager
    ├── Marketing
    ├── Developer
    └── Reviewer
```

The key principle:

> The CMS controls content. The design system controls quality.

So a marketing person can create a new product page, but they cannot accidentally create a page that looks like a random WordPress website.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

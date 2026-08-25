# Question 023 — Public search and navigation

**Status:** Locked  
**Implementation:** Phase 1, enhanced later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How deep should public search and navigation be?

## Your chosen direction

Use simple primary navigation with command-palette-style global discovery for deeper content.

## Why this was chosen

The site will contain products, services, work, industries and resources; users need fast access without a crowded menu.

## Why it is a strong fit

- Keeps navigation clean
- Improves discovery
- Scales with the content library

## Tradeoffs and safeguards

Search should complement, not compensate for, weak information architecture.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 23 — Search and navigation depth

Since V1 will have products, projects, case studies, services, industries, blog, careers, and more, do you want the website to have a proper global search?

**A. No search**
Rely only on navigation.

**B. Simple site search**
Search products, services, projects, and blog posts.

**C. Advanced command-palette style search**
For example, pressing `⌘K / Ctrl+K` opens a premium search interface where visitors can quickly find:

```text
Products
Projects
Services
Industries
Articles
Careers
```

with instant results.

For the kind of modern website you want, I recommend **C**. It gives the site a more product-like feel without being gimmicky.

Do you want **C**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 23 = C — command-palette style global search**.

So visitors can use `Ctrl+K` / `⌘K` to search across products, projects, services, industries, blog posts, and careers. On mobile, the same search will open from a normal search button.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

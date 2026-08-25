# Question 007 — Initial project content

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What project material should be used before all real case-study assets are ready?

## Your chosen direction

Start with structured, clearly identified demonstration content and replace it with real project records and media as assets become available.

## Why this was chosen

Structured placeholders allow design and development to proceed without hard-coding content or publishing misleading client claims.

## Why it is a strong fit

- Unblocks implementation
- Tests content models early
- Makes later replacement straightforward

## Tradeoffs and safeguards

Demo metrics and clients must never be presented as real evidence.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 7 — what real projects can we actually show?

This is very important because your chosen direction depends on proof.

Tell me the software/projects you already have that we can publicly show.

For each one, just give me:

**Project name or type**
**What it does**
**Is it finished / live / in development?**
**Can we show screenshots or video?**
**Can we mention the client name, or must it stay private?**

For example:

> POS System
> Retail sales, inventory, expenses, customer credit, reports
> Live
> Yes, screenshots available
> Own product — no privacy issue

or:

> Flutter delivery app
> Customer ordering + rider tracking
> Finished
> Screenshots available
> Client name private

Send me **all the projects you currently have**, even small ones. I’ll then tell you which ones deserve homepage placement and which should stay only in the portfolio/case-studies section.

#### Your response

> ii want firs to be dummy like i will provide data in json to that awebsite later

#### Explanation or resolution

That is actually a good choice for the first version.

We can build the entire website initially with **dummy structured data**, but design it so the UI never depends on hard-coded project content. Later, you can replace the dummy JSON with real projects, a CMS, API data, or database records without rebuilding the frontend.

For example, internally the site could consume project objects shaped roughly like:

```json
{
  "id": "pos-system",
  "title": "Retail POS System",
  "slug": "retail-pos-system",
  "category": "Business Software",
  "shortDescription": "Sales, inventory, expenses and reporting in one system.",
  "status": "live",
  "featured": true,
  "services": [
    "Product Design",
    "Web Development",
    "Backend Development"
  ],
  "technologies": [
    "Next.js",
    "PostgreSQL"
  ],
  "images": {
    "cover": "/projects/pos/cover.webp",
    "gallery": []
  },
  "metrics": [
    {
      "label": "Transactions",
      "value": "50K+"
    }
  ],
  "caseStudy": {
    "problem": "...",
    "solution": "...",
    "results": "..."
  }
}
```

Then the frontend simply does something conceptually like:

```ts
projects.map(project => <ProjectCard project={project} />)
```

So today:

**JSON → website**

Later:

**Payload CMS → same website**

or:

**API → same website**

or even:

**database → API → same website**

The presentation layer stays mostly unchanged.

I would probably structure dummy content into things like:

```text
data/
├── projects.json
├── products.json
├── services.json
├── testimonials.json
├── clients.json
├── team.json
├── faqs.json
└── company.json
```

Although when we actually implement it, I would likely use **typed TypeScript data files or JSON validated with Zod**, rather than blindly trusting arbitrary JSON. That catches broken fields before they reach production.

Also, I don't want the dummy version to look obviously fake. We can create realistic placeholder products such as:

- Retail POS Platform
- Tailor Management Suite
- Restaurant Operations System
- AI Customer Support Agent
- Sales Analytics Dashboard
- Flutter Commerce App
- Workflow Automation Platform

with proper dashboards, descriptions, realistic metrics clearly treated as demo content, and polished case-study layouts. Later you replace the records.

This also means we **don't need Payload CMS on day one**. We can architect for it while avoiding unnecessary infrastructure initially.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

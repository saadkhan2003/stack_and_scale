# Question 022 — Capability and industry pages

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the website organize offerings by capability, industry, or both?

## Your chosen direction

Use a hybrid capability-first structure with dedicated industry pages.

## Why this was chosen

Capabilities explain what the team can build; industry pages translate them into buyer-specific problems and language.

## Why it is a strong fit

- Improves relevance
- Supports search intent
- Avoids locking the company into one vertical

## Tradeoffs and safeguards

Content relationships must prevent duplication and conflicting claims across page types.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 22 — Should we show industries or stay capability-first?

Because you’re targeting local businesses first, we can either organize around **what you build** or **who you build for**.

**A. Capability-first**
- POS systems
- Custom software
- Flutter apps
- AI automation
- Data analytics

**B. Industry-first**
- Retail
- Tailoring / fashion
- Restaurants
- Distribution
- Services businesses
- etc.

**C. Hybrid**
Primary navigation/content is capability-first, but we also create industry-specific landing sections/pages where useful.

For your business, I recommend **C**.

That way the site still feels like a serious software engineering company, but someone searching for “POS software for retail” or “tailor management software” lands on a page that speaks directly to their business.

Do you want **C**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 22 = C — hybrid capability-first + industry-specific pages**.

So the main navigation can stay clean and engineering-focused:

- Products
- Services
- Work
- Industries
- About
- Blog
- Careers
- Contact

But under **Industries**, we can later have pages such as:

- Retail
- Tailoring / Fashion
- Restaurants
- Distribution
- Professional Services
- Other SMBs

This also helps SEO because someone searching for a specific business solution can land on a page tailored to their use case rather than a generic “software development” page.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

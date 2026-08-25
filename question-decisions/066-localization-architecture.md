# Question 066 — Localization architecture

**Status:** Locked  
**Implementation:** Foundation in Phase 1; additional locales later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the website support multiple languages?

## Your chosen direction

Launch in English and keep the architecture internationally localization-ready.

## Why this was chosen

This preserves content quality now while allowing future Urdu or market-specific language support without reworking routes and content models.

## Why it is a strong fit

- Focused launch
- Future market flexibility
- Consistent locale-aware foundations

## Tradeoffs and safeguards

Localization also affects dates, currencies, images, SEO and workflows—not only translated strings.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 66 — Should the website support multiple languages?

Since your initial market is Pakistan but future targets include US, UK, Europe, and Gulf, this matters.

Options:

**A. English only**
Best initial simplicity.

**B. English + Urdu**
Useful for local SMB customers.

**C. English + Urdu + regional languages**
More localization.

**D. International-ready architecture**
Start English, but build the system with i18n support so Urdu, Arabic, German, etc. can be added without restructuring.

My recommendation for your strategy:

**D.**

The website stays English initially, but the architecture supports future:

```text
/en/products/retail-pos
/ur/products/retail-pos
/ar/products/retail-pos
/de/products/retail-pos
```

without rebuilding the site.

Do you want to lock **D — international-ready localization architecture, English first?**

#### Your response

> D

#### Explanation or resolution

Locked: **Question 66 = D — international-ready localization architecture, English first.**

This is the correct choice for your 3-year vision.

We will **not force multiple languages now**, because poor translations and maintaining many languages too early can hurt quality. Instead, the architecture supports expansion.

Structure:

```text
/en
   ├── products
   ├── services
   ├── work
   ├── industries
   └── resources

Future:

/ur
/ar
/de
/fr
```

The system will support:

- translated page content
- translated metadata
- language-specific SEO
- language-specific URLs
- localized images where needed
- right-to-left support for Arabic/Urdu
- locale-aware formatting (currency, dates, numbers)

The CMS will store content like:

```text
Product:
Retail POS

English:
Retail POS for growing businesses

Urdu:
...

Arabic:
...
```

But the initial public experience remains:

```text
English-first
Premium global software company feel
Pakistan-focused SEO
```

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

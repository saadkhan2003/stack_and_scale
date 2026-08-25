# Question 003 — Primary conversion actions

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What should a visitor do after becoming interested?

## Your chosen direction

Use Book a Demo as the main product action, WhatsApp as a secondary local channel, and Discuss Your Project for custom engineering.

## Why this was chosen

Different buyers need different next steps, and structured conversion should happen before conversations become scattered across informal channels.

## Why it is a strong fit

- Improves lead quality
- Fits Pakistani buying behavior
- Creates measurable funnels for products and services

## Tradeoffs and safeguards

More than one CTA can create noise unless each page has a clear primary action.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 3

Now I need to understand **what kind of international customer we want most**, because this changes the entire website.

Imagine these four inquiries arrive tomorrow:

**A.** US startup wants an MVP/SaaS platform — budget $15k–$40k.

**B.** Established US/UK company wants a custom internal platform, automation or AI system — budget $40k–$150k+.

**C.** Company wants 2–4 Flutter/backend developers continuously for 6–12 months.

**D.** UAE/Saudi company wants a large business-management/ERP/custom platform and ongoing support.

Which type would you **most like your software house to become excellent at winning?**

You can choose more than one, but rank them **1 → 4**. This is the next major decision for the website.

#### Your response 1

> for now i wanna local targeting and inn fturture i will convert ..now 3rd q is

#### Explanation or resolution 1

Then for **phase 1**, we’ll optimize the website mainly for **Pakistani/local customers**, but architect the brand and site so we can later shift toward US/UK/Europe/Gulf without rebuilding everything.

That means I would avoid making the brand overly “local-shop-software only.” Your POS, tailor software, inventory systems, etc. can be prominent now, while the design language remains premium enough for international clients later.

### Question 3 — What should a visitor actually do on the website?

Imagine a potential customer lands on the homepage. What is the **most valuable action** you want them to take?

For your current local market, these are the realistic possibilities:

**A. WhatsApp you immediately**
Example: “I need a POS system for my shop.”

**B. Request a demo**
They enter basic details → you schedule/show them the software.

**C. Call your company**

**D. Submit a project inquiry**
For custom software, Flutter apps, AI automation, dashboards, etc.

**E. See pricing and buy/request a product**
For example:

> POS System
> Starting from Rs. XX,XXX
> View features → Request installation

**F. Try an interactive/live demo first**

**G. Visit your physical office**

I suspect the best setup for Pakistan would eventually be something like:

**Primary CTA:** `Get a Demo`
**Secondary CTA:** `WhatsApp Us`

while custom-development pages use:

**Primary CTA:** `Discuss Your Project`

But I don't want to assume.

### So Question 3:

**When someone likes your software, how do you currently close the sale?**

For example:

> Customer WhatsApps us → we explain it → show demo → discuss price → install software → receive payment.

Tell me your **actual current selling process**, even if it's informal. That will determine the conversion system we build into the website.

#### Your response 2

> what shoudl i do .please u explain

#### Explanation or resolution 2

For your current **local Pakistan targeting**, I would keep the sales process very simple and fast. Local customers usually do not want to fill long forms or create accounts before they even understand the product.

I would build the website around this funnel:

**Visitor → sees product → understands features → sees proof/screenshots → requests demo → WhatsApp/call → demo → quote → payment/install → support**

For example, someone searching for a POS system lands on your POS page. That page should immediately show what the system does, screenshots/video, who it is for, major features, what problems it solves, maybe a starting price or “packages available,” and then a strong **Book Free Demo** button.

When they click it, don't give them a huge form. Ask only:

- Name
- Business name
- Phone/WhatsApp
- City
- Business type
- Product interested in
- Preferred demo time

Then your team contacts them on WhatsApp.

For local customers, I would make **WhatsApp extremely important**, but I would not make “WhatsApp us” the entire sales strategy. If everything goes straight to WhatsApp, you lose structured lead information and analytics.

So the website should have three main actions:

**Primary:** `Book a Free Demo`
**Secondary:** `WhatsApp Us`
**For custom work:** `Discuss Your Project`

Then after the lead comes in, your internal process should be:

**1. Qualify the customer**
Understand their business, number of branches/users, current system, main problems, and budget range.

**2. Give a focused demo**
Don't show every feature. Show how your software solves *their* problems.

For a shop owner, for example:

> Sale → receipt → inventory deduction → daily profit/report → customer credit → stock alerts.

**3. Recommend a package**
Instead of making them decide from 50 options.

For example:

> Basic POS
> Professional POS
> Multi-branch POS

**4. Send a professional quotation**
Company branding, features, price, implementation, support, payment terms, validity.

**5. Take payment/deposit**

For custom development, I would normally use an upfront deposit rather than building first and asking for money later.

**6. Installation/onboarding**

**7. Training**

**8. Follow-up/support**

**9. Ask for testimonial/review**

That final part becomes important because every successful local customer can later strengthen the website.

### One thing I would change from typical Pakistani software-house websites

Don't put this everywhere:

> Contact us for more information.

That's weak.

Each product should have a clear path such as:

> **POS for Retail Stores**
> Manage sales, inventory, customers, expenses and reporting from one system.
>
> `Watch Demo` `Book Free Demo`

Then further down:

> Trusted by businesses
> Screenshots
> Features
> How it works
> Packages
> FAQs
> Customer story
>
> **Ready to see it with your own business workflow?**
> `Book Your Demo`

That is much more deliberate.

### Pricing

For your local products, I would **not necessarily hide every price**.

You could show:

> **Starting from Rs. XX,XXX**

or have 2–3 packages.

That filters out people with completely unrealistic budgets while still letting you customize the final quotation.

For larger/custom projects, don't publish fixed prices. Use:

> `Discuss Your Project`

because Flutter apps, automation, AI agents and custom systems vary too much.

So our initial website conversion architecture would probably be:

**Products**
→ View product
→ Book demo
→ WhatsApp/call
→ Quote
→ Sale

**Custom Development**
→ See capabilities/projects
→ Discuss project
→ Qualification call
→ Proposal
→ Contract

That gives us **two separate sales funnels instead of mixing everything together**.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

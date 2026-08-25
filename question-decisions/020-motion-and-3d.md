# Question 020 — Motion and 3D

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How interactive should the website feel?

## Your chosen direction

Use premium motion throughout and selective 3D/WebGL only for a few high-value experiences.

## Why this was chosen

Motion can make software stories clearer, while limiting 3D protects performance, accessibility and maintainability.

## Why it is a strong fit

- Creates a premium feel
- Supports memorable product showcases
- Keeps most pages efficient

## Tradeoffs and safeguards

Every advanced effect requires reduced-motion behavior and a measurable performance budget.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 20 — How interactive should the website feel?

This directly affects whether we stay mostly with Motion/CSS or introduce heavier tools like React Three Fiber.

Choose the level you want:

**A. Minimal motion**
Small hover effects, smooth page transitions, subtle reveals.

**B. Premium motion**
Scroll-triggered storytelling, animated product cards, parallax, sticky sections, interactive screenshots, smooth transitions.

**C. Highly immersive**
3D scenes, WebGL, cursor effects, advanced scroll choreography, animated product environments.

**D. Hybrid**
Mostly premium motion like B, but use **3D/WebGL only for a few standout sections** where it adds real value.

For your site, I recommend **D**. It can feel very modern without hurting performance or turning into a flashy demo site.

Would you like **D**?

#### Your response

> D

#### Explanation or resolution

Locked: **Question 20 = D — premium motion with selective 3D/WebGL**.

That means the default experience stays fast and professional, using CSS + Motion for most interactions, while only a few standout sections may use Three.js/React Three Fiber—for example a hero visual, a flagship product showcase, or an interactive system diagram. We should not make every section 3D.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

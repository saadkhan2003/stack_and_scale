# Public UX Architecture

## Routes

| Route | Visitor goal | Primary action |
|---|---|---|
| `/` | Understand the company and its range | Book a demo / Discuss project |
| `/solutions` | Choose products, custom engineering or automation | Contextual product/project CTA |
| `/approach` | Evaluate delivery credibility | Discuss needs |
| `/work` | Assess relevant proof | Discuss a similar project |
| `/resources` | Learn and compare | Read related guidance / Book a demo |
| `/#contact` | Start an attributed conversation | Submit the lead form |
| `/admin` | Confirm the CMS boundary | Planned status only |

## CTA hierarchy

1. Product buyer: Book a demo.
2. Custom buyer: Discuss your project.
3. WhatsApp remains a future secondary local channel once the lead engine adds attribution and consent.

## Accessibility baseline

- Semantic headings and landmarks.
- Visible keyboard focus.
- No action depends on hover or animation.
- Desktop navigation is replaced by a native keyboard-accessible Menu disclosure at 880 px; it contains every public destination.
- No action depends on hover or animation; focus uses the Solar ring.

## Form journey and states

The lead form is implemented in Phase 09. Its approved journey is: contextual CTA → concise form → inline validation → explicit submit state → success confirmation with response expectation. It must preserve the originating page, campaign and product interest only with the visitor's consent.

Every CMS-backed route must define: empty (useful next action), loading (non-shifting skeleton), error (plain-language retry path), validation (field-level text error) and success states. Work and Resources remain template-only until Phase 06/07, but their content extremes are already part of the wireframe contract.

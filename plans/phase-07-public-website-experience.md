# Phase 07 — Public Website Experience

## Outcome

Build the complete public-facing V1 experience using the approved design system and CMS contracts, with product-led storytelling, excellent mobile behavior and controlled interactive effects.

## Execution profile

- **Model tier:** strongest for flagship storytelling; default for page implementation
- **Mode:** serial integration of Phases 02 and 06
- **External-platform spend:** $0 during development
- **Depends on:** Phases 02 and 06
- **Unlocks:** Phases 08, 09 and 12

## Work packages

### 07.1 Application shell

- Root layout, font loading, metadata defaults and semantic landmarks.
- Responsive header, navigation, footer and mobile menu.
- Error, not-found, maintenance and loading states.
- Preview-mode integration with Payload.

### 07.2 Homepage

- Product-led value proposition.
- Interactive software-ecosystem hero with static/reduced-motion fallback.
- Featured products and work.
- Trust, metrics, capabilities, industries, delivery approach, resources and final CTA.
- Honest demonstration-content labeling.

### 07.3 Product experience

- Product catalog and filters.
- Product detail pages.
- Screenshots, videos, features, use cases, FAQs and demo CTA.
- No public exact pricing.

### 07.4 Services and industries

- Capability-first service pages.
- Industry pages translating capabilities into operational outcomes.
- Related work, products and resources.
- Custom-project CTA.

### 07.5 Work and case studies

- Portfolio index.
- Reusable standard case-study template.
- One flagship product-story framework and three to five publishable flagship project experiences when real approved assets exist.
- If fewer than three truthful flagship projects are available, record an asset-driven deferral in the Phase 00 content inventory; never fabricate proof to meet the count.
- Privacy-safe handling of private clients and metrics.

### 07.6 Company surfaces

- About, team, careers and contact.
- Production-ready privacy and cookie notices reviewed for the actual data practices; placeholders are allowed only in non-production previews.
- Structured office/contact information.
- Accessible contact alternatives.

### 07.7 Performance and accessibility

- Responsive image/video policy.
- Route-level JavaScript budgets.
- Reduced motion and low-power fallbacks.
- Keyboard, screen-reader, zoom and mobile testing.
- Stable layout and font metrics.

## Verification

- Component tests for interactive states.
- Browser journeys across core routes.
- Automated accessibility scans plus manual keyboard review.
- Mobile viewport and poor-network checks.
- Performance traces for homepage and heaviest detail page.
- CMS preview and published rendering parity.

## Exit criteria

- All public route families render from CMS content.
- Primary and secondary CTAs are unambiguous.
- Core pages pass WCAG 2.2 AA checks within the agreed audit scope.
- Performance budgets pass with motion enabled and disabled.
- No unapproved or fabricated proof appears.
- The public app can fail gracefully if the CMS is temporarily unavailable by using cached content where designed.

## Rollback and recovery

Interactive features must be feature-isolated. Disable or replace a failed hero/demo without reverting the content model or the rest of the page.

## Cold-start handoff

Read Phases 02 and 06, Questions 3–9 and 18–23, and the Brand/Information Architecture sections of the blueprint.

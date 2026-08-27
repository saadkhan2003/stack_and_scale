# V1 Scope — Public Foundation and Lead Engine

## Outcome

Launch a credible, accessible, privacy-aware Stack & Scale public website that presents products and custom engineering, publishes structured content through Payload CMS, captures qualified leads, supports demo booking and WhatsApp handoff, and operates on a secure/recoverable VPS foundation within USD 50/month.

## Included capabilities

| ID    | Capability                      | Owner execution phases | Acceptance outcome                                                                                                                     |
| ----- | ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| V1-01 | Brand and design system         | 02, 07                 | Trusted, modern, accessible public experience using approved logo/colors and truthful proof.                                           |
| V1-02 | Public website route families   | 06–08                  | Home, Work/Case Studies, Products, Services, Industries, About, Careers, Resources and Contact render from controlled content.         |
| V1-03 | Product/service conversion      | 07, 09                 | Book a Demo for products, Discuss Your Project for services, and secondary WhatsApp handoff with attribution.                          |
| V1-04 | Payload CMS publishing          | 06, 07                 | Authorized staff can draft, review, publish and preview structured content without arbitrary layout control.                           |
| V1-05 | SEO/resource center/search      | 08                     | Indexable metadata, sitemap, resource relationships, consent-aware analytics and accessible published-content search.                  |
| V1-06 | Lead engine/basic CRM           | 04, 05, 09             | Validated lead capture, consent evidence, assignment, tasking, demo handling, confirmation and retained-lead recovery.                 |
| V1-07 | Identity/authorization          | 05                     | Staff authentication, MFA policy, organization/role controls, audit trail and server-side deny-by-default access.                      |
| V1-08 | Backend/data foundation         | 03–05                  | Modular NestJS, PostgreSQL migrations, outbox/jobs, API contracts, audit/redaction and privacy operations foundation.                  |
| V1-09 | Delivery and environments       | 01, 03, 10             | Reproducible deployment, separated environments, edge protection and immutable deploy/rollback procedure.                              |
| V1-10 | Security/recovery/observability | 03, 10–12              | Threat controls, monitoring, independent status communication, geographically separate backups and restore evidence.                   |
| V1-11 | Privacy operations              | 00, 03, 04, 08, 12     | Notices, consent/preference history, request intake/export/correction/restriction/erasure, retention/legal hold and propagation tests. |
| V1-12 | Launch proof                    | 12                     | Critical journeys, accessibility, performance, security, privacy, cost and restore gates pass in production.                           |

## Explicitly deferred

- Staff operations workspace beyond basic lead/CRM processing (Phase 13).
- Proposals, contracts, e-signature, invoices, local payments, support, files and formal provisioning (Phase 14).
- Client project portal and product customer account portal (Phases 15–16).
- Product license control plane, offline synchronization, public APIs and integrations (Phases 16–17).
- AI assistants, agents, RAG, marketing automation, advanced analytics, specialist search and multi-region scaling (Phase 18 child phases).
- Public exact product prices; use demo/quote workflows initially.
- Additional languages beyond the approved initial English public experience.
- Any paid platform prohibited by `plans/BUDGET_GUARDRAILS.md`.

## Prohibited in V1

- Fabricated customer names, results, testimonials, case studies or claims.
- A custom password system.
- Public database access, production data in preview/dev, or manual production-schema edits.
- AI as a required user journey or operational dependency.
- Microservices, paid CRM, paid identity, paid analytics, paid status, paid search or paid marketing automation without an approved amendment.
- Portal, billing, payment, product-account, license or offline-product work hidden inside V1 changes.

## Scope-change gate

Any proposed V1 addition must name the displaced capability, new recurring cost, security/privacy impact, test burden, rollback method and user approval. Otherwise it is deferred to the appropriate later phase.

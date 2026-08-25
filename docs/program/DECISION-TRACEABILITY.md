# Per-Decision Traceability

Every locked decision has one individual row. `V1` means implementation/verification is required before the public launch; `Deferred` means the architecture/contract is retained but the capability is not built until its owner phase.

| Question | Requirement | Status | Owner phase | Acceptance family | Blueprint |
|---|---|---|---|---|---|
| Q001 | REQ-BRAND-001 | V1 | 00, 02, 07 | Content/design review | §§1, 3 |
| Q002 | REQ-BRAND-001 | V1 | 02, 07 | Content/CTA review | §§1, 3 |
| Q003 | REQ-CONVERT-001 | V1 | 07, 09 | Browser lead journey | §5 |
| Q004 | REQ-BRAND-001 | V1 | 02, 07 | Design review | §3 |
| Q005 | REQ-BRAND-001 | V1 | 02, 07 | Design/accessibility review | §3 |
| Q006 | REQ-BRAND-001 | V1 | 02, 07 | Homepage browser journey | §3 |
| Q007 | REQ-CONTENT-001 | V1 | 00, 06, 07 | Content inventory/CMS test | §§4, 6 |
| Q008 | REQ-CONTENT-001 | V1 | 06, 07 | Route-family browser test | §§4, 22 |
| Q009 | REQ-CONTENT-001 | V1 | 07 | Approved case-study review | §§3, 4 |
| Q010 | REQ-CONTENT-001 | V1 | 07 | Content/language review | §4 |
| Q011 | REQ-IDENTITY-001 | V1 | 05 | Authentication/authorization test | §8 |
| Q012 | REQ-FUTURE-001 | Deferred | 14, 16 | Commercial state-machine test | §§8, 10 |
| Q013 | REQ-FUTURE-001 | Deferred | 14 | Payment/reconciliation test | §10 |
| Q014 | REQ-CONVERT-001 | V1 | 09 | Lead/CRM integration test | §5 |
| Q015 | REQ-CONVERT-001 | V1 | 09 | Attributed WhatsApp handoff test | §5 |
| Q016 | REQ-CONVERT-001 | V1 | 09 | Demo booking test | §5 |
| Q017 | REQ-CONVERT-001 | V1 | 09 | Assignment/task workflow test | §5 |
| Q018 | REQ-CONVERT-001 | V1 | 07 | No-public-price content review | §5 |
| Q019 | REQ-CONTENT-001 | V1 | 00, 07 | Proof/rights review | §3 |
| Q020 | REQ-BRAND-001 | V1 | 02, 07 | Motion/performance/accessibility test | §3 |
| Q021 | REQ-BRAND-001 | V1 | 07 | Hero fallback browser test | §3 |
| Q022 | REQ-CONTENT-001 | V1 | 07 | Route/CTA browser test | §4 |
| Q023 | REQ-SEO-001 | V1 | 08 | Search/accessibility test | §4 |
| Q024 | REQ-CONTENT-001 | V1 | 06, 08 | CMS/SEO review | §§4, 6 |
| Q025 | REQ-BRAND-001 | V1 | 07, 08 | Audience/content review | §§1, 4 |
| Q026 | REQ-OPS-001 | V1 | 00, 10 | ADR/cost/recovery test | §16 |
| Q027 | REQ-OPS-001 | V1 | 03, 10 | Deployment/rollback test | §16 |
| Q028 | REQ-IDENTITY-001 | V1 | 05 | Auth/MFA/recovery test | §15 |
| Q029 | REQ-IDENTITY-001 | V1 policy | 03, 05 | Data-boundary test | §8 |
| Q030 | REQ-FUTURE-001 | Deferred | 16 | Product control-plane test | §9 |
| Q031 | REQ-FUTURE-001 | Deferred | 17 | Offline resilience test | §9 |
| Q032 | REQ-IDENTITY-001 | V1 foundation | 05 | Organization/role test | §15 |
| Q033 | REQ-PLATFORM-001 | V1 foundation | 03, 04 | API/contract test | §14 |
| Q034 | REQ-FUTURE-001 | Deferred | 17, 18 | API lifecycle test | §14 |
| Q035 | REQ-FUTURE-001 | Deferred | 13 | Staff workflow test | §7 |
| Q036 | REQ-IDENTITY-001 | V1 foundation | 05 | Privilege/tenant test | §§7, 15 |
| Q037 | REQ-FUTURE-001 | Deferred | 13 | Task workflow test | §7 |
| Q038 | REQ-FUTURE-001 | Deferred | 14, 15 | Support workflow test | §7 |
| Q039 | REQ-FUTURE-001 | Deferred | 13 | Notification workflow test | §11 |
| Q040 | REQ-IDENTITY-001 | V1 foundation | 04, 05 | Audit/redaction test | §15 |
| Q041 | REQ-FUTURE-001 | Deferred | 14 | File access/restore test | §7 |
| Q042 | REQ-FUTURE-001 | Deferred | 13, 18 | Reporting correctness test | §7 |
| Q043 | REQ-FUTURE-001 | Deferred | 14 | Proposal state-machine test | §10 |
| Q044 | REQ-FUTURE-001 | Deferred | 14 | E-signature integration test | §10 |
| Q045 | REQ-FUTURE-001 | Deferred | 14 | Accounting export test | §§10, 16 |
| Q046 | REQ-FUTURE-001 | Deferred | 14, 17 | Provisioning/idempotency test | §9 |
| Q047 | REQ-OPS-001 | V1 foundation | 10, 13 | Release/rollback visibility test | §16 |
| Q048 | REQ-OPS-001 | V1 | 11, 12 | Independent status/incident test | §18 |
| Q049 | REQ-OPS-001 | V1 | 11 | Telemetry/alert test | §18 |
| Q050 | REQ-OPS-001 | V1 | 11, 12 | Restore/RPO-RTO test | §18 |
| Q051 | REQ-PRIVACY-001 | V1 | 00, 03, 04, 12 | Privacy end-to-end test | §15 |
| Q052 | REQ-PRIVACY-001 | V1 | 00, 10, 11 | Data-region/backup review | §15 |
| Q053 | REQ-OPS-001 | V1 baseline | 10, 18 | Regional strategy/capacity review | §16 |
| Q054 | REQ-OPS-001 | V1 | 09, 11 | Transactional-email test | §11 |
| Q055 | REQ-FUTURE-001 | Deferred | 13 | Activity timeline test | §7 |
| Q056 | REQ-FUTURE-001 | Deferred | 13 | Permission-filtered search test | §7 |
| Q057 | REQ-FUTURE-001 | Deferred | 13 | Dashboard metric test | §7 |
| Q058 | REQ-FUTURE-001 | Deferred | 13 | Approval policy test | §7 |
| Q059 | REQ-FUTURE-001 | Deferred | 13 | Knowledge/announcement test | §7 |
| Q060 | REQ-FUTURE-001 | Deferred | 13, 18 | Contextual knowledge test | §7 |
| Q061 | REQ-BRAND-001 | V1 input | 00, 02 | Asset-rights/accessibility review | §3 |
| Q062 | REQ-BRAND-001 | V1 | 00, 02, 07 | Brand review | §3 |
| Q063 | REQ-CONTENT-001 | V1 | 02, 07 | Navigation browser test | §4 |
| Q064 | REQ-BRAND-001 | V1 | 02, 07 | Homepage browser test | §3 |
| Q065 | REQ-BRAND-001 | V1 | 07 | Interactive experience test | §3 |
| Q066 | REQ-CONTENT-001 | V1 foundation | 07 | Locale/content review | §4 |
| Q067 | REQ-BRAND-001 | V1 | 07 | Mobile/PWA scope test | §17 |
| Q068 | REQ-QUALITY-001 | V1 | 00, 07, 12 | WCAG test | §17 |
| Q069 | REQ-QUALITY-001 | V1 | 07, 08, 12 | Performance/CWV test | §17 |
| Q070 | REQ-SEO-001 | V1 | 08, 12 | Consent/analytics test | §19 |
| Q071 | REQ-PLATFORM-001 | V1 | 03, 04 | Database domain/migration test | §13 |
| Q072 | REQ-PLATFORM-001 | V1 | 03, 04 | Module-boundary/API test | §13 |
| Q073 | REQ-PLATFORM-001 | V1 | 03, 04 | API/event contract test | §14 |
| Q074 | REQ-PLATFORM-001 | V1 | 01 | Monorepo architecture check | §12 |
| Q075 | REQ-BRAND-001 | V1 | 02, 07 | Design-system test | §12 |
| Q076 | REQ-CONTENT-001 | V1 | 06 | CMS composition test | §6 |
| Q077 | REQ-CONTENT-001 | V1 | 06 | Publishing workflow test | §6 |
| Q078 | REQ-OPS-001 | V1 | 00, 01, 10 | Delivery-policy/CI test | §16 |
| Q079 | REQ-QUALITY-001 | V1 | 00 onward | Risk-based test suite | §17 |
| Q080 | REQ-OPS-001 | V1 | 00, 01, 10 | Environment isolation test | §16 |
| Q081 | REQ-OPS-001 | V1 | 00, 10 | IaC recreate/drift test | §16 |
| Q082 | REQ-OPS-001 | V1 | 00, 01, 10, 11 | Secrets custody/recovery test | §15 |
| Q083 | REQ-IDENTITY-001 | V1 | 05 | Identity ADR/integration test | §15 |
| Q084 | REQ-IDENTITY-001 | V1 foundation | 03, 05 | Tenant-placement test | §§8, 15 |
| Q085 | REQ-FUTURE-001 | Deferred | 16, 17 | Product contract/resilience test | §9 |
| Q086 | REQ-FUTURE-001 | Deferred | 18 | AI evaluation/safety test | §20 |
| Q087 | REQ-SEO-001 | V1 baseline | 08, 13, 18 | Search relevance/access test | §§4, 19 |
| Q088 | REQ-FUTURE-001 | Deferred | 13–18 | Communication workflow test | §11 |
| Q089 | REQ-FUTURE-001 | Deferred | 15 | Client portal isolation test | §8 |
| Q090 | REQ-FUTURE-001 | Deferred | 16 | Account portal test | §8 |
| Q091 | REQ-CONVERT-001 | V1 | 09 | Lead qualification test | §5 |
| Q092 | REQ-CONVERT-001 | V1 baseline | 09, 13 | Pipeline state-machine test | §5 |
| Q093 | REQ-SEO-001 | V1 | 08 | SEO/index test | §19 |
| Q094 | REQ-CONTENT-001 | V1 | 06, 08 | Resource-center test | §§4, 6 |
| Q095 | REQ-SEO-001 | V1 | 08 | Marketing/consent test | §19 |
| Q096 | REQ-OPS-001 | V1 | 03, 10 | Edge/security test | §16 |
| Q097 | REQ-PLATFORM-001 | V1 | 00, 04 | Migration lifecycle test | §13 |
| Q098 | REQ-OPS-001 | V1 | 11, 12 | Monitoring/alert test | §18 |
| Q099 | REQ-FUTURE-001 | V1 boundary | 00–18 | Phase-gate evidence | §§21–22 |
| Q100 | REQ-PLATFORM-001 | V1 target | 00–18 | Architecture/phase review | §25 |


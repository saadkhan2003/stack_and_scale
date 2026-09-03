# Stack & Scale — End-to-End Team QA & Production Verification Suite

**Master Verification Matrix:** [Platform Blueprint v1.0](file:///media/saad/Data/stack_and_scale/STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md) & [100 Architecture Question Decisions](file:///media/saad/Data/stack_and_scale/question-decisions/README.md)  
**Target Environment:** OVHcloud Production Host (`vps-5d4dfcb1`, Ubuntu 24.04 LTS)  
**Production Gateway:** `https://stackandscale.org`  
**Identity Gateway:** `https://identity.stackandscale.org`  
**Payload CMS Gateway:** `https://cms.stackandscale.org/admin`  
**API Gateway:** `https://api.stackandscale.org`  
**Public Status Gateway:** `https://status.stackandscale.org`

---

## 1. Collaborative Team Verification Architecture

Stack & Scale is tested through a **4-stage collaborative verification chain**. Each engineer owns an explicit operational boundary, executing click-by-click tests and passing cryptographic / transactional state to the next engineer in the pipeline.

```mermaid
flowchart LR
    M1["Muhammad Saad Khan<br/><b>Marketing, CMS & Inbound Leads</b><br/>• Brand Logo & Mobile Navigation<br/>• Cmd+K Search & FAQ Accordions<br/>• Payload CMS Publishing<br/>• /blog 308 Redirects<br/>• Lead Submission (Alex Mercer)"]
    --> |"Lead Ref & Metadata"| M2["Talha Shams<br/><b>Identity, Staff CRM & Operations</b><br/>• Keycloak OIDC Intercept & RBAC<br/>• Lead 360 Triage & Status Audit<br/>• Timeline Collaboration Notes<br/>• Convert to $45k Opportunity<br/>• Outbox Queue Telemetry"]
    --> |"Client Org & Opp ID"| M3["Hanzala Khan<br/><b>Portals, Storage & Contracts</b><br/>• $45k Proposal Structuring<br/>• Multi-Tenant URL Tampering Denial<br/>• Digital E-Signature as Alex Mercer<br/>• Invoicing & PDF Downloads<br/>• MinIO Upload & ClamAV Quarantine<br/>• Product Customer Accounts"]
    --> |"Storage & Security Digest"| M4["Dragoooo<br/><b>Infra, Security & Observability</b><br/>• Edge TLS 1.3 & HSTS Inspection<br/>• Port Scan (5432, 9000, 3310 Blocked)<br/>• API Health & Rate-Limiting<br/>• Grafana & Loki Telemetry<br/>• Chaos Self-Healing Recovery Drill<br/>• Database SQL Backup Dump"]
    --> |"All 4 Signed Checklists"| GO["MASTER PRODUCTION<br/>LAUNCH CERTIFICATE"]
```

---

## 2. Team Member QA Runbooks

| Member       | Assigned Engineer      | Scope & Architectural Focus                                                                                                                                                                                    | Runbook Document                                                                                                         |
| ------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Member 1** | **Muhammad Saad Khan** | Public Web, Design System, Command Palette, Payload CMS Editorial Lifecycle, `/blog` 308 Redirects & Inbound Lead Funnel                                                                                       | [`1-MUHAMMAD-SAAD-KHAN-MARKETING-CMS-CONVERSION.md`](./1-MUHAMMAD-SAAD-KHAN-MARKETING-CMS-CONVERSION.md)                 |
| **Member 2** | **Talha Shams**        | Keycloak OIDC Gateway, RBAC Protection, Staff Lead 360 Inbox, Opportunity Pipeline Conversion ($45,000 USD), Operations Outbox Telemetry & Knowledge Base                                                      | [`2-TALHA-SHAMS-IDENTITY-STAFF-CRM-OPERATIONS.md`](./2-TALHA-SHAMS-IDENTITY-STAFF-CRM-OPERATIONS.md)                     |
| **Member 3** | **Hanzala Khan**       | Commercial Proposals, Multi-Tenant Client Portal (`/portal/[id]`), Product Customer Account Portal (`/account/[id]`), Digital E-Signatures, Invoicing, MinIO S3 File Vault & ClamAV Antivirus Quarantine Drill | [`3-HANZALA-KHAN-CLIENT-PORTAL-PRODUCT-ACCOUNTS-STORAGE.md`](./3-HANZALA-KHAN-CLIENT-PORTAL-PRODUCT-ACCOUNTS-STORAGE.md) |
| **Member 4** | **Dragoooo**           | Network Perimeter Hardening, Port Scans, API Probes & Rate Limiting, Grafana Telemetry, Loki LogQL Queries, Container Chaos Self-Healing Drill & Disaster Recovery Backups                                     | [`4-DRAGOOOO-INFRA-SECURITY-OBSERVABILITY-DR.md`](./4-DRAGOOOO-INFRA-SECURITY-OBSERVABILITY-DR.md)                       |

---

## 3. Operational Rules of Engagement

1. **Sequential Execution:** Runbooks are executed in sequence from Member 1 &rarr; Member 2 &rarr; Member 3 &rarr; Member 4.
2. **Real Production Evidence:** Do not skip tests. Every operator must record their real timestamps, correlation IDs, and sign their respective verification sheets.
3. **No Zero-Byte Mocking:** Files uploaded and SQL dumps created must contain genuine bytes and pass structural validation.
4. **Final Gate Assembly:** Once all 4 sign-off tables are marked `Pass`, Dragoooo signs the Master Launch Summary to confirm complete platform readiness.

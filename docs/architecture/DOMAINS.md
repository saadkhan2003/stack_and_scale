# Domain Ownership and Dependencies

## Rule

Each domain owns its business rules, schema/migration namespace and persistence interface. A domain may read another domain only through its application API, stable read projection, or domain event. Cross-domain foreign keys, ad-hoc joins and direct repository imports are prohibited unless this document is amended.

| Domain | Owns | May depend on | Must not own |
|---|---|---|---|
| Identity and access | users, credentials references, sessions, memberships, roles | organizations, audit | billing or portal records |
| Organizations and contacts | organizations, branches, contacts, tenant placement | identity, audit | product operational databases |
| CRM and sales | leads, opportunities, activities, attribution | organizations, notifications, audit | payments or project delivery |
| Content | entries, media references, publishing workflow | files, audit | CRM private notes |
| Product control plane | catalog, plans, entitlements, instances, provisioning requests | organizations, billing, integrations | a product's operational transactions |
| Billing | subscriptions, invoices, payment records, ledger references | organizations, product control plane, audit | payment-provider secrets |
| Projects and documents | projects, milestones, proposals, contracts, client visibility | organizations, files, notifications | source credentials |
| Support and knowledge | tickets, knowledge articles, service history | organizations, notifications | unrestricted client files |
| Files | object metadata, access grants, retention state | organizations, audit | public anonymous access by default |
| Notifications and audit | delivery intents, preferences, immutable audit records | all domains through events | mutable domain source-of-truth data |
| Integrations and reporting | webhook endpoints, provider adapters, projections | domain events, audit | business-rule ownership |

## Dependency direction

```text
Interfaces / contracts
        ↑
Applications and adapters
        ↑
Domain modules → transactional outbox → workers/adapters
```

Shared packages may contain schemas, IDs and transport contracts. They may not contain domain-specific database repositories. Reporting uses asynchronously refreshed projections and cannot write back into a source domain.

## Data conventions

- Use globally unique, non-sequential externally exposed IDs.
- Tenant-owned records carry `organization_id`; indexes begin with it when a query is tenant-scoped.
- Store timestamps in UTC, money in minor units plus ISO currency, and critical financial/audit history append-only.
- Use optimistic versions for conflicting updates and explicit soft-delete, anonymization or retention states rather than ambiguous deletion flags.

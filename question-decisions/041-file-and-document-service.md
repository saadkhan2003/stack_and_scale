# Question 041 — File and document service

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should files be stored and shared?

## Your chosen direction

Use a centralized document service backed by private object storage, signed URLs and versioning where useful.

## Why this was chosen

Project files, proposals, invoices, uploads and support attachments need one secure access model.

## Why it is a strong fit

- Consistent permissions
- Scalable media storage
- Auditable access and versions

## Tradeoffs and safeguards

Uploads require quotas, validation, lifecycle rules and malware controls based on risk.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 41 — File and document management

Since `portal.company.com`, `account.company.com`, and `staff.company.com` will all deal with files, we should decide how serious the document system should be.

I recommend a **central file service**, rather than each module inventing its own upload logic.

For example:

```text
Files / Documents

├── Client project files
├── Contracts
├── Quotations
├── Invoices
├── Payment proofs
├── Support attachments
├── Project deliverables
├── Product downloads
├── Screenshots
└── Internal documents
```

But permissions determine who can see each file.

A client might see:

```text
Project: Retail App

Documents
├── Requirements-v3.pdf
├── UI-Design.fig
├── Proposal.pdf
└── Release-1.4.zip
```

while staff could additionally see internal-only material.

I would also support metadata like:

```text
File
├── Name
├── Type
├── Size
├── Uploaded by
├── Organization
├── Project / Ticket / Invoice relation
├── Visibility
├── Version
├── Created date
└── Storage key
```

Actual files could live in **Cloudflare R2 or another S3-compatible object store**, while PostgreSQL stores only metadata and relationships.

For security, private files should not have permanent public URLs. The system should generate **short-lived signed download links** after checking the user's permission.

My recommendation is:

**Question 41 = centralized file/document service + private object storage + permission-controlled signed URLs + file versioning where useful.**

Do you want to lock that?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 41 = centralized file/document service + private object storage + permission-controlled signed URLs + file versioning where useful.**

That gives us one consistent storage layer for project files, invoices, contracts, payment proofs, support attachments, product downloads, and internal documents, without exposing private files through permanent public links.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

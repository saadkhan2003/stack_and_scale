# User Manual 5: Client Portal Onboarding & Collaboration Guide

> **Target Audience:** Enterprise Clients, Strategic Partners, Customer Stakeholders  
> **Primary Surface:** `https://stackandscale.org/portal/[clientOrganizationId]`  
> **Security Protocol:** 256-bit TLS Encryption · Row-Level Multi-Tenant Isolation · ClamAV Antivirus Vault

Welcome to the **Stack & Scale Client Portal**. This guide explains how to access your dedicated workspace, review and digitally sign commercial proposals, track project milestones, download invoices, and exchange confidential files safely.

---

## 1. Accessing Your Dedicated Client Portal

When your project begins, your account lead will send you a unique, private portal URL:

```text
https://stackandscale.org/portal/[your-organization-id]
```

*(Example: `https://stackandscale.org/portal/org-fintech-global`)*

> [!NOTE]
> **Enterprise Privacy Guarantee:**  
> Your portal is cryptographically isolated. No other client or external party can discover, view, or modify your organization's proposals, deliverables, or invoices.

---

## 2. Reviewing & Signing Commercial Proposals

1. Navigate to your portal link.
2. In the top navigation tabs, select **Proposals & Scope**.
3. **Reviewing Scope:**
   - Detailed project overview and architectural deliverables.
   - Transparent line-item pricing breakdown.
   - Delivery timeline, milestones, and SLA guarantees.
4. **Executing Digital E-Signature:**
   - Scroll to the **Digital Agreement Acceptance** section.
   - Enter your **Full Legal Name** (e.g. `Sarah Jenkins`).
   - Enter your **Corporate Title** (e.g. `VP of Engineering`).
   - Click **Approve & Sign Agreement**.
5. Once submitted, the system generates a permanent, cryptographically verified signature record with UTC timestamp and SHA-256 integrity hash. A confirmation receipt will display on the screen.

---

## 3. Tracking Project Milestones

1. Switch to the **Project Milestones** tab.
2. Review progress across scheduled deliverables:
   - **Phase 1: Architecture Blueprint & Cloud Topology** &rarr; `In Progress`
   - **Phase 2: Database Schema & High-Throughput API Gateway** &rarr; `Scheduled`
   - **Phase 3: Production Security Lockdown & Penetration Audit** &rarr; `Scheduled`
3. As milestones are completed, status tags update in real time with links to review notes and sign-off summaries.

---

## 4. Invoicing & Financial Receipts

1. Switch to the **Billing & Invoices** tab.
2. View all issued milestone invoices (e.g. `INV-2026-001`).
3. Click **Download PDF** next to any invoice to obtain a clean, branded PDF receipt formatted for your corporate finance and procurement departments.

---

## 5. Secure File Vault & Deliverables

The portal features an integrated **Private S3 File Vault** for secure file transfers:

### 5.1 Downloading Completed Deliverables
- In the **Deliverables & Files** tab, view finalized system diagrams, API keys, and deployment bundles provided by our engineering team.
- Click **Download** to retrieve the files directly over encrypted TLS.

### 5.2 Uploading Client Specifications & Documents
- Click **Upload Document** to provide confidential specifications, credentials, or data dumps.
- **Real-Time Antivirus Protection:**  
  Every file uploaded is scanned in real-time by our sandboxed **ClamAV antivirus engine**. Once verified clean, it is safely stored in our private encrypted vault.

---

## 6. Support & Contacting Your Team Lead

Need assistance or wish to schedule a technical architecture review?
- Contact your dedicated account lead directly or reach out via **support@stackandscale.org**.

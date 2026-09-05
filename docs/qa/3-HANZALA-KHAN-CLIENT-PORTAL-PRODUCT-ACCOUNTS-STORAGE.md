# QA Runbook — Hanzala Khan: Commercials, Client Portal, Product Accounts & Private Storage

**Assigned Engineer:** Hanzala Khan  
**Assigned Roles & Boundaries:** Proposals & Digital Agreements, Multi-Tenant Custom Client Portal (`/portal/[id]`), Product Customer Account Portal (`/account/[id]`), Invoicing & Billing, Private S3 Storage (MinIO), and ClamAV Antivirus Scanning  
**Architecture Grounding:** [Blueprint §2.1](file:///media/saad/Data/stack_and_scale/STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md), [Q011–Q013](file:///media/saad/Data/stack_and_scale/question-decisions/011-customer-account-strategy.md), [Q029–Q034](file:///media/saad/Data/stack_and_scale/question-decisions/029-portal-data-boundaries.md), [Q041–Q045](file:///media/saad/Data/stack_and_scale/question-decisions/041-file-and-document-service.md), [Q084, Q089, Q090](file:///media/saad/Data/stack_and_scale/question-decisions/084-multi-tenancy-model.md)  
**Primary Target URLs:**
- Staff Proposals Console: `https://stackandscale.org/staff/proposals`
- Custom Client Portal: `https://stackandscale.org/portal/[clientOrganizationId]`
- Product Account Portal: `https://stackandscale.org/account/[accountOrganizationId]`
- Internal Storage Fabric: MinIO (`storage:9000`), ClamAV Engine (`storage:3310`)

---

## 1. Executive Context & System Architecture
Stack & Scale operates two distinct customer-facing portal environments:
1. **Custom Client Portal (`/portal/...`):** For enterprise clients purchasing bespoke engineering (e.g. Acme Corp). Manages project milestones, digital e-signatures, commercial invoices, and private deliverable file vaults.
2. **Product Customer Account Portal (`/account/...`):** For subscribers of off-the-shelf software products (POS, SaaS, Tailor Management). Manages software licenses, instance provisioning, seat preferences, and billing.

Both portals integrate with the **Internal Storage Fabric**:
- **MinIO Object Storage:** Running privately inside the `storage` Docker network (zero public port exposure).
- **ClamAV Daemon:** Every incoming file upload is streamed through ClamAV on port 3310. Clean files receive cryptographic SHA-256 hashes and are stored in MinIO; malware files are intercepted and quarantined with HTTP 422.

As **Hanzala Khan**, your mission is to verify end-to-end commercial operations: issue a proposal, test tenant isolation against unauthorized URL tampering, sign the digital contract as Alex Mercer, verify invoices, test clean file uploads to MinIO with presigned downloads, execute an antivirus malware quarantine drill, and verify the product customer account portal.

---

## 2. Testing Environment & Prerequisites
- **Browser:** Google Chrome (in Incognito mode for client portal sign-in).
- **Test Artifacts:**
  - Clean test PDF: Prepare a standard document (e.g., `architecture-blueprint.pdf`, ~100 KB).
  - Standard EICAR Antivirus Test String: A non-malicious standard test file (`eicar-threat.txt`).
- **Handoff from Talha Shams:** Ensure you have the Opportunity details for `Acme Global Technologies` ($45,000 USD).

---

## 3. Step-by-Step Execution Suites

---

### Test Suite 3.1: Commercial Proposal Creation & Scope Structuring

#### Context:
Per **Q043 and Q044**, staff author detailed commercial proposals containing structured deliverables, payment milestones, and legal agreements.

#### Click-by-Click Instructions:
1. Navigate to: `https://stackandscale.org/staff/proposals`.
2. Click the primary button: **"+ Create New Proposal"**.
3. Fill out the proposal parameters:
   - **Target Organization:** `Acme Global Technologies`
   - **Primary Contact:** `Alex Mercer` (`alex.mercer@acmecorp-testing.com`)
   - **Proposal Title:** `Enterprise Cloud Migration & Private Storage Architecture`
   - **Currency:** `USD ($)`
   - **Total Project Value:** `45000`
4. **Define Milestone Breakdown (Q045):**
   - **Milestone 1:** `Architecture Specification & Infrastructure Hardening` — **$15,000** (Upfront Deposit)
   - **Milestone 2:** `Identity Provider Federation & Multi-Tenant Portal` — **$15,000**
   - **Milestone 3:** `MinIO Storage Fabric & Antivirus Scanning Pipeline` — **$10,000**
   - **Milestone 4:** `Chaos Recovery & Final Production Sign-Off` — **$5,000**
5. **Legal Terms & SLA (Q044):**
   - Standard 99.9% uptime SLA, 30-day warranty, Net-15 invoice payment terms.
6. Click the blue button: **"Save & Issue Proposal"**.
7. **Verify Creation:**
   - Status updates to **`ISSUED`**.
   - Proposal reference ID generated (e.g., `PROP-2026-0089`).
   - Copy the generated **Client Portal URL**: `https://stackandscale.org/portal/org-acme-prod` *(or your assigned test organization ID)*.

---

### Test Suite 3.2: Custom Client Portal & Multi-Tenant Data Isolation

#### Context:
Per **Q029 and Q084**, all customer data is strictly isolated by organization ID. Users cannot view or access records belonging to another tenant.

#### Click-by-Click Instructions:

##### Part A: Authorized Client Access
1. Open a new **Incognito** browser window.
2. Navigate to the Client Portal URL: `https://stackandscale.org/portal/org-acme-prod`.
3. Sign in as client contact `Alex Mercer` (`alex.mercer@acmecorp-testing.com`).
4. **Verify Client Workspace Shell:**
   - Branded workspace header: *"Acme Global Technologies — Client Workspace"*.
   - Navigation tabs: `Overview`, `Documents & Proposals`, `Invoices & Billing`, `Deliverables & Files`, `Support Tickets`.

##### Part B: Multi-Tenant Boundary Penetration Drill (Negative Test / Q029)
1. While logged in as Acme Corp, manually edit the browser URL to access a foreign organization:
   `https://stackandscale.org/portal/org-competitor-xyz`
2. Press **Enter**.
3. **Inspect the Response:**
   - In DevTools Network tab, the request to `/api/v1/portal/client-organizations/org-competitor-xyz/access` returns HTTP **`403 Forbidden`** or **`404 Not Found`**.
   - UI displays a clean access denial screen: *"Access Denied — You are not authorized to view this organization workspace."*
   - **Security Confirmation:** Zero records, invoices, or document names from the other tenant are leaked.

---

### Test Suite 3.3: Digital Contract E-Signature Lifecycle

#### Context:
Per **Q044**, commercial agreements are executed digitally with cryptographically stored signatory metadata and timestamps.

#### Click-by-Click Instructions:
1. Return to Acme's authorized portal: `https://stackandscale.org/portal/org-acme-prod`.
2. Click on the **"Documents & Proposals"** tab.
3. Locate proposal `PROP-2026-0089` (status: `ISSUED`).
4. Click **"Review & Sign Document"**:
   - The contract viewer opens displaying the full scope ($45,000 USD) and milestones.
   - Scroll to the bottom execution block.
5. **Execute the E-Signature:**
   - In the **Legal Full Name** field, type: `Alex Mercer`.
   - In the **Title / Position** field, type: `VP of Infrastructure`.
   - Check the legal consent box: *"I confirm that I am an authorized representative and agree to these commercial terms."*
   - Click the green button: **"Accept & Sign Agreement"**.
6. **Verify State Transition:**
   - Status badge immediately transitions from `ISSUED` to green **`EXECUTED`**.
   - A digital audit stamp appears:
     *"Signed by Alex Mercer on [Current UTC Date] (SHA-256 Digital Fingerprint: 4f8a...e9b2)"*.

---

### Test Suite 3.4: Invoicing & Billing Lifecycle

#### Context:
Per **Q045**, signing the proposal automatically triggers the initial milestone invoice in the accounting sub-domain.

#### Click-by-Click Instructions:
1. In the Client Portal, click the **"Invoices & Billing"** tab.
2. Locate the newly generated invoice:
   - **Invoice Number:** `INV-2026-001`
   - **Description:** `Milestone 1 Deposit — Architecture & Hardening`
   - **Amount Due:** `$15,000.00 USD`
   - **Status:** **`DUE`** (Net-15 terms).
3. **Test PDF Generation & Download:**
   - Click the button: **"Download PDF Invoice"**.
   - Open the downloaded `INV-2026-001.pdf`:
     - Verify official Stack & Scale company header, tax registration, client billing address, and itemized breakdown.
4. **Transition to Paid (Simulated Settlement):**
   - In staff console (or portal test controls), mark `INV-2026-001` as **`PAID`**.
   - Refresh the client portal: status badge turns green **`PAID`** with zero remaining balance for Milestone 1.

---

### Test Suite 3.5: Private File Vault & Clean Upload (MinIO + ClamAV)

#### Context:
Per **Q041 and Phase 14 Storage Architecture**, deliverables are scanned for malware in memory before being committed to MinIO object storage.

#### Click-by-Click Instructions:

##### Part A: Uploading a Clean Deliverable
1. In the Client Portal, click the **"Deliverables & Files"** tab.
2. Click the upload button: **"Upload Deliverable File"**.
3. Select your clean test file: `architecture-blueprint.pdf`.
4. In DevTools Network tab, observe the `POST /api/v1/portal/.../files` request:
   - **Transfer Protocol:** Multipart form-data stream.
   - **ClamAV Scan Result:** `Clean (0 signatures matched)`.
   - **Storage Destination:** Encrypted bucket `stack-and-scale-private` on MinIO (`storage:9000`).
   - **HTTP Response:** **`201 Created`**.
5. **Verify File Listing:**
   - The file appears in the Deliverables table.
   - Size: `102 KB`.
   - Security Shield Badge: Green shield reading **`Verified Clean (ClamAV)`**.

##### Part B: Presigned Download URL Expiration (Q041)
1. Click the **"Download"** button next to `architecture-blueprint.pdf`.
2. Inspect the download link in DevTools:
   - The link is a secure MinIO presigned S3 URL containing `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900`.
3. Open the downloaded file: verify the PDF content is intact and identical to the uploaded version.

---

### Test Suite 3.6: Antivirus Malware Quarantine Drill (EICAR Test)

#### Context:
Verify that malicious or contaminated files are strictly intercepted by the ClamAV scanning daemon and never reach the persistent storage bucket.

#### Click-by-Click Instructions:
1. Create a local test file named `eicar-threat.txt` containing the standard EICAR test string:
   ```text
   X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
   ```
2. In the Client Portal Deliverables tab, click **"Upload Deliverable File"**.
3. Select `eicar-threat.txt` and submit.
4. **Observe Security Interception:**
   - DevTools Network tab: `POST /api/v1/portal/.../files` returns HTTP **`422 Unprocessable Entity`** (or **`400 Bad Request`**).
   - Response payload:
     ```json
     {"error": "Malware detected", "virus": "Eicar-Test-Signature", "quarantined": true}
     ```
   - **UI Security Modal:** A prominent red warning modal appears:
     *"File upload rejected: Malware signature detected (Eicar-Test-Signature). The file was quarantined and discarded."*
   - Refresh the page: verify `eicar-threat.txt` does **NOT** appear in the file table. MinIO storage remains unpolluted.

---

### Test Suite 3.7: Product Customer Account Portal (`/account/...`)

#### Context:
Per **Q011, Q030, Q032, and Q090**, product customers (e.g., POS, SaaS, Tailor Management subscribers) access their self-service control plane at `/account/[accountOrganizationId]`.

#### Click-by-Click Instructions:
1. In your browser, navigate to: `https://stackandscale.org/account/acct-saas-prod` *(or your test product account ID)*.
2. **Audit Product Account Subsystems:**
   - **Home / Products Overview:** Displays active subscribed software products (e.g. `Stack & Scale Retail POS v2.4`, `Tailor Management Cloud`).
   - **Billing & Subscriptions (Q012/Q013):** Displays subscription cycle, license seats (5 Active / 10 Total), and next billing renewal date.
   - **Support & Ticket Desk (Q038):** Click **"+ Open Support Ticket"**, enter subject `POS Barcode Scanner Configuration`, and verify ticket is registered with priority `Normal`.
   - **Preferences & Seat Management:** Verify team user invites and API key generation tabs.

---

## 4. Handoff Protocol to Mehran Khan (Member 4)

Copy and send this handoff block to **Mehran Khan**:

```text
================================================================================
QA HANDOFF: HANZALA KHAN (M3) -> MEHRAN KHAN (M4)
================================================================================
Timestamp: [Record UTC Date & Time]
Client Portal Organization: org-acme-prod
Contract Signatory: Alex Mercer (Executed at [Record Time])
Invoice Issued: INV-2026-001 ($15,000 USD — Paid)
Storage Clean Upload: architecture-blueprint.pdf (MinIO Verified)
Storage Malware Test: Eicar-Test-Signature (Quarantined by ClamAV)
Product Account Tested: acct-saas-prod (Active POS Subscriptions)

Instructions for Mehran Khan:
Please log into the VPS production host (ubuntu@vps-5d4dfcb1), inspect Grafana &
Loki for the ClamAV malware intercept event, verify port perimeter blocking,
execute the container self-healing chaos drill, and test database backups.
================================================================================
```

---

## 5. Official Hanzala Khan Sign-Off Sheet

| Test Case | Description | Pass / Fail | Operator Signature | Timestamp |
|---|---|---|---|---|
| **TC-3.1** | Commercial proposal created with 4 milestones ($45,000 USD) | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.2** | Authorized Client Portal loads workspace and navigation tabs | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.3** | Multi-tenant URL tampering rejected with HTTP 403 / 404 | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.4** | Digital agreement signed by Alex Mercer with SHA-256 fingerprint | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.5** | Milestone invoice generated, PDF downloaded, and marked PAID | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.6** | Clean file uploaded to MinIO via ClamAV with green shield badge | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.7** | Presigned S3 download link generates valid, uncorrupted file | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.8** | EICAR malware test intercepted & quarantined (HTTP 422) | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-3.9** | Product Customer Account Portal (`/account/...`) loads subscriptions | [ ] Pass / [ ] Fail | __________________ | _________ |

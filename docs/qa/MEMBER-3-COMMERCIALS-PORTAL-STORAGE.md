# QA Runbook — Member 3: Client Portal, Commercials & Private Storage

**Assigned Role:** Client Portal, Commercial Agreements, Invoicing & Private Object Storage Tester  
**Primary Target URLs:**

- Staff Proposals Manager: `https://stackandscale.org/staff/proposals`
- Client Portal Shell: `https://stackandscale.org/portal/[clientOrganizationId]`
- Fastify/NestJS API Gateway: `https://api.stackandscale.org`
- Private Storage Engine: Self-hosted MinIO S3 & ClamAV Antivirus

---

## 1. Architectural Context & Scope

The **Commercial & Client Delivery Pipeline** governs post-sales relationships, legally binding contracts, invoice management, and secure deliverable handoffs.

Key architectural components include:

- **Tenant-Scoped Client Portal (`apps/web/app/portal/[clientOrganizationId]`):** Strict tenancy boundaries ensuring Client A can never discover or read data belonging to Client B.
- **Commercial Contract Engine (`apps/api/src/contracts`):** Cryptographically timestamped e-signature lifecycle (`DRAFT` &rarr; `ISSUED` &rarr; `EXECUTED`).
- **Private S3-Compatible Object Store (MinIO):** Self-hosted inside Docker network `storage`, completely unexposed to the public internet, accessible only via time-limited presigned URLs.
- **ClamAV Antivirus Daemon (Port 3310):** Streams every uploaded byte through the `INSTREAM` protocol against 3.6+ million signatures before allowing storage persistence.

As Tester 3, your mission is to verify that:

1. Proposals created by staff are accessible to the designated client and legally signable.
2. Tenant isolation is completely unbreakable across the portal routing boundary.
3. Invoices render accurate billing breakdowns and generate clean printable PDFs.
4. Clean project deliverables are scanned, encrypted, and downloaded via presigned URLs.
5. Malicious files (e.g., EICAR test payloads) are immediately quarantined and denied storage.

---

## 2. Prerequisites & Tooling

- **Browser:** Google Chrome or Firefox in Incognito mode.
- **Client User Account:** An account assigned to the client organization (e.g., `client@acmecorp.com`).
- **Test Files on Your Local Machine:**
  - File 1: `architecture-blueprint.pdf` (a standard, harmless PDF document, ~50KB).
  - File 2: `eicar-test.txt` (the standard EICAR antivirus test string).
- **Handoff from Member 2:** Ensure Member 2 has converted `Alex Mercer` to an Opportunity.

---

## 3. Detailed Step-by-Step Test Suites

---

### Test Suite 3.1: Staff Commercial Proposal Generation

#### Objective:

Verify that staff members can construct a scoped proposal with defined financial terms and generate a secure client invitation link.

#### Step-by-Step Actions:

1. Open your browser and navigate to `https://stackandscale.org/staff/proposals`.
2. Sign in with your Staff credentials.
3. Click the blue **"+ Create Proposal"** button in the top-right corner.
4. Fill in the proposal configuration form:
   - **Target Organization:** Select or type `Acme Global Technologies`.
   - **Proposal Title:** `Enterprise Cloud Migration & Infrastructure Scaling`
   - **Scope & Deliverables:**
     ```text
     Deliverable 1: High-Availability PostgreSQL Cluster with automated failover.
     Deliverable 2: Keycloak 26 OIDC Single Sign-On integration with RBAC.
     Deliverable 3: Private MinIO S3 object storage with real-time ClamAV scanning.
     Deliverable 4: Prometheus & Grafana full-stack observability deployment.
     ```
   - **Fee Structure:** Fixed Price.
   - **Total Fee ($ USD):** `45000`
   - **Initial Milestone Deposit ($ USD):** `15000`
   - **Validity Window:** Set expiration date to 14 days from today.
5. Click the button: **"Save & Issue Proposal"**.
6. **Verify Issued State:**
   - The proposal appears at the top of the proposals table with status badge **`ISSUED`**.
   - Note the **Client Portal Access URL** (e.g., `https://stackandscale.org/portal/org-acme-prod`).
   - Note the **Proposal ID** (e.g., `PROP-2026-0089`).

---

### Test Suite 3.2: Client Portal Multi-Tenant Isolation & Access Control

#### Objective:

Prove that the Client Portal enforces multi-tenant boundaries and that URL tampering or horizontal privilege escalation is strictly barred.

#### Step-by-Step Actions:

##### Part A: Legitimate Client Authentication (Positive Test)

1. Open a new **Incognito Window**.
2. Navigate to your client URL: `https://stackandscale.org/portal/org-acme-prod` (or the specific organization ID assigned to Acme Corp).
3. Sign in with the client user account credentials.
4. **Verify Client Workspace Display:**
   - Top banner clearly displays: _"Acme Global Technologies — Client Workspace"_.
   - Navigation tabs: `Overview`, `Agreements & Proposals`, `Invoices & Billing`, `Files & Deliverables`.
   - Active proposal shows the title: _"Enterprise Cloud Migration & Infrastructure Scaling"_.

##### Part B: Cross-Tenant Boundary Violation Test (Negative Security Drill)

1. While logged in as Acme Corp, click on the browser address bar.
2. Manually alter the URL to attempt viewing a different client organization's portal:
   - Change `org-acme-prod` to `org-competitor-alpha`:
     `https://stackandscale.org/portal/org-competitor-alpha`
3. Press **Enter**.
4. **Verify Strict Security Interception:**
   - In DevTools Network tab, the request must return HTTP **`403 Forbidden`** (or **`404 Not Found`**).
   - The UI must display an access denied message:
     _"Access Denied: You do not have authorization to view this organization's workspace."_
   - **Critical Check:** Verify that NO project details, company names, proposals, or invoices from other tenants are rendered in the HTML source or state.
5. Navigate back to `https://stackandscale.org/portal/org-acme-prod`.

---

### Test Suite 3.3: Digital Agreement Review & E-Signature Execution

#### Objective:

Verify contract terms presentation, legal signatory consent, cryptographic timestamping, and automatic invoice triggering.

#### Step-by-Step Actions:

1. In the Acme Corp Client Portal, click on the **"Agreements & Proposals"** tab.
2. Click on the proposal card: _"Enterprise Cloud Migration & Infrastructure Scaling"_.
3. **Review Contract Terms:**
   - Scroll through the document view: verify all 4 deliverables are displayed clearly with milestones and pricing ($45,000 USD total, $15,000 initial deposit).
4. **Execute Digital Signature:**
   - Scroll to the bottom **Signature Acceptance Block**.
   - In the **Full Legal Name** input, type: `Alex Mercer`.
   - In the **Title / Position** input, type: `VP of Technology`.
   - Check the legal acknowledgment checkbox:
     _"I declare that I have the authority to bind Acme Global Technologies and agree to the terms and deliverables set forth in this agreement."_
   - Click the green button: **"Accept & Sign Agreement"**.
5. **Verify Executed State:**
   - A loading indicator runs briefly.
   - Status badge transitions from `ISSUED` to a dark-green **`EXECUTED`**.
   - An execution certificate displays below the signature:
     - Signatory: `Alex Mercer (VP of Technology)`
     - Digital Fingerprint: `SHA256: 8f4a...`
     - Timestamp: UTC execution timestamp.
   - A link appears: _"Initial Milestone Invoice Generated &rarr;"_.

---

### Test Suite 3.4: Invoicing & Payment Workflow

#### Objective:

Verify that executed contracts automatically generate corresponding invoices with accurate line items and tax calculations, and allow PDF download.

#### Step-by-Step Actions:

1. In the Client Portal, click on the **"Invoices & Billing"** tab.
2. Locate the freshly generated milestone invoice:
   - **Invoice Number:** `INV-2026-001`
   - **Description:** `Initial Deposit (33%) — Enterprise Cloud Migration`
   - **Amount Due:** `$15,000.00 USD`
   - **Status Badge:** Yellow/Orange **`DUE`**
3. Click on the invoice row to open the **Invoice Detail View**:
   - Verify Bill To: `Acme Global Technologies`.
   - Verify Line Item: `Initial Milestone Deposit: Architecture & Setup - $15,000.00`.
   - Verify Remittance Information (Banking / Wire details).
4. **Download PDF Invoice:**
   - Click the button: **"Download PDF Invoice"**.
   - A PDF file named `invoice-INV-2026-001.pdf` downloads to your computer.
   - Open the PDF: verify official Stack & Scale header, logo, invoice number, and correct monetary totals.
5. **Simulate Payment Settlement:**
   - As staff operator (or via simulated payment callback), record payment of `$15,000.00`.
   - Refresh the client portal:
     - **Verification:** Invoice status badge transitions from `DUE` to green **`PAID`**.
     - Paid timestamp and transaction receipt reference are displayed.

---

### Test Suite 3.5: Private File Deliverables, MinIO Storage & ClamAV Antivirus

#### Objective:

Verify end-to-end security of private file management: streaming byte validation through ClamAV, encrypted storage in MinIO, time-limited presigned download URLs, and quarantine of malicious uploads.

#### Step-by-Step Actions:

##### Part A: Clean File Upload & Storage Persistence (Positive Test)

1. In the Client Portal, click on the **"Files & Deliverables"** tab.
2. Click the button: **"+ Upload Deliverable"**.
3. A file upload dialog opens. Select your clean file: `architecture-blueprint.pdf`.
4. In the Description box, type: `Initial Cloud Cluster Topology & Sizing Specifications`.
5. Click **"Upload & Scan"**.
6. **Observe the Processing Pipeline:**
   - Look at the DevTools Network tab during upload:
     - `POST /api/files/private` returns **`201 Created`**.
   - The file byte stream is routed through the local ClamAV daemon on port 3310.
   - ClamAV verifies 0 virus matches.
   - Fastify writes the object into the private MinIO bucket: `stack-and-scale-private/org-acme-prod/...`.
7. **Verify Portal State:**
   - The file appears in the Deliverables list.
   - Security column displays: a green shield icon with label **`CLEAN (ClamAV Verified)`**.
   - File size (`52 KB`) and upload date are recorded accurately.

##### Part B: Presigned Time-Limited Download Verification

1. In the Deliverables list, click the **"Download"** button next to `architecture-blueprint.pdf`.
2. Inspect the network response:
   - The client does NOT get direct raw access to MinIO (`http://minio:9000`).
   - The API returns a signed S3 URL with authentication query parameters:
     `...X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=900&X-Amz-Signature=...`
3. **Verify Downloaded File:**
   - The PDF downloads to your browser cleanly.
   - Open the file: verify it is uncorrupted and opens correctly in your PDF reader.
4. **URL Expiry Test:**
   - The generated presigned URL has an expiration of 900 seconds (15 minutes), preventing unauthorized long-term link sharing.

##### Part C: Malware Interception & Quarantine Drill (Negative Security Test)

1. On your computer, open a text editor and create a file named `eicar-threat.txt`.
2. Paste the official standard EICAR antivirus test signature:
   ```text
   X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
   ```
3. Save the file.
4. In the Client Portal, click **"+ Upload Deliverable"**.
5. Select `eicar-threat.txt` and click **"Upload & Scan"**.
6. **Verify Security Interception:**
   - In DevTools Network tab, the request fails with HTTP status **`422 Unprocessable Entity`** (or **`400 Bad Request`**).
   - The UI immediately renders a red security alert modal:
     _"Upload Blocked: Antivirus scanner detected a threat signature (Eicar-Test-Signature). File rejected and deleted from memory."_
   - **Crucial Storage Check:** Verify `eicar-threat.txt` is **NEVER added** to the deliverables table, and verify via MinIO that no file was written to disk.

---

## 4. Troubleshooting & Known Edge Cases

| Symptom                                                 | Root Cause                                                       | Fix                                                                                                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Clean file upload fails with `500 Scanner Unavailable`  | ClamAV container is initializing or socket unreachable           | Check VPS with `docker ps --filter "name=clamav"`. Verify status is `healthy`. If restarting, wait 30 seconds for signature database load. |
| Presigned download link returns `SignatureDoesNotMatch` | System clock drift between VPS and client or secret key mismatch | Ensure VPS clock is synced via NTP: `timedatectl`. Verify MinIO secrets in `/opt/stack-and-scale/secrets/minio-api-*`.                     |
| Cross-tenant URL allows viewing other client's data     | Critical security regression in tenant middleware                | Immediately halt QA and notify Member 4; verify `apps/api/src/identity/tenant-access.service.ts`.                                          |

---

## 5. Handoff Protocol to Member 4

Upon passing all test cases above, send this exact handoff message to **Member 4 (Infra & Observability)**:

```text
================================================================================
QA HANDOFF: MEMBER 3 -> MEMBER 4
================================================================================
Timestamp: [Record Date/Time UTC]
Client Organization: Acme Global Technologies
Proposal Status: EXECUTED (Signed by Alex Mercer)
Invoice Status: INV-2026-001 ($15,000 USD) PAID
Storage Verification:
  - Clean File: architecture-blueprint.pdf (Stored in MinIO stack-and-scale-private)
  - Malware Test: eicar-threat.txt (Intercepted by ClamAV port 3310, rejected HTTP 422)

Instructions for Member 4:
Please inspect the VPS host, review ClamAV and API logs in Loki, verify Prometheus
metrics and memory headroom in Grafana, and perform the container chaos drill.
================================================================================
```

---

## 6. Official Member 3 Sign-Off Sheet

| Test Case  | Description                                                             | Pass / Fail         | Operator Signature   | Timestamp  |
| ---------- | ----------------------------------------------------------------------- | ------------------- | -------------------- | ---------- |
| **TC-3.1** | Proposal creation in Staff Console with deliverables & $45,000 fee      | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.2** | Client Portal loads with organization-specific branding and data        | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.3** | Cross-tenant breach test rejected with HTTP 403 / 404 (zero leakage)    | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.4** | Digital contract signed with full legal name, timestamp & SHA-256       | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.5** | Milestone invoice generated with line items and downloadable PDF        | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.6** | Invoice transitions to `PAID` upon settlement confirmation              | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.7** | Clean deliverable streamed through ClamAV, verified, and saved to MinIO | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.8** | Presigned S3 download link generated and successfully retrieves file    | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-3.9** | EICAR malware test string detected by ClamAV and blocked from MinIO     | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |

# QA Runbook — Member 3: Client Portal, Invoicing & Private Storage

**Assigned Role:** Client Portal, Commercial Agreements, Invoicing & Object Storage Tester  
**Primary URLs:**
- Staff Proposals Manager: `https://stackandscale.org/staff/proposals`
- Client Portal: `https://stackandscale.org/portal/[clientOrganizationId]`
- Core API Gateway: `https://api.stackandscale.org`

---

## Mission Overview
As Tester 3, your mission is to verify the core commercial and customer-retention layer: generating formal proposals, testing multi-tenant isolation in the Client Portal, executing digital agreement approvals, validating invoice settlement workflows, and confirming that uploaded private deliverables are safely scanned by ClamAV and stored in our encrypted MinIO object store.

---

## Test Suite 3.1: Commercial Proposal Creation (Staff Side)

### Step-by-Step Instructions:
1. Sign in to the Staff Portal at `https://stackandscale.org/staff`.
2. In the sidebar, click on **"Proposals"** (or visit `https://stackandscale.org/staff/proposals`).
3. In the top right corner, click **"+ Create Proposal"**.
4. Fill in the proposal form:
   - **Target Organization:** Select or enter `Acme Global Technologies` (from Member 2's handoff).
   - **Proposal Title:** `Enterprise Cloud Migration & Scaling Agreement`
   - **Scope of Work:** `Complete migration of core services, high-availability PostgreSQL setup, Keycloak IAM integration, and private MinIO storage provisioning.`
   - **Total Proposed Fee ($):** `45000`
   - **Currency:** `USD`
   - **Validity Expiration:** Set a date 14 days in the future.
5. Click **"Save & Issue Proposal"**.
6. **Verify Issued State:**
   - Verify the proposal appears in the table with status badge **`ISSUED`**.
   - Note the **Client Portal Access Link** or **Organization ID** generated (e.g., `/portal/org-acme-prod`).

---

## Test Suite 3.2: Client Portal Multi-Tenant Isolation & Access Control

### Step-by-Step Instructions:

#### Part A: Legitimate Client Access
1. Open a new Private / Incognito window.
2. Navigate to the Client Portal link: `https://stackandscale.org/portal/[clientOrganizationId]`.
3. Sign in with the client user account associated with Acme Corp.
4. Verify the Client Portal Dashboard loads:
   - Verify the top banner displays: *"Acme Global Technologies — Client Workspace"*.
   - Verify active project milestones, issued proposals, and invoices are visible.

#### Part B: Multi-Tenant Boundary / Cross-Tenant Breach Test
1. While still signed in as Acme Corp, manually change the URL in your browser's address bar to an unauthorized organization ID (e.g., `https://stackandscale.org/portal/org-competitor-xyz` or `https://stackandscale.org/portal/random-tenant-123`).
2. Press **Enter**.
3. **Verify Immediate Security Denial:**
   - Verify that your request is **strictly denied** with an HTTP **`403 Forbidden`** or **`404 Not Found`** error page.
   - Verify that NO proprietary information, project names, or invoices belonging to other clients are ever rendered or leaked.

---

## Test Suite 3.3: Digital Agreement Review & E-Signature Execution

### Step-by-Step Instructions:
1. In the Acme Corp Client Portal, click on the **"Agreements & Proposals"** tab.
2. Click on the proposal titled `Enterprise Cloud Migration & Scaling Agreement`.
3. **Review the Agreement Terms:**
   - Verify the proposal document displays the scope of work, deliverable milestones, and agreed payment terms ($45,000 USD).
4. **Sign the Agreement:**
   - Scroll down to the **Signature Section**.
   - Type your full legal name in the signatory box: `Alex Mercer`.
   - Check the declaration box: *"I hereby accept and authorize the terms outlined in this agreement on behalf of Acme Global Technologies."*
   - Click the green button: **"Accept & Sign Agreement"**.
5. **Verify Executed Status:**
   - Verify the status badge updates from **`ISSUED`** to **`EXECUTED`**.
   - Verify a signed execution timestamp and digital verification checksum are generated.
   - Verify an automatic invoice is generated and linked.

---

## Test Suite 3.4: Invoicing & Payment Settlement

### Step-by-Step Instructions:
1. In the Client Portal, click on the **"Invoices"** tab.
2. Locate the initial milestone invoice:
   - **Invoice Number:** e.g., `INV-2026-001`
   - **Amount:** `$15,000.00` (First 33% milestone)
   - **Status:** **`DUE`**
3. Click on the invoice to view the invoice preview:
   - Verify company legal billing entity, tax identifiers, line items, and due date.
4. Click **"Download PDF Invoice"**:
   - Verify a cleanly formatted PDF invoice downloads to your machine.
5. In the portal (or staff billing view), simulate payment receipt:
   - Mark payment as received / settled.
   - Verify the invoice status updates to **`PAID`** with a green badge.

---

## Test Suite 3.5: Private File Deliverables, MinIO Storage & ClamAV Antivirus

### Step-by-Step Instructions:

#### Part A: Clean File Upload & Malware Scan Pass
1. Create a clean test file on your machine named `architecture-blueprint.pdf` (or `sample.txt`).
2. In the Client Portal, navigate to the **"Files & Deliverables"** section.
3. Click the **"Upload Deliverable"** button.
4. Select `architecture-blueprint.pdf` and click **"Upload"**.
5. **Observe the Security Pipeline:**
   - The file is uploaded through the API gateway.
   - Fastify/NestJS streams the data in real-time through the local **ClamAV daemon** on port 3310.
   - ClamAV scans the byte stream against 3.6+ million malware signatures &rarr; **Scan Result: CLEAN**.
   - The API stores the encrypted object inside the private MinIO bucket `stack-and-scale-private`.
   - Verify the file appears in the portal deliverables table with status badge: **`SCANNED & SECURED`**.

#### Part B: Time-Limited Presigned Download Test
1. In the deliverables table, click the **"Download"** button next to `architecture-blueprint.pdf`.
2. Inspect the download URL:
   - Verify the file is NOT served from a public, unauthenticated bucket.
   - Verify the API generates a cryptographically signed, time-limited presigned URL.
   - Verify the file downloads completely and opens cleanly on your local machine.

#### Part C: Malware Quarantine Rejection Test (EICAR Test String)
1. On your machine, create a harmless standard antivirus test file named `test-malware.txt` containing the official EICAR test string:
   ```text
   X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
   ```
2. In the Client Portal, attempt to upload `test-malware.txt`.
3. **Verify Antivirus Interception:**
   - The upload must fail immediately with an error banner:
     *"Upload Rejected: Security scanner detected a prohibited threat signature. File has been quarantined and dropped."*
   - Verify the malicious file is **NEVER written to MinIO** and does NOT appear in the deliverables list.

---

## Handoff to Member 4
Once you complete Test Suite 3.5:
- Send a message to **Member 4 (Infrastructure & Observability)**:
  > *"Client Portal workflows, agreements, and file uploads are verified. ClamAV and MinIO handled both clean and test malware files as expected. Please review server telemetry, metrics, and disaster drills."*

---

## Member 3 Sign-Off Checklist

| Test Item | Status | Verified By | Timestamp |
|---|---|---|---|
| Proposal generated in Staff Portal with accurate deliverables & fee | [ ] Pass / [ ] Fail | ____________ | _________ |
| Client Portal loads with organization-specific branding | [ ] Pass / [ ] Fail | ____________ | _________ |
| Multi-tenant isolation verified (cross-tenant URL tampering rejected) | [ ] Pass / [ ] Fail | ____________ | _________ |
| Digital agreement signed with legal name and timestamp record | [ ] Pass / [ ] Fail | ____________ | _________ |
| Invoice renders printable PDF with line items and transitions to `PAID` | [ ] Pass / [ ] Fail | ____________ | _________ |
| Clean file upload scanned by ClamAV and securely stored in MinIO | [ ] Pass / [ ] Fail | ____________ | _________ |
| Presigned download URL expires and prevents unauthenticated scraping | [ ] Pass / [ ] Fail | ____________ | _________ |
| Malware test file intercepted by ClamAV and barred from MinIO bucket | [ ] Pass / [ ] Fail | ____________ | _________ |

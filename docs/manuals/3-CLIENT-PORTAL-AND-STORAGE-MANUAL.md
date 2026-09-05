# User Manual 3: Client Success, Multi-Tenant Portals & Secure Storage

> **Assigned Role:** Client Success & Secure Storage Lead  
> **Primary Operator:** Hanzala Khan (`hanzalakhan`)  
> **Primary Surfaces:** `https://stackandscale.org/portal/...` & `https://stackandscale.org/account/...`  
> **Target Audience:** Client Delivery Leads, Account Managers, Solutions Architects

---

## 1. Role & Operational Scope

As the **Client Success & Storage Lead**, you ensure seamless onboarding, milestone execution, and secure asset exchange for active clients:
- Verifying strict multi-tenant boundary isolation between client organizations.
- Overseeing proposal approval and binding digital e-signatures.
- Tracking contract milestone progression and deliverable invoicing.
- Operating the **MinIO S3 Encrypted File Vault** with real-time **ClamAV malware scanning**.
- Provisioning product customer accounts, seats, and subscription licensing.

---

## 2. Credentials & Endpoints

### Staff Access Credentials
- **Identity Console:** `https://identity.stackandscale.org`
- **Username:** `hanzalakhan`
- **Email:** `hanzala.khan@stackandscale.org`
- **Password:** `StackScale2026!#Hanzala`
- **Roles:** `manager`, `member`, `mfa_verified`

### Core Tenant Surfaces
- **Client Portal Route:** `https://stackandscale.org/portal/[clientOrganizationId]`
- **Customer Account Route:** `https://stackandscale.org/account/[accountOrganizationId]`
- **Private S3 Storage Bucket:** `stack-and-scale-private` (Encrypted internal storage)

---

## 3. Step-by-Step Client Delivery Playbook

### 3.1 Onboarding a Client to their Dedicated Portal
1. Once Talha Shams publishes a commercial proposal, receive the unique `clientOrganizationId` (e.g. `org-acme-corp`).
2. Open the tenant portal:
   ```text
   https://stackandscale.org/portal/org-acme-corp
   ```
3. **Tenant Boundary Verification:**
   - Attempting to access an invalid or alternate organization ID immediately returns `404 Not Found` or `403 Forbidden`. Cross-tenant data leaks are strictly prevented by row-level isolation and API tenant guards.

---

### 3.2 Executing Digital E-Signatures
1. In the **Proposals & Agreements** tab of the Client Portal, open the pending proposal.
2. Review the agreement terms, pricing line items, and SLA guarantees with the client.
3. In the digital acceptance box:
   - Client types their legal name: `Sarah Jenkins`
   - Client enters their corporate title: `VP of Engineering, FinTech Global Systems`
   - Clicks **Approve & Sign Agreement**.
4. The system cryptographically stamps the record in PostgreSQL `portal.signatures` with:
   - UTC execution timestamp.
   - Client IP and User-Agent correlation.
   - SHA-256 proposal snapshot digest.
5. The contract status immediately changes to **Signed & Active**.

---

### 3.3 Invoicing & PDF Receipts
1. Switch to the **Invoices & Billing** tab.
2. Invoices are automatically generated upon milestone completion (e.g. `INV-2026-001` for `$15,000 USD`).
3. Click **Download PDF Invoice** to generate a branded invoice document.

---

### 3.4 File Vaulting & ClamAV Malware Quarantine
The Client Portal provides a private S3 vault for exchanging confidential architectural diagrams, database dumps, and source archives:

#### Uploading a Clean Deliverable:
1. In the Client Portal, switch to **Deliverables & Files**.
2. Click **Upload File** and select a legitimate PDF or archive (e.g. `system-architecture-spec.pdf`).
3. **Processing:**
   - The file is streamed to MinIO (`stack-and-scale-private`).
   - The **ClamAV daemon** intercepts the byte stream via chunked scanning.
   - If clean, the file is tagged `CLEAN`, hashed with SHA-256, and displayed in the downloads list.

#### ClamAV Malware Intercept Drill (Safety Verification):
To prove that malware cannot be stored on Stack & Scale:
1. Attempt to upload the standardized EICAR antivirus test file (`eicar.com.txt`).
2. ClamAV instantly detects the malware signature:
   - The upload is terminated immediately.
   - The file is quarantined and permanently purged from S3.
   - An alert `SECURITY: Malware detected and quarantined` is emitted to Loki logs.
   - The portal UI displays: `"File upload rejected: Antivirus policy violation."`

---

### 3.5 Managing Product Customer Accounts (`/account/[id]`)
For clients subscribing to software-as-a-service (SaaS) or edge deployment products:
1. Navigate to `https://stackandscale.org/account/[accountOrganizationId]`.
2. **Subscriptions Tab:** View active plan status, renewal dates, and billing cycle.
3. **Seat Management:** Invite developers, revoke credentials, and assign administrative roles.
4. **API Keys:** Issue scoped API tokens with specific read/write grants.

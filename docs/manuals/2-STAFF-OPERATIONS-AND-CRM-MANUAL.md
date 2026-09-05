# User Manual 2: Staff Operations, Identity SSO & Commercial CRM

> **Assigned Role:** Staff Operations & CRM Lead  
> **Primary Operator:** Talha Shams (`talhashams`)  
> **Primary Surfaces:** `https://stackandscale.org/staff` & `https://identity.stackandscale.org`  
> **Target Audience:** Account Executives, Sales Engineers, Operations Managers

---

## 1. Role & Operational Scope

As the **Staff Operations & CRM Lead**, you own the commercial intake pipeline, client qualification, and deal structuring for Stack & Scale:
- Single Sign-On (SSO) authentication via Keycloak OIDC.
- Triage and qualification of inbound prospect submissions in the **Lead 360 Inbox**.
- Logging discovery call notes, assigning follow-up tasks, and tracking sales milestones.
- Converting qualified leads into high-value **Commercial Opportunities** ($10k–$100k+).
- Generating structured, line-itemed **Client Proposals** and publishing them for client portal acceptance.

---

## 2. Credentials & Access

### Keycloak Staff IAM
- **Login URL:** `https://stackandscale.org/signin` or `https://identity.stackandscale.org`
- **Username:** `talhashams`
- **Email:** `talha.shams@stackandscale.org`
- **Password:** `StackScale2026!#Talha`
- **Roles:** `manager`, `admin`, `member`, `mfa_verified`

### Staff CRM Workspace Endpoints
- **Main Dashboard:** `https://stackandscale.org/staff`
- **Leads Pipeline:** `https://stackandscale.org/staff/leads`
- **Proposals Shell:** `https://stackandscale.org/staff/proposals`
- **Operations Search:** `https://stackandscale.org/staff/search`
- **Notification Center:** `https://stackandscale.org/staff/notifications`

---

## 3. Step-by-Step CRM Operator Guide

### 3.1 Authenticating via Keycloak Single Sign-On
1. Navigate to **`https://stackandscale.org/staff`**.
2. If you see the **Sign-in required** prompt, click **Continue to sign in**.
3. You will be redirected to the secure Keycloak authentication gateway:
   - Enter Username: `talhashams`
   - Enter Password: `StackScale2026!#Talha`
4. Click **Sign In**.
5. The system performs the cryptographic OIDC token exchange, establishes your active session (`ss_session`), and lands you directly on the **Leads Pipeline** (`/staff/leads`).

---

### 3.2 Triaging Inbound Leads (Lead 360 Drawer)
1. In the **Leads Pipeline** (`/staff/leads`), review the incoming lead cards.
2. Click on a prospect's card (e.g. `Sarah Jenkins — FinTech Global Systems`) to open the **Lead 360 Drawer** on the right.
3. **Updating Lifecycle Status:**
   - **`new`** &rarr; Newly arrived form submission.
   - **`contacted`** &rarr; Initial outreach email/call sent.
   - **`qualified`** &rarr; Budget, authority, need, and timeline confirmed.
4. **Adding Discovery Notes:**
   - In the drawer, click **Add Note**.
   - Type summary details from your qualification call:
     > *"Discovery call completed with VP of Engineering. Architecture requires PostgreSQL schema segregation, Keycloak RBAC, and ClamAV S3 file vaulting. Target go-live Q4."*
   - Click **Save Note**.
5. **Assigning Action Tasks:**
   - Click **Add Task** (e.g. `Deliver custom architecture proposal by Tuesday 5PM`).
   - Set due date and assign operator.

---

### 3.3 Converting a Lead to a Commercial Opportunity
When a prospect is ready for commercial negotiation:
1. Inside the **Lead 360 Drawer**, click **Convert to Opportunity**.
2. Fill out the conversion parameters:
   - **Opportunity Title:** `FinTech Global - Cloud Infrastructure Modernization`
   - **Estimated Deal Value:** `$45,000 USD`
   - **Target Close Date:** Select anticipated contract signing date.
3. Click **Confirm Conversion**.
4. The system automatically creates the opportunity in `platform.opportunities` and associates it with the internal organization workspace.

---

### 3.4 Creating and Publishing Proposals with Line Items
1. Navigate to **`/staff/proposals`**.
2. Click **New Proposal**.
3. **General Information:**
   - **Client Organization:** `FinTech Global Systems`
   - **Proposal Scope:** `High-Throughput Enterprise Backend Architecture & Cloudflare Hardening`
4. **Line-Item Structuring:**
   Click **Add Line Item** for each contractual deliverable:
   - *Line Item 1:* `Cloud Infrastructure Architecture & Core API Gateway Setup` — `$20,000`
   - *Line Item 2:* `Database Schema Partitioning & Outbox Messaging Engine` — `$15,000`
   - *Line Item 3:* `Keycloak IAM Federation & ClamAV Secure S3 Storage Vault` — `$10,000`
   - **Total Value:** `$45,000 USD`
5. Click **Publish Proposal**.
6. The system provisions the unique client portal organization ID (e.g. `org-fintech-global`) and issues an encrypted URL for Hanzala Khan and the client to review and sign.

---

## 4. Operational Search & Notifications

### Operations Search (`/staff/search`)
Press `Cmd+K` or navigate to `/staff/search` to query across all commercial entities:
- Search by client organization name, lead contact email, proposal reference, or ticket ID.

### Notification Center (`/staff/notifications`)
- Real-time alerts for lead submissions, proposal acceptances, and system warnings.
- Mark notifications as read or configure alert categories in **Notification Preferences**.

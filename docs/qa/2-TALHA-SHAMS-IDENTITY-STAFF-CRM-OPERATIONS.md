# QA Runbook — Talha Shams: Identity, Staff CRM & Operations Console

**Assigned Engineer:** Talha Shams  
**Assigned Roles & Boundaries:** Keycloak IAM Gateway, OpenID Connect Authentication, Role-Based Access Control, Staff CRM Lead Inbox, Lead 360 Timeline, Opportunity Pipeline, Internal Operations & Knowledge Base  
**Architecture Grounding:** [Blueprint §2.1 & §2.2](file:///media/saad/Data/stack_and_scale/STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md), [Q014, Q017](file:///media/saad/Data/stack_and_scale/question-decisions/014-crm-foundation.md), [Q028, Q035–Q040](file:///media/saad/Data/stack_and_scale/question-decisions/028-authentication-capabilities.md), [Q054–Q060](file:///media/saad/Data/stack_and_scale/question-decisions/054-transactional-email.md), [Q083, Q091, Q092](file:///media/saad/Data/stack_and_scale/question-decisions/083-identity-platform.md)  
**Primary Target URLs:**
- Keycloak Identity Gateway: `https://identity.stackandscale.org`
- Staff Portal Shell: `https://stackandscale.org/staff`
- Staff Lead Inbox: `https://stackandscale.org/staff/leads`
- Staff Operations Dashboard: `https://stackandscale.org/staff/operations`
- Staff Knowledge & SOP Runbooks: `https://stackandscale.org/staff/knowledge`
- Staff Reports & Analytics: `https://stackandscale.org/staff/reports`

---

## 1. Executive Context & System Architecture
Internal operational efficiency and customer relationship management are powered by the **Modular Staff Platform**:
- **Keycloak 26 OIDC Gateway:** Issues cryptographically signed RS256 JWT tokens, evaluated by Fastify/NestJS against the JWKS endpoint.
- **Role-Based Access Control (RBAC):** Strict boundaries separating unauthenticated visitors, standard staff, sales managers, and system administrators.
- **Relational PostgreSQL Data Core:** Houses normalized lead records, chronological timeline audits, customer organizations, and outbox event queues.

As **Talha Shams**, your mission is to verify perimeter authentication, intake the lead submitted by Muhammad Saad Khan, execute the complete CRM sales triage lifecycle, convert the prospect to a commercial opportunity, verify operations queues, and test productivity tools.

---

## 2. Testing Environment & Prerequisites
- **Browser:** Google Chrome or Firefox (in Incognito mode for initial authentication tests).
- **Staff User Account:** Assigned to the `staff-and-scale` Keycloak realm with `staff` and `manager` roles.
- **Handoff from Muhammad Saad Khan:** Ensure you have received the handoff details for `Alex Mercer` (`alex.mercer@acmecorp-testing.com`).

---

## 3. Step-by-Step Execution Suites

---

### Test Suite 2.1: Keycloak OIDC Authentication, Security & Denial

#### Context:
Per **Q028 and Q083**, all internal `/staff` routes are protected by Keycloak OpenID Connect. Unauthenticated or unauthorized requests must be intercepted at the edge.

#### Click-by-Click Instructions:

##### Part A: Anonymous Access Interception (Negative Test)
1. Open a new **Incognito / Private Browsing** window.
2. In address bar, type: `https://stackandscale.org/staff` and press Enter.
3. **Observe Edge Interception:**
   - In DevTools Network tab, the request returns HTTP **`302 Found`**.
   - URL redirects to the Keycloak login gateway:
     `https://identity.stackandscale.org/realms/stack-and-scale/protocol/openid-connect/auth?...`
   - Verify the login card renders the official Stack & Scale brand identity. No internal data is leaked.

##### Part B: Invalid Credentials Handling (Negative Test)
1. In Keycloak login box, enter:
   - **Username or email:** `unauthorized-user@domain.com`
   - **Password:** `InvalidPassword999!`
2. Click **"Sign In"**.
3. **Verification:**
   - Red error alert appears: *"Invalid username or password."*
   - Browser remains on `identity.stackandscale.org` without creating a session.

##### Part C: Authorized Staff Authentication (Positive Test)
1. In Keycloak login box, enter your authorized staff credentials:
   - **Username:** `staff@stackandscale.org` (or your assigned staff user)
   - **Password:** `[Your Staff Password]`
2. Click **"Sign In"**.
3. **Verify Successful Staff Shell Entry:**
   - Browser redirects back to `https://stackandscale.org/staff`.
   - In DevTools &rarr; **Application** &rarr; **Cookies**, verify secure `HttpOnly` session cookie exists.
   - In top-right header, verify your user profile avatar, name, and role badge (`Staff Operations`) are visible.

##### Part D: Session Termination / Sign Out
1. In top-right header, click your user dropdown &rarr; click **"Sign Out"**.
2. Verify session cookie is deleted and you are returned to login or public landing page.
3. Click browser **Back** button: verify protected staff data remains completely inaccessible.
4. Sign back in to proceed with remaining tests.

---

### Test Suite 2.2: Lead Inbox Intake & Lead 360 Slide-Over Drawer

#### Context:
Per **Q014, Q017, and Q091**, inbound inquiries land in a unified triage queue where staff review lead data, attribution tags, and initiate customer contact.

#### Click-by-Click Instructions:

##### Part A: Locating the Inbound Prospect
1. In staff sidebar navigation, click on **"Leads"** (`https://stackandscale.org/staff/leads`).
2. Examine the Leads Table:
   - Columns: `Status`, `Contact Name`, `Company`, `Budget`, `Source`, `Received At`.
3. Locate the lead submitted by Muhammad Saad Khan:
   - **Contact Name:** `Alex Mercer`
   - **Company:** `Acme Global Technologies`
   - **Budget:** `$25,000 – $50,000`
   - **Status Badge:** Blue badge reading **`NEW`**.
   - **Received Timestamp:** Matches the time Muhammad Saad Khan executed Test 1.5.

##### Part B: Lead 360 Slide-Over Drawer
1. Click anywhere on the table row for `Alex Mercer`.
2. **Verify Drawer Presentation:**
   - Slide-over panel smoothly animates from the right edge.
   - Header shows: `Alex Mercer — Acme Global Technologies`.
   - Metadata section displays:
     - Email: `alex.mercer@acmecorp-testing.com` (clickable `mailto:` link).
     - Attribution: `Source: web | Form: contact_page`.
     - Inbound Message: Verbatim text entered during Test 1.5.

##### Part C: Lifecycle Stage Transitions (Q092)
1. In the drawer header, click the **"Lead Status"** dropdown (currently `NEW`).
2. Select **`CONTACTED`**.
   - Status badge turns orange **`CONTACTED`**.
   - Success toast appears: *"Lead status updated to Contacted."*
   - In the **Activity Timeline** below, an audit entry appears:
     *"Status changed from NEW to CONTACTED by [Your Name] just now."*
3. Click the dropdown again and select **`QUALIFIED`**.
   - Status badge updates to purple **`QUALIFIED`** and timeline logs the event.

##### Part D: Internal Collaboration Timeline Notes (Q055)
1. In the Lead 360 drawer, click on the **"Notes"** tab.
2. Click into the note textarea and type:
   ```text
   Completed technical discovery call with Alex Mercer.
   Confirmed requirements:
   1. Multi-tenant Client Portal for 20 downstream corporate accounts.
   2. Private S3 file deliverables with antivirus quarantine.
   3. Budget verified: $45,000 USD approved for Phase 1 execution.
   ```
3. Click the blue button: **"Add Note"**.
4. **Verification:**
   - Note is committed to PostgreSQL and renders at the top of the timeline.
   - Displays your author name and UTC timestamp.
   - Refresh the page: verify the note remains intact.

---

### Test Suite 2.3: Converting Lead to Commercial Opportunity

#### Context:
Per **Q014 and Q092**, qualified leads cross the boundary into active sales opportunities with defined deal value, target close date, and pipeline stage.

#### Click-by-Click Instructions:
1. In the Lead 360 drawer for Alex Mercer, click the primary action button: **"Convert to Opportunity"**.
2. In the modal dialog that appears, fill in the commercial terms:
   - **Opportunity Title:** `Acme Corp — Multi-Tenant Cloud Architecture`
   - **Estimated Deal Value ($):** `45000`
   - **Target Close Date:** Select a date 30 days in the future.
   - **Initial Pipeline Stage:** Select **`Proposal / Scoping`**.
   - **Assigned Account Lead:** Select your staff user.
3. Click the green button: **"Confirm Conversion"**.
4. **Observe the Results:**
   - Modal closes.
   - Lead status updates to **`CONVERTED`**.
   - An Opportunity Record ID is generated (e.g., `OPP-2026-0042`).
   - Click the link: *"View Linked Opportunity &rarr;"*.
   - Verify the Opportunity view opens, displaying the `$45,000 USD` pipeline value and `Proposal / Scoping` stage.

---

### Test Suite 2.4: Operations Queue Telemetry & Outbox Monitoring

#### Context:
Per **Q035, Q054, and Q073**, all external communications and event dispatches are processed asynchronously via PostgreSQL transactional outbox workers.

#### Click-by-Click Instructions:
1. In the sidebar, click **"Operations"** (`https://stackandscale.org/staff/operations`).
2. Review the **Engine Health & Queue Dashboard**:
   - **Outbox Worker Status:** Must display **`HEALTHY (Active)`**.
   - **Pending Outbox Messages:** Must show `0` or low single digits.
   - **Failed / Dead-Letter Messages:** Must show `0`.
   - **Email Delivery Service:** Shows connected transactional provider (`Resend API`).
3. Scroll down to **Recent Operations Events**:
   - Verify that your status changes and opportunity conversion events appear in the stream with unique correlation IDs.

---

### Test Suite 2.5: Search, Knowledge Base SOPs & Audio Feedback (SFX)

#### Click-by-Click Instructions:

##### Part A: Staff Operations Search (Q056)
1. In the top staff header, click the search bar or press `/` on your keyboard.
2. Type: `Acme`.
3. **Verification:**
   - Results group immediately into categories:
     - **Leads:** `Alex Mercer (Acme Global Technologies)`
     - **Opportunities:** `Acme Corp — Multi-Tenant Cloud Architecture`
   - Click the Opportunity result: verify direct navigation.

##### Part B: Staff Knowledge Base (Q059)
1. In the sidebar, click **"Knowledge"** (`https://stackandscale.org/staff/knowledge`).
2. Open the article: *"Commercial Boundary & Client Onboarding Runbook"*.
3. Verify formatted markdown sections and bash code snippets.
4. Click the **"Copy"** button on a code snippet: verify checkmark appears and snippet copies to clipboard.

##### Part C: Audio Feedback (SFX) Toggle
1. Locate the **Speaker / Audio Icon** in the sidebar footer.
2. Click to toggle SFX **ON**.
3. Perform an action (e.g., add a one-line test note):
   - Verify a subtle, crisp audio chime plays upon completion.
4. Click the icon again to mute.

---

### Test Suite 2.6: Reporting & CSV Export Data Integrity

#### Click-by-Click Instructions:
1. In the sidebar, click **"Reports"** (`https://stackandscale.org/staff/reports`).
2. Review the live metrics cards:
   - **Total Inbound Leads:** Total count (incremented by Alex Mercer).
   - **Lead-to-Opportunity Conversion Rate:** Accurately calculated percentage.
   - **Active Pipeline Value:** Reflects the `$45,000 USD` deal.
3. Click the button: **"Export Leads to CSV"** (top-right of table).
4. Open the downloaded file `leads-export-YYYY-MM-DD.csv`:
   - Verify column headers: `id, full_name, email, company, budget, status, created_at`.
   - Verify the row for `Alex Mercer` exists with status `CONVERTED`.

---

## 4. Handoff Protocol to Hanzala Khan (Member 3)

Copy and send this handoff block to **Hanzala Khan**:

```text
================================================================================
QA HANDOFF: TALHA SHAMS (M2) -> HANZALA KHAN (M3)
================================================================================
Timestamp: [Record UTC Date & Time]
Client Organization: Acme Global Technologies
Primary Contact: Alex Mercer (alex.mercer@acmecorp-testing.com)
Opportunity ID: [Paste Opportunity ID from Step 2.3]
Target Scope: Enterprise Cloud Migration & Private Storage
Agreed Fee: $45,000 USD

Instructions for Hanzala Khan:
Please open the Proposals Console (https://stackandscale.org/staff/proposals),
generate the formal $45,000 proposal for Acme Global Technologies, and proceed to
test the multi-tenant Client Portal, Product Accounts, and ClamAV/MinIO storage.
================================================================================
```

---

## 5. Official Talha Shams Sign-Off Sheet

| Test Case | Description | Pass / Fail | Operator Signature | Timestamp |
|---|---|---|---|---|
| **TC-2.1** | Unauthenticated `/staff` access intercepted & redirected to Keycloak | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.2** | Keycloak invalid credentials error banner verified | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.3** | Staff login establishes HttpOnly session & loads role-aware shell | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.4** | Inbound lead appears in Lead Inbox with accurate timestamp | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.5** | Lead 360 drawer renders complete contact & attribution metadata | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.6** | Status transition: `NEW` &rarr; `CONTACTED` &rarr; `QUALIFIED` with audit logs | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.7** | Internal timeline note saved to PostgreSQL and displayed | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.8** | Lead converted to Opportunity with deal value `$45,000 USD` | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.9** | Operations queue dashboard indicates healthy outbox workers | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.10** | Unified search returns indexed lead and opportunity records | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.11** | Knowledge Base SOPs render with copy-to-clipboard functionality | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-2.12** | Leads CSV export downloads with complete, uncorrupted data | [ ] Pass / [ ] Fail | __________________ | _________ |

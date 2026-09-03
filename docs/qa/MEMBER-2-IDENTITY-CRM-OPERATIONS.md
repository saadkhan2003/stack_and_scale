# QA Runbook — Member 2: Identity, Staff CRM & Operations Console

**Assigned Role:** Identity Provider, Role-Based Access Control (RBAC) & Staff CRM Operations Tester  
**Primary Target URLs:**

- Keycloak Identity Gateway: `https://identity.stackandscale.org`
- Staff Portal Shell: `https://stackandscale.org/staff`
- Staff Lead Inbox: `https://stackandscale.org/staff/leads`
- Staff Operations Dashboard: `https://stackandscale.org/staff/operations`
- Staff Knowledge & SOP Runbooks: `https://stackandscale.org/staff/knowledge`
- Staff Reports & Exports: `https://stackandscale.org/staff/reports`

---

## 1. Architectural Context & Scope

Security and internal sales velocity depend on the **Identity & Staff Operations Architecture**.

The stack uses:

- **Keycloak (v26)** as the central OpenID Connect (OIDC) identity provider.
- JWT bearer tokens signed by Keycloak, validated by Fastify/NestJS against the JWKS endpoint.
- **Staff Shell**: An authenticated portal utilizing role-based access control (`staff`, `manager`, `admin`).
- **PostgreSQL Relational Storage**: Storing lead records, timeline events, opportunities, internal notes, and transactional outbox queues.

As Tester 2, you are responsible for validating that:

1. **Perimeter Authentication:** Unauthenticated visitors are intercepted before they can view sensitive company pipeline data.
2. **Lead Intake Fidelity:** Inquiries submitted on the website (e.g., by Member 1) are parsed, stored without duplication, and made actionable immediately.
3. **Pipeline Lifecycle:** Leads smoothly transition through commercial stages (`NEW` &rarr; `CONTACTED` &rarr; `QUALIFIED` &rarr; `CONVERTED`), capturing notes and audit stamps.
4. **Operations & Reporting:** Internal operations runbooks, system queue metrics, search, and CSV reporting operate cleanly without data leakage.

---

## 2. Prerequisites & Tooling

- **Browser:** Google Chrome or Firefox.
- **Incognito Window:** Use a clean session to test authentication from a zero-cookie state.
- **DevTools:** `F12` &rarr; **Application** tab (to inspect Cookies: `next-auth.session-token` or `app_session`) and **Console** tab.
- **Handoff from Member 1:** Ensure Member 1 has submitted a lead (e.g., `Alex Mercer`, `alex.mercer@acmecorp-testing.com`).

---

## 3. Detailed Step-by-Step Test Suites

---

### Test Suite 2.1: Keycloak OIDC Authentication, Session & Denial (Journey J06 / V1-07)

#### Objective:

Verify that protected staff routes are completely inaccessible to unauthenticated users and that Keycloak handles authentication, tokens, and role evaluation securely.

#### Step-by-Step Actions:

##### Part A: Anonymous Access Interception (Negative Test)

1. Open a new **Incognito / Private Browsing** window.
2. In the address bar, type: `https://stackandscale.org/staff` and press Enter.
3. **Observe the Redirect Chain:**
   - In DevTools Network tab, note the initial request returns an HTTP **`302 Found`** or **`307 Temporary Redirect`**.
   - The final landing URL must be:
     ```text
     https://identity.stackandscale.org/realms/stack-and-scale/protocol/openid-connect/auth?client_id=...&redirect_uri=https%3A%2F%2Fstackandscale.org%2Fstaff...
     ```
   - **Verification:** The page renders the Keycloak sign-in dialog featuring the Stack & Scale brand mark. No staff data is leaked.

##### Part B: Invalid Credentials Handling (Negative Test)

1. In the Keycloak sign-in box, type:
   - **Username or email:** `fakeuser@stackandscale.org`
   - **Password:** `WrongPassword123!`
2. Click the **"Sign In"** button.
3. **Verification:**
   - Keycloak denies login and displays a prominent red warning banner:
     _"Invalid username or password."_
   - Browser URL stays on `identity.stackandscale.org`.

##### Part C: Successful Staff Authentication (Positive Test)

1. In the Keycloak sign-in box, enter your legitimate staff credentials:
   - **Username:** `staff@stackandscale.org` (or your assigned staff user)
   - **Password:** `[Your Staff Password]`
2. Click **"Sign In"**.
3. **Verify Successful Entry:**
   - The browser redirects back to `https://stackandscale.org/staff`.
   - In DevTools &rarr; **Application** &rarr; **Cookies**, verify a secure session cookie exists with `HttpOnly: true` and `SameSite: Lax/Strict`.
   - Look at the top-right header: your staff user avatar, full name, and role badge (e.g., `Staff Operations`) are visible.

##### Part D: Graceful Sign-Out

1. In the top-right corner, click on your user profile dropdown.
2. Click **"Sign Out"**.
3. **Verification:**
   - Session cookie is cleared from the browser.
   - You are redirected back to the public homepage or login screen.
   - Pressing the browser **Back** button does NOT grant access; protected data remains hidden.
4. Sign back in as Staff to continue the remaining tests.

---

### Test Suite 2.2: Lead Inbox Triage & Lead 360 Drawer (Journey J02 / J03)

#### Objective:

Validate that external inquiries submitted via the website appear immediately in the staff queue and can be triaged through a structured lifecycle.

#### Step-by-Step Actions:

##### Part A: Locating the Inbound Lead

1. In the staff navigation sidebar, click on **"Leads"** (or open `https://stackandscale.org/staff/leads`).
2. Examine the Leads Management Table:
   - Columns: `Status`, `Contact Name`, `Company`, `Budget`, `Source`, `Received At`.
3. Locate the row created by Member 1:
   - **Contact Name:** `Alex Mercer`
   - **Company:** `Acme Global Technologies`
   - **Budget:** `$25,000 – $50,000`
   - **Status Badge:** A prominent blue badge reading **`NEW`**.
   - **Verification:** The submission timestamp reflects the exact time Member 1 ran Test 1.5.

##### Part B: Lead 360 Slide-Over Drawer

1. Click anywhere on the table row for **`Alex Mercer`**.
2. **Verify Slide-Over Drawer Opens:**
   - A detailed slide-over panel smoothly animates from the right edge.
   - Header shows: `Alex Mercer — Acme Global Technologies`.
   - Contact metadata displays:
     - Work Email: `alex.mercer@acmecorp-testing.com` (with a clickable `mailto:` link).
     - Attribution: `Source: web | Form: contact_page`.
     - Inbound Message: Confirm the exact text typed by Member 1 is rendered verbatim.

##### Part C: Status Lifecycle Transitions

1. Locate the **"Lead Status"** dropdown selector in the drawer header.
2. Click the dropdown (currently showing `NEW`) and select **`CONTACTED`**.
3. **Verify Immediate Update:**
   - Status badge changes to an orange **`CONTACTED`**.
   - A success toast appears: _"Lead status updated to Contacted."_
   - In the drawer's **Activity Timeline**, a new event is logged:
     _"Status changed from NEW to CONTACTED by [Your Name] just now."_
4. Click the dropdown again and select **`QUALIFIED`**.
   - **Verification:** Status badge turns purple/green **`QUALIFIED`** and timeline logs the change.

##### Part D: Internal Collaboration Notes

1. In the Lead 360 drawer, click on the **"Notes"** tab.
2. Click inside the text area and enter an operational note:
   ```text
   Completed initial discovery call with Alex Mercer.
   Requirements:
   1. Multi-tenant Client Portal for 20 downstream corporate accounts.
   2. Private S3 file deliverables with antivirus quarantine.
   3. Budget verified: $45,000 USD approved for Phase 1 execution.
   ```
3. Click the blue button: **"Add Note"**.
4. **Verify Note Persistence:**
   - The note is saved to PostgreSQL and immediately appears at the top of the notes timeline.
   - Stamped with your author name and current UTC timestamp.
   - Refresh the page (`Ctrl + R`): verify the note remains intact.

---

### Test Suite 2.3: Converting Lead to Active Commercial Opportunity

#### Objective:

Verify commercial boundary conversion: turning an incoming prospect into a trackable sales opportunity with budget, target close date, and pipeline stage.

#### Step-by-Step Actions:

1. In the Lead 360 drawer for Alex Mercer, locate the primary action button: **"Convert to Opportunity"**.
2. Click **"Convert to Opportunity"**.
3. A modal dialog titled **"Convert Lead to Commercial Opportunity"** appears. Fill out the fields:
   - **Opportunity Title:** `Acme Corp — Multi-Tenant Cloud Architecture`
   - **Deal Value ($):** `45000`
   - **Target Close Date:** Select a date 30 days from today (e.g., using the date picker).
   - **Initial Pipeline Stage:** Select **`Proposal / Scoping`**.
   - **Owner / Account Executive:** Select your user name.
4. Click the green button: **"Confirm Conversion"**.
5. **Observe the Results:**
   - The modal closes.
   - Lead status updates to **`CONVERTED`**.
   - A linked Opportunity ID is generated (e.g., `OPP-2026-0042`).
   - A link appears in the drawer: _"View Linked Opportunity &rarr;"_.
   - Click the link: verify it opens the Opportunity view displaying deal value `$45,000 USD` and stage `Proposal / Scoping`.

---

### Test Suite 2.4: Staff Operations Console & Queue Telemetry

#### Objective:

Verify the internal engine health: monitoring transactional outbox queues, background workers, and email delivery event telemetry.

#### Step-by-Step Actions:

1. In the sidebar, click on **"Operations"** (or visit `https://stackandscale.org/staff/operations`).
2. Review the **System Health & Queue Dashboard**:
   - **Outbox Worker Status:** Must show a green dot: **`HEALTHY (Active)`**.
   - **Pending Outbox Messages:** Must show `0` or low single digits (messages are processed promptly).
   - **Failed / Dead-Letter Messages:** Must show `0`.
   - **Email Delivery Service:** Indicates `Resend API (Connected)` or outbox driver active.
3. **Inspect the Operations Event Log:**
   - Scroll down to **Recent Operations Events**.
   - Verify that your status changes and opportunity creation appear in the event stream with correlation IDs.

---

### Test Suite 2.5: Search, Knowledge Base & Sound Feedback (SFX)

#### Objective:

Validate staff productivity tools: fast search indexing, internal SOP retrieval, and audio accessibility feedback.

#### Step-by-Step Actions:

##### Part A: Unified Operations Search

1. In the top staff navigation bar, click the **Search Input** (or press `/` on your keyboard).
2. Type: `Acme`.
3. **Verification:**
   - Instant grouped search results appear:
     - Under **Leads**: `Alex Mercer (Acme Global Technologies)`
     - Under **Opportunities**: `Acme Corp — Multi-Tenant Cloud Architecture`
   - Click on the opportunity result: verify direct navigation to that record.

##### Part B: Staff Knowledge Base & Runbooks

1. In the sidebar, click on **"Knowledge"** (`https://stackandscale.org/staff/knowledge`).
2. Browse the standard operating procedures:
   - Look for: _"Client Onboarding & Commercial Boundary Runbook"_.
   - Click on it to open the article.
   - Verify it contains clear steps, role boundaries, and formatted bash code snippets.
   - Hover over a code snippet and click the **"Copy"** button: verify a checkmark appears and the command is copied to your clipboard.

##### Part C: Audio Feedback (SFX) Verification

1. Locate the **Sound Effects (SFX)** speaker toggle icon in the sidebar or header.
2. Click the icon to turn SFX **ON** (icon changes to active speaker).
3. Perform a quick interaction (e.g., add a one-line test note or switch a toggle):
   - **Verification:** A subtle, crisp audio chime plays through your speakers confirming the operation completed.
4. Click the icon again to mute SFX.

---

### Test Suite 2.6: Reporting & CSV Export Verification

#### Objective:

Verify analytics aggregation, conversion rate calculation, and uncorrupted tabular data exports.

#### Step-by-Step Actions:

1. In the sidebar, click on **"Reports"** (`https://stackandscale.org/staff/reports`).
2. Review the Summary Cards:
   - **Total Inbound Leads:** Total count (incremented by 1 from Member 1's test).
   - **Conversion Rate:** Calculated as `(Converted / Total) * 100%`.
   - **Pipeline Value:** Sum of all active opportunities (includes Acme Corp's `$45,000`).
3. **Execute CSV Export:**
   - Click the button: **"Export Leads to CSV"** (located at the top-right of the table).
   - A file named `leads-export-YYYY-MM-DD.csv` downloads to your computer.
4. Open the CSV file in Excel, LibreOffice, or a text editor:
   - Verify column headers: `id, full_name, email, company, budget, status, created_at`.
   - Verify the row for `Alex Mercer` exists with email `alex.mercer@acmecorp-testing.com` and status `CONVERTED`.

---

## 4. Troubleshooting & Known Edge Cases

| Symptom                                            | Underlying Cause                                           | Corrective Action                                                                                                                          |
| -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Keycloak returns `Invalid parameter: redirect_uri` | Web app domain not listed in Keycloak Valid Redirect URIs  | Check Keycloak admin console under Clients &rarr; `web` client &rarr; ensure `https://stackandscale.org/*` is registered.                  |
| Status change dropdown doesn't save (toast error)  | Database connection pool exhausted or lack of manager role | Verify staff user has `manager` or `admin` role in Keycloak. Check API logs with `docker logs --tail 25 stack-and-scale-production-api-1`. |
| CSV export downloads as empty file                 | Client-side export script blocked by popup blocker         | Check browser address bar for blocked download icon and allow downloads from `stackandscale.org`.                                          |

---

## 5. Handoff Protocol to Member 3

Upon passing all test cases above, send this exact handoff message to **Member 3 (Client Portal & Commercials)**:

```text
================================================================================
QA HANDOFF: MEMBER 2 -> MEMBER 3
================================================================================
Timestamp: [Record Date/Time UTC]
Client Organization: Acme Global Technologies
Primary Contact: Alex Mercer (alex.mercer@acmecorp-testing.com)
Opportunity ID: [Paste Opportunity ID from Step 2.3]
Target Scope: Enterprise Cloud Migration & Private Storage
Agreed Value: $45,000 USD

Instructions for Member 3:
Please open the Proposals Console (https://stackandscale.org/staff/proposals),
generate the formal $45,000 proposal for Acme Global Technologies, and proceed to
test the multi-tenant Client Portal and private ClamAV/MinIO file downloads.
================================================================================
```

---

## 6. Official Member 2 Sign-Off Sheet

| Test Case   | Description                                                                   | Pass / Fail         | Operator Signature   | Timestamp  |
| ----------- | ----------------------------------------------------------------------------- | ------------------- | -------------------- | ---------- |
| **TC-2.1**  | Unauthenticated access to `/staff` blocked & redirected to Keycloak           | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.2**  | Keycloak invalid credentials error banner verification                        | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.3**  | Legitimate staff login issues secure HttpOnly token & loads shell             | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.4**  | Member 1's lead appears in Lead Inbox with accurate timestamp                 | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.5**  | Lead 360 drawer opens, displaying full attribution and message                | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.6**  | Status transition: `NEW` &rarr; `CONTACTED` &rarr; `QUALIFIED` with audit log | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.7**  | Internal timeline note saved to database and displayed chronologically        | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.8**  | Lead converted to Commercial Opportunity with deal value `$45,000`            | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.9**  | Operations queue dashboard indicates healthy outbox workers                   | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.10** | Unified search returns indexed lead and opportunity records                   | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.11** | Knowledge Base SOP view with code copy functionality                          | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-2.12** | Leads CSV export downloads with complete and accurate row data                | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |

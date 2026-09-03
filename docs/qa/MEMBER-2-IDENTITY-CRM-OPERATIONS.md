# QA Runbook — Member 2: Identity, Staff CRM & Operations Console

**Assigned Role:** Identity Provider, Role-Based Access Control & Staff CRM Operations Tester  
**Primary URLs:**
- Identity Provider (Keycloak): `https://identity.stackandscale.org`
- Staff Portal Shell: `https://stackandscale.org/staff`
- Staff Lead Inbox: `https://stackandscale.org/staff/leads`
- Staff Operations Console: `https://stackandscale.org/staff/operations`
- Staff Knowledge & SOPs: `https://stackandscale.org/staff/knowledge`

---

## Mission Overview
As Tester 2, you are the guardian of internal operations. Your mission is to verify the Keycloak Single Sign-On (SSO / OIDC) authorization flow, confirm that unauthorized users are denied entry, and execute the full sales and triage pipeline in the Staff CRM: triaging incoming leads submitted by Member 1, transitioning pipeline stages, adding internal notes, and managing operational workflows.

---

## Test Suite 2.1: Keycloak Single Sign-On & Authorization Denial (Journey J06 / V1-07)

### Step-by-Step Instructions:

#### Part A: Unauthorized Anonymous Access Test
1. Open a new **Incognito / Private Browsing** window.
2. In the address bar, navigate directly to: `https://stackandscale.org/staff`.
3. Observe the behavior:
   - Verify that your browser is immediately intercepted and redirected to the Keycloak OIDC login gateway:
     `https://identity.stackandscale.org/realms/stack-and-scale/protocol/openid-connect/auth?...`
   - Verify the login screen renders the official Stack & Scale brand mark and secure HTTPS lock.

#### Part B: Authorized Staff Sign-In
1. On the Keycloak sign-in form:
   - Enter your authorized staff username (or email) and password.
   - Click the blue **"Sign In"** button.
2. Observe the redirect:
   - Keycloak authenticates your credentials, issues an encrypted OIDC session token, and redirects you back to `https://stackandscale.org/staff`.
   - Verify the top navigation bar displays your staff profile badge and role indicator (`staff`, `manager`, or `admin`).

#### Part C: Keycloak Self-Service Account Management
1. In a new tab, navigate to: `https://identity.stackandscale.org/realms/stack-and-scale/account`.
2. Verify you can view your personal account profile, active device sessions, and update multi-factor authentication (MFA) settings.

---

## Test Suite 2.2: Lead Inbox Triage & Lead 360 Timeline (Journey J02 / J03)

### Step-by-Step Instructions:
1. Inside the Staff Portal (`https://stackandscale.org/staff`), click on **"Leads"** in the sidebar navigation (or go to `https://stackandscale.org/staff/leads`).
2. **Find Member 1's Submitted Lead:**
   - Look at the top of the incoming leads table.
   - Find the record submitted by Member 1:
     - **Contact:** `Alex Mercer`
     - **Email:** `alex.mercer@acmecorp-testing.com`
     - **Company:** `Acme Global Technologies`
     - **Status Badge:** `NEW`
3. **Open the Lead 360 Timeline:**
   - Click anywhere on the table row for `Alex Mercer`.
   - A comprehensive slide-over drawer or detail view will open on the right.
   - Verify all fields captured from the public form are present:
     - Work Email, Selected Budget, Inbound Message text, and UTM attribution source.
4. **Lifecycle Stage Transition:**
   - Locate the **"Status"** selector dropdown in the detail pane.
   - Click the dropdown and change the status from **`NEW`** to **`CONTACTED`**.
   - Verify an instant toast notification appears: *"Lead status updated to Contacted."*
   - Verify the timeline logs an automatic audit event: *"Status changed to Contacted by [Your Name] at [Timestamp]"*.
5. **Add Internal Collaboration Note:**
   - In the detail pane, click on the **"Notes"** tab.
   - Click inside the note textarea and type:
     `"Called Alex Mercer. Acme Corp is preparing to migrate 12 microservices. Recommended Enterprise Tier with dedicated Keycloak realm and MinIO storage."`
   - Click the **"Add Note"** button.
   - Verify your note immediately appears in the chronological timeline with your author name and timestamp.

---

## Test Suite 2.3: Convert Lead to Commercial Opportunity

### Step-by-Step Instructions:
1. While viewing the lead record for `Alex Mercer`, click the prominent button: **"Convert to Opportunity"**.
2. A conversion dialog modal will appear. Fill in the commercial parameters:
   - **Opportunity Title:** `Acme Corp — Core Cloud Architecture & Migration`
   - **Estimated Deal Value ($):** `45000`
   - **Target Close Date:** Select a date 30 days from today.
   - **Initial Pipeline Stage:** Select **"Proposal / Scoping"**.
3. Click the **"Save Opportunity"** button.
4. Verify the modal closes, the lead status changes to **`CONVERTED`**, and a linked Opportunity record is created in the CRM pipeline.

---

## Test Suite 2.4: Staff Operations, Search, Knowledge & Audio Feedback

### Step-by-Step Instructions:

#### Part A: Global Staff Operations Search
1. In the top staff header, click the **"Search Operations"** bar or press `/` on your keyboard (or click **"Search"** in the sidebar).
2. Type: `Acme` into the search box.
3. Verify search returns instant grouped results:
   - Group: **Leads** &rarr; Shows `Alex Mercer (Acme Global Technologies)`
   - Group: **Opportunities** &rarr; Shows `Acme Corp — Core Cloud Architecture`
4. Click on the Opportunity result &rarr; Verify it takes you directly to the Opportunity view.

#### Part B: Staff Knowledge Base & Procedures
1. In the sidebar, click **"Knowledge"** (or navigate to `/staff/knowledge`).
2. Verify the list of internal Standard Operating Procedures (SOPs), deployment runbooks, and client onboarding guides.
3. Click on **"Incident Response Runbook"** or **"Commercial Onboarding"**:
   - Verify the procedure document renders with clear sections, formatted code blocks, and copy-to-clipboard buttons.

#### Part C: Sound FX (SFX) Toggle
1. Look at the bottom of the staff sidebar or header for the **Speaker / Audio Icon**.
2. Click the audio toggle to enable **Sound Effects (SFX)**.
3. Trigger an action (such as saving a note or clicking an operational badge):
   - Verify subtle audio feedback plays to confirm task completion.
4. Click the audio toggle again to mute.

---

## Test Suite 2.5: Operational Reports & Notifications

### Step-by-Step Instructions:
1. In the sidebar, click on **"Reports"** (`https://stackandscale.org/staff/reports`).
2. Review the live metrics:
   - Total Leads Received
   - Lead-to-Opportunity Conversion Rate (%)
   - Outbox Event Delivery Success Rate
3. Click the **"Export CSV"** button at the top-right of the table.
   - Verify a `.csv` file downloads immediately to your computer.
   - Open the file: verify the column headers (`Lead ID`, `Name`, `Email`, `Company`, `Status`, `Created At`) and check that `Alex Mercer` is listed.
4. Look at the **Notification Bell** icon in the header:
   - Verify any pending alerts or assignments show an unread count badge.
   - Click the bell icon &rarr; verify the dropdown list of recent events.

---

## Handoff to Member 3
Once you complete Test Suite 2.3 and 2.5:
- Send a message to **Member 3 (Client Portal & Commercials)**:
  > *"Acme Corp (`alex.mercer@acmecorp-testing.com`) has been converted to an Opportunity in the CRM. The Client Organization ID is ready for you to create a Proposal and test the Client Portal."*

---

## Member 2 Sign-Off Checklist

| Test Item | Status | Verified By | Timestamp |
|---|---|---|---|
| Anonymous access to `/staff` correctly blocked with 302 to Keycloak | [ ] Pass / [ ] Fail | ____________ | _________ |
| Keycloak OIDC login succeeds and establishes staff session | [ ] Pass / [ ] Fail | ____________ | _________ |
| Lead submitted by Member 1 appears in Lead Inbox | [ ] Pass / [ ] Fail | ____________ | _________ |
| Lead status transition from `NEW` to `CONTACTED` | [ ] Pass / [ ] Fail | ____________ | _________ |
| Internal timeline note added and saved chronologically | [ ] Pass / [ ] Fail | ____________ | _________ |
| Lead converted to Commercial Opportunity with deal value | [ ] Pass / [ ] Fail | ____________ | _________ |
| Staff Operations search returns instant indexed records | [ ] Pass / [ ] Fail | ____________ | _________ |
| Knowledge Base SOPs render with copy-to-clipboard | [ ] Pass / [ ] Fail | ____________ | _________ |
| Staff reports CSV export downloads with complete data | [ ] Pass / [ ] Fail | ____________ | _________ |

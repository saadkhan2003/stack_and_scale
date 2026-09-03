# QA Runbook — Member 1: Marketing, Content CMS & Inbound Conversion

**Assigned Role:** Public Web, SEO, Editorial CMS & Inbound Lead Conversion Tester  
**Primary Target URLs:**

- Public Production Website: `https://stackandscale.org`
- Payload CMS Production Admin: `https://cms.stackandscale.org/admin`
- Blog / Resources Main Directory: `https://stackandscale.org/resources`
- Blog Route Alias: `https://stackandscale.org/blog`
- Public Site Health: `https://stackandscale.org/api/health` (or edge probe)

---

## 1. Architectural Context & Scope

Stack & Scale's public presentation layer is powered by **Next.js (App Router)** hosted behind a **Caddy Edge Proxy** with Cloudflare TLS. Content is dynamically managed and severed through **Payload CMS (Lexical Rich Text + PostgreSQL)**.

As Tester 1, your responsibility is to ensure that:

1. **First Impressions & Branding:** High-resolution responsive SVG brand assets render without blur, and color contrast strictly conforms to WCAG AA standards.
2. **Navigation & Accessibility:** All 35+ public routes load cleanly without client-side React hydration errors or console exceptions. Keyboard navigation (`Tab`, `Enter`, `Cmd+K`) functions flawlessly.
3. **Editorial Operations (CMS):** The editorial pipeline (Draft &rarr; Version Diff &rarr; Publish &rarr; Live Edge Cache Invalidation) functions end-to-end so marketing staff never have to touch source code.
4. **Lead Generation & Data Integrity:** Prospective client inquiries submitted through the frontend are validated on the client, dispatched via HTTPS POST to the Fastify/NestJS API, and stamped with unique correlation IDs and UTM attribution parameters.

---

## 2. Prerequisites & Tooling

Before beginning, open the following tools on your machine:

- **Browser:** Google Chrome or Chromium (latest version).
- **Developer Tools:** Press `F12` (or `Cmd + Option + I` on macOS).
  - Open the **Console** tab (ensure "Preserve log" is checked to detect any uncaught errors during page transitions).
  - Open the **Network** tab (ensure "Disable cache" is checked while DevTools is open).
- **Text Editor or Notepad:** To record lead IDs, article slugs, and timestamps for handoff.

---

## 3. Detailed Step-by-Step Test Suites

---

### Test Suite 1.1: Visual Brand Fidelity, Responsiveness & Contrast

#### Objective:

Verify that brand elements, layout grids, and interactive states render flawlessly across desktop and mobile screens.

#### Step-by-Step Actions:

1. Open your browser and navigate to `https://stackandscale.org`.
2. **Inspect the Brand Mark:**
   - In the top-left corner of the header, hover over the logo.
   - Right-click the logo and select **Inspect Element**.
   - In the Elements panel, locate the `<picture>` tag:
     ```html
     <picture>
       <source srcset="/brand/stack-and-scale-logo.svg" type="image/svg+xml" />
       <img
         src="/brand/stack-and-scale-logo.jpeg"
         alt="Stack & Scale Technologies"
         width="168"
         height="46"
       />
     </picture>
     ```
   - **Verification:** Confirm the current source is `/brand/stack-and-scale-logo.svg`. Zoom into the browser to 200% (`Ctrl + Plus`). The logo must remain razor-sharp without pixelation or compression artifacts.
3. **Primary Desktop Navigation Links:**
   - Click each header link sequentially:
     - Click **"Products"** &rarr; Verify URL is `https://stackandscale.org/products`. Heading reads _"Industrial-grade software products."_
     - Click **"Services"** &rarr; Verify URL is `https://stackandscale.org/services`. Heading reads _"Engineering services for critical operations."_
     - Click **"Work"** &rarr; Verify URL is `https://stackandscale.org/work`. Heading reads _"Selected deployments and operational proof."_
     - Click **"Approach"** &rarr; Verify URL is `https://stackandscale.org/approach`. Heading reads _"How we build dependable systems."_
     - Click **"Contact"** &rarr; Verify URL scrolls smoothly to `/#contact` or loads `/contact`.
4. **Mobile Navigation Drawer & Touch Interactions:**
   - In DevTools, click the **Toggle Device Toolbar** icon (`Ctrl + Shift + M`).
   - Select **iPhone 14 Pro** (viewport 393 x 852 px).
   - Observe that horizontal desktop links disappear, replaced by a **"Menu"** button with an icon.
   - Tap the **"Menu"** button:
     - **Verification:** A slide-over navigation drawer smoothly animates from the right edge.
     - Verify background content is dimmed behind a backdrop overlay.
     - Tap **"Services"** in the drawer: verify the drawer animates closed and the Services page loads.
     - Tap the Menu button again and press `Escape` on your keyboard: verify the drawer closes.

---

### Test Suite 1.2: Global Accessible Search Modal (`Cmd + K`)

#### Objective:

Verify client-side search indexing, keyboard focus trapping, fuzzy matching, and instant route dispatching.

#### Step-by-Step Actions:

1. Return to desktop view (`100%` zoom) on any page (e.g., `https://stackandscale.org`).
2. Without using your mouse, press **`Cmd + K`** (macOS) or **`Ctrl + K`** (Windows/Linux).
   - Alternatively: Click the search icon button located in the top header.
3. **Verify Modal Launch:**
   - A modal dialog appears centered on the screen with an overlay backdrop.
   - Focus is automatically placed inside the search input box (`input[type="search"]`).
4. **Fuzzy Search Query Test:**
   - Type: `cloud`.
   - **Verification:** As you type each letter, the result list updates in real time (< 50ms) without triggering any server HTTP round-trip.
   - Results should display badges indicating category (e.g., `[Services]`, `[Products]`, `[Resources]`).
5. **Keyboard Navigation Inside Results:**
   - Press the **Down Arrow (`↓`)** key: verify the focus highlight moves to the first search result.
   - Press the **Down Arrow (`↓`)** key again: verify highlight moves to the second result.
   - Press the **Up Arrow (`↑`)** key: verify highlight returns to the first result.
   - Press **`Enter`**:
     - **Verification:** The search modal instantly closes, and the browser navigates directly to the selected page.
6. **Empty State Test:**
   - Reopen the modal (`Cmd + K`).
   - Type a random string: `zzxyqw123`.
   - **Verification:** The modal cleanly renders an empty-state message: _"No matching results found for 'zzxyqw123'."_
   - Press **`Escape`**: Modal closes cleanly.

---

### Test Suite 1.3: Interactive Components, Accordions & Cookie Consent

#### Objective:

Verify client interactivity, accessible state toggling, and GDPR/CCPA cookie preference persistence.

#### Step-by-Step Actions:

1. **FAQ Accordion Test:**
   - Navigate to `https://stackandscale.org/approach` (or `/contact`).
   - Locate the **Frequently Asked Questions** section.
   - Look at an accordion question (e.g., _"How do you handle data residency and sovereignty?"_).
   - In DevTools Elements tab, inspect the button: verify it has `aria-expanded="false"`.
   - Click the question header:
     - **Verification:** The answer smoothly animates open.
     - Inspect the DOM: verify `aria-expanded` updates to `"true"`.
     - Click the question header again: verify the answer collapses and `aria-expanded` returns to `"false"`.
2. **Cookie Consent Banner & Local Storage Persistence:**
   - Open an Incognito window and visit `https://stackandscale.org`.
   - Observe the floating **Cookie Consent Banner** at the bottom of the viewport.
   - It should offer choices: **"Accept Necessary"** and **"Accept All"** (or **"Customize"**).
   - Open DevTools &rarr; **Application** tab &rarr; **Storage** &rarr; **Cookies** / **Local Storage**.
   - Click **"Accept All"**:
     - **Verification:** The banner smoothly dismisses.
     - Inspect Local Storage: verify a key named `cookie_consent` (or `analytics_consent`) is created with value `granted` and an expiration timestamp.
     - Refresh the page (`Ctrl + R`): verify the cookie banner does NOT reappear.

---

### Test Suite 1.4: Blog & Resources Editorial Workflow (Payload CMS)

#### Objective:

Verify content drafting, version history diffs, publication, and immediate edge presentation.

#### Step-by-Step Actions:

##### Part A: Test the `/blog` Permanent Redirect

1. In your browser address bar, type: `https://stackandscale.org/blog` and press Enter.
2. In the DevTools **Network** tab, look at the first request:
   - Request URL: `https://stackandscale.org/blog`
   - Status Code: **`308 Permanent Redirect`**
   - Response Header: `Location: /resources`
3. Verify the browser URL bar updates to `https://stackandscale.org/resources`.
4. Verify the page title renders: _"Useful thinking for useful software."_

##### Part B: CMS Authentication & Content Creation

1. Open a new tab and navigate to: `https://cms.stackandscale.org/admin`.
2. **Sign In:**
   - Enter your CMS Administrator email and password.
   - Click the blue **"Login"** button.
   - Verify redirection to the Payload CMS dashboard with the left sidebar showing collections: `Pages`, `Resources`, `Products`, `Services`, `Media`, `Redirects`.
3. **Navigate to Resources Collection:**
   - In the left sidebar, click on **"Resources"**.
   - You will see the table of existing articles with columns: `Title`, `Type`, `Published Date`, `Slug`, `Status`.
4. **Draft a New Article:**
   - Click the blue **"+ Create New"** button in the top-right corner.
   - In the **Title** field, type:
     ```text
     Zero-Downtime Infrastructure: Hardening High-Availability Systems
     ```
   - In the **Slug** field, type:
     ```text
     zero-downtime-infrastructure-hardening
     ```
   - In the **Type** dropdown, select: **`Article`**.
   - In the **Excerpt** field, type:
     ```text
     A tactical operational guide for deploying multi-tier clusters with automated failover and isolated storage.
     ```
5. **Rich Text Formatting (Lexical Editor):**
   - Click into the main body text area.
   - Type: `### 1. The Single Point of Failure Myth` (set as Heading 3).
   - Press Enter and write:
     ```text
     Modern infrastructure relies on fast recovery and deterministic states rather than costly idle redundancy.
     ```
   - Select the words _"deterministic states"_ and click the **Bold (`B`)** button in the floating toolbar.
   - Click the **Code Block (`</>`)** button and paste:
     ```bash
     docker compose --profile phase14-storage up -d
     ```
6. **Upload Hero Asset:**
   - In the sidebar or bottom section, find **Hero Media**.
   - Click **"Upload Media"** &rarr; choose an image from your computer (PNG or JPEG, < 2MB).
   - Enter descriptive Alt Text: `Architecture diagram of failover nodes`.
   - Click **"Save"**.
7. **Publish the Article:**
   - Look at the top-right action buttons. Notice two options: **"Save Draft"** and **"Publish"**.
   - First, click **"Save Draft"**: verify the status badge shows **`Draft`**.
   - Now click the blue **"Publish"** button:
     - **Verification:** Status badge transitions to a green **`Published`**.
     - A green toast appears: _"Resource successfully updated."_
8. **Verify Public Edge Invalidation:**
   - Switch back to your tab at `https://stackandscale.org/resources`.
   - Hard refresh (`Ctrl + Shift + R`).
   - **Verification:** Your newly published article appears at the top of the resource grid with its thumbnail, "Article" badge, and title.
   - Click on the article:
     - URL is `https://stackandscale.org/resources/zero-downtime-infrastructure-hardening`.
     - Verify the heading, formatted bold text, code block, and image all render with correct styling.
9. **Verify Slug Alias:**
   - In your address bar, type: `https://stackandscale.org/blog/zero-downtime-infrastructure-hardening`.
   - Press Enter.
   - **Verification:** The request immediately redirects to `/resources/zero-downtime-infrastructure-hardening` and displays your post!

---

### Test Suite 1.5: Inbound Lead & Product Demo Submission (Journey J02 / J03)

#### Objective:

Verify end-to-end inbound conversion, form client-side validation, error handling, API response codes, and WhatsApp attribution tracking.

#### Step-by-Step Actions:

##### Part A: Form Validation Negative Tests

1. Go to `https://stackandscale.org/contact` (or scroll to the contact section on the homepage).
2. Leave all fields completely blank and click the **"Send Request"** button.
   - **Verification:** Form is NOT submitted.
   - Red inline validation messages appear under required fields:
     - _"Name is required"_
     - _"Valid work email is required"_
     - _"Please select an area of interest"_
3. In the email field, enter an invalid format: `notanemail@`. Click **"Send Request"**:
   - **Verification:** Inline error shows _"Please provide a valid email address."_

##### Part B: Successful Lead Submission (Positive Test)

1. Open the DevTools **Network** tab. Filter by `Fetch/XHR`.
2. Fill out the form with realistic test data:
   - **Full Name:** `Alex Mercer`
   - **Work Email:** `alex.mercer@acmecorp-testing.com` _(Copy this down exactly!)_
   - **Company Name:** `Acme Global Technologies`
   - **Interest / Scope:** Select **`Product Demo & Cloud Architecture`**
   - **Estimated Budget:** Select **`$25,000 – $50,000`**
   - **Project Details / Message:**
     ```text
     We are evaluating Stack & Scale for enterprise multi-tenancy with Keycloak SSO and private MinIO storage. Need a technical scoping call.
     ```
3. Click the **"Send Request"** button.
4. **Verify Network Transmission:**
   - In the Network tab, observe the POST request dispatched:
     - **Request URL:** `https://stackandscale.org/api/leads` (or `https://api.stackandscale.org/leads`)
     - **Method:** `POST`
     - **Status Code:** **`201 Created`** (or `200 OK`)
     - **Headers:** Verify presence of `x-correlation-id` in response headers.
5. **Verify UI State Transition:**
   - The form inputs disappear and are replaced by a styled success container:
     - Large green checkmark icon.
     - Headline: _"Thank you, Alex Mercer!"_
     - Body: _"Your inquiry has been received. A senior solutions engineer will contact you within 24 hours."_
     - A reference ID is displayed (e.g., `Ref: LEAD-XXXXXXXX`). Record this Reference ID!

##### Part C: WhatsApp Attribution Link Validation (Journey J04)

1. On the contact page, locate the button: **"Chat on WhatsApp"** or **"Direct Operator WhatsApp"**.
2. Right-click the button and select **Inspect**.
3. Inspect the `href` attribute:
   ```text
   https://wa.me/XXXXXXXXXXX?text=Hello%20Stack%20%26%20Scale%20Team%2C%20I%20would%20like%20to%20inquire%20about...&utm_source=contact_page&utm_medium=web
   ```
4. **Verification:**
   - The link starts with the official WhatsApp domain `https://wa.me/`.
   - The `text` query parameter is properly URL-encoded.
   - Attribution parameters (`utm_source`, `utm_medium`) are intact so the sales team can match anonymous chats back to the website session.

---

## 4. Troubleshooting & Known Edge Cases

| Issue Observed                                        | Root Cause                                                      | Remediation Action                                                                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Image in CMS article shows broken icon on public site | Media record uploaded without public read access or volume path | Ensure media collection in CMS has `read: () => true` in `apps/cms/src/collections/media.ts`. Hard refresh browser.            |
| Form submission hangs with spinner indefinitely       | API endpoint unreachable or CORS header missing                 | Check DevTools Console for CORS errors. Verify `https://api.stackandscale.org/health` returns 200.                             |
| Search dialog returns 0 results for known pages       | Search index cache is stale                                     | Open `https://stackandscale.org/search` or clear browser cache; Next.js dynamic revalidation generates the index periodically. |

---

## 5. Handoff Protocol to Member 2

Upon passing all test cases above, send this exact handoff message to **Member 2 (Identity & CRM Operations)**:

```text
================================================================================
QA HANDOFF: MEMBER 1 -> MEMBER 2
================================================================================
Timestamp: [Record Date/Time UTC]
Inbound Lead Name: Alex Mercer
Inbound Lead Email: alex.mercer@acmecorp-testing.com
Company: Acme Global Technologies
Budget Range: $25,000 – $50,000
Submission Ref ID: [Paste Lead Ref ID from Step 1.5.B]
CMS Published Slug: zero-downtime-infrastructure-hardening

Instructions for Member 2:
Please open the Staff Lead Inbox (https://stackandscale.org/staff/leads),
verify Alex Mercer appears at the top of the table with status "NEW", and begin
Test Suite 2.2 (Lead 360 & Pipeline Conversion).
================================================================================
```

---

## 6. Official Member 1 Sign-Off Sheet

| Test Case  | Description                                                              | Pass / Fail         | Operator Signature   | Timestamp  |
| ---------- | ------------------------------------------------------------------------ | ------------------- | -------------------- | ---------- |
| **TC-1.1** | Desktop/Mobile Header Navigation & Sharp Vector SVG Brand Logo           | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.2** | Keyboard Accessible Search Modal (`Cmd+K`, fuzzy filtering, Esc)         | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.3** | Interactive FAQ Accordions & GDPR Cookie Consent persistence             | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.4** | `/blog` 308 Permanent Redirect to `/resources`                           | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.5** | CMS Article Draft &rarr; Lexical Editor &rarr; Instant Live Edge Publish | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.6** | Slug alias redirect (`/blog/[slug]` &rarr; `/resources/[slug]`)          | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.7** | Inbound Lead Form Client Validation (negative tests)                     | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.8** | Inbound Demo Submission & HTTP 201 Created confirmation                  | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-1.9** | WhatsApp Pre-filled URL & Attribution Tracking Parameter Check           | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |

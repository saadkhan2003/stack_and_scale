# QA Runbook — Muhammad Saad Khan: Public Web, SEO, Editorial CMS & Inbound Conversion

**Assigned Engineer:** Muhammad Saad Khan  
**Assigned Roles & Boundaries:** Public Website, Design System, Search & SEO Engine, Payload CMS Editorial Lifecycle, Inbound Conversion Funnel  
**Architecture Grounding:** [Blueprint §2.1 Surfaces](file:///media/saad/Data/stack_and_scale/STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md), [Q001–Q010](file:///media/saad/Data/stack_and_scale/question-decisions/001-company-vision-and-positioning.md), [Q015–Q024](file:///media/saad/Data/stack_and_scale/question-decisions/015-whatsapp-integration.md), [Q061–Q070](file:///media/saad/Data/stack_and_scale/question-decisions/061-brand-assets.md), [Q076–Q077](file:///media/saad/Data/stack_and_scale/question-decisions/076-cms-composition-model.md)  
**Primary Target URLs:**
- Public Website: `https://stackandscale.org`
- Payload CMS Production Admin: `https://cms.stackandscale.org/admin`
- Resource & Knowledge Center: `https://stackandscale.org/resources`
- Blog Route Alias: `https://stackandscale.org/blog`
- Public Status Page: `https://status.stackandscale.org`

---

## 1. Executive Context & System Architecture
Stack & Scale is positioned not as a generic dev shop, but as an **industrial-grade software company** with two commercial engines:
1. Ready-made business products (POS, Tailor Management, Cloud Backbones).
2. Mission-critical custom engineering services for US, UK, Gulf, and international clients.

As **Muhammad Saad Khan**, your mission is to verify the entire public presentation and conversion architecture. You will test visual brand fidelity, mobile responsive layouts, global keyboard search, cookie consent, CMS editorial publishing workflows, blog route aliases, and the inbound lead capture engine.

---

## 2. Testing Environment & Prerequisites
- **Browser:** Google Chrome or Chromium (latest stable).
- **Developer Tools:** Press `F12` (`Cmd + Option + I` on macOS):
  - **Console Tab:** Keep open to verify zero React hydration errors or unhandled exceptions.
  - **Network Tab:** Check "Preserve log" and "Disable cache" during DevTools inspection.
- **Payload CMS Admin Account:** Credentials with Editor/Administrator permissions on `https://cms.stackandscale.org/admin`.

---

## 3. Step-by-Step Execution Suites

---

### Test Suite 1.1: Brand Assets, Vector Fidelity & Responsive Shell

#### Context:
Per **Q004, Q005, Q061, and Q062**, Stack & Scale employs an engineered, dark-slate/warm-steel visual identity. All logos must render crisp vector SVGs without blur or compression artifacts.

#### Click-by-Click Instructions:
1. Open your browser and navigate to `https://stackandscale.org`.
2. **Inspect Top Brand Logo:**
   - In the top-left of the header, hover over the logo.
   - Right-click the logo and select **Inspect**.
   - Verify the HTML structure uses the modern `<picture>` element with SVG prioritization:
     ```html
     <picture>
       <source srcset="/brand/stack-and-scale-logo.svg" type="image/svg+xml">
       <img src="/brand/stack-and-scale-logo.jpeg" alt="Stack & Scale Technologies" width="168" height="46">
     </picture>
     ```
   - Zoom the browser to **200%** (`Ctrl + Plus`): verify text lines and geometric nodes remain crisp vector curves.
   - Click the logo from any sub-page: verify instant client-side navigation back to the homepage (`/`).
3. **Primary Header Navigation Routing:**
   - Click **"Products"** &rarr; Verify URL is `/products`, heading: *"Industrial-grade software products."*
   - Click **"Services"** &rarr; Verify URL is `/services`, heading: *"Engineering services for critical operations."*
   - Click **"Work"** &rarr; Verify URL is `/work`, heading: *"Selected deployments and operational proof."*
   - Click **"Approach"** &rarr; Verify URL is `/approach`, heading: *"How we build dependable systems."*
   - Click **"Contact"** &rarr; Verify smooth scroll to `/#contact` or direct load of `/contact`.
4. **Mobile Navigation Drawer & Touch Interactions (Q067):**
   - In Chrome DevTools, click **Toggle Device Toolbar** (`Ctrl + Shift + M`).
   - Select **iPhone 14 Pro** (393px width).
   - Verify desktop horizontal links collapse into a clean **"Menu"** button.
   - Tap the **"Menu"** button:
     - Verify navigation drawer slides in smoothly from the right edge with background dimmed.
     - Tap **"Services"**: verify drawer closes automatically and the Services page loads.
     - Tap Menu again and press `Escape`: verify drawer dismisses cleanly.

---

### Test Suite 1.2: Global Accessible Command Search (`Cmd + K`)

#### Context:
Per **Q023 and Q087**, the public platform features an accessible command palette for rapid discovery across products, services, case studies, and resources.

#### Click-by-Click Instructions:
1. Return to desktop view (100% zoom).
2. Press **`Cmd + K`** (macOS) or **`Ctrl + K`** (Windows/Linux) or click the search icon in the header.
3. **Verify Modal Launch:**
   - Modal dialog overlays the viewport with background blur.
   - Cursor auto-focuses into the search input box (`input[type="search"]`).
4. **Fuzzy Query Testing:**
   - Type `cloud` in the search box.
   - Verify matching items appear instantly (< 50ms) with category badges (e.g., `[Services]`, `[Resources]`).
5. **Keyboard Navigation:**
   - Press **Down Arrow (`↓`)** to select the first result.
   - Press **Down Arrow (`↓`)** again to select the second result.
   - Press **`Enter`**: verify modal closes and browser navigates to that destination page.
6. **Empty Query & Dismissal:**
   - Reopen search (`Cmd + K`).
   - Type `invalidstringxyz99`.
   - Verify empty state message: *"No matching results found for 'invalidstringxyz99'."*
   - Press **`Escape`**: verify modal dismisses cleanly.

---

### Test Suite 1.3: Interactive Accordions & Cookie Consent Lifecycle

#### Click-by-Click Instructions:
1. **Interactive FAQ Accordions (Q068 Accessibility):**
   - Navigate to `https://stackandscale.org/approach`.
   - Locate the **FAQ Section**.
   - Inspect any question button in DevTools: verify `aria-expanded="false"`.
   - Click the question: verify smooth expansion and `aria-expanded="true"`.
   - Click again: verify smooth collapse and `aria-expanded="false"`.
2. **GDPR/CCPA Cookie Consent Persistence (Q051):**
   - Open a fresh Incognito window and visit `https://stackandscale.org`.
   - Observe the floating cookie consent banner.
   - Click **"Accept All"**.
   - Open DevTools &rarr; **Application** &rarr; **Local Storage**:
     - Verify key `analytics_consent` (or `cookie_consent`) is set to `granted`.
   - Refresh page: verify banner does NOT reappear.

---

### Test Suite 1.4: Payload CMS Publishing & Blog Redirect Lifecycle

#### Context:
Per **Q076, Q077, and Q094**, marketing content is authored in Payload CMS using a block-based Lexical editor and published directly to the public site.

#### Click-by-Click Instructions:

##### Part A: Verify `/blog` Route Aliases
1. In browser address bar, enter: `https://stackandscale.org/blog`.
2. Look at DevTools **Network** tab:
   - Status Code: **`308 Permanent Redirect`**.
   - Destination URL: `https://stackandscale.org/resources`.
   - Heading confirms: *"Useful thinking for useful software."*

##### Part B: CMS Editorial Authoring & Real-Time Publishing
1. Open a new tab and navigate to: `https://cms.stackandscale.org/admin`.
2. Sign in with your CMS Administrator account.
3. In the left navigation sidebar under **Collections**, click **"Resources"**.
4. Click the blue **"+ Create New"** button in the top-right corner.
5. Fill out the resource document:
   - **Title:** `Industrial-Grade Multi-Tenant Cloud Architecture in 2026`
   - **Slug:** `industrial-grade-multi-tenant-cloud-architecture-2026`
   - **Type:** Select **`Article`** from the dropdown.
   - **Excerpt:** `A comprehensive guide to deploying self-healing multi-tier microservices on cost-optimized VPS infrastructure.`
6. **Lexical Rich Text Editor:**
   - Click into the body editor.
   - Type `## 1. The Autonomous Systems Principle` (Heading 2).
   - Type: `Modern enterprise platforms must maintain high availability without runaway cloud costs.`
   - Highlight the words *"high availability"* and click **Bold (`B`)**.
   - Click the **Code Block (`</>`)** button and paste:
     ```bash
     docker compose --profile phase14-storage up -d
     ```
7. **Hero Media Upload:**
   - Under **Hero Media**, click **Upload Media** &rarr; choose a PNG/JPEG image (< 2MB).
   - Set Alt Text: `Architecture cluster schematic`.
8. **Draft & Publication Lifecycle:**
   - Click **"Save Draft"**: verify status shows **`Draft`**.
   - Click **"Publish"**:
     - Status updates to green **`Published`**.
     - Toast appears: *"Resource successfully updated."*
9. **Public Edge Verification:**
   - Open `https://stackandscale.org/resources` and refresh.
   - Verify the new article appears at the top of the grid with its image, type badge, and title.
   - Click the article card &rarr; verify URL `/resources/industrial-grade-multi-tenant-cloud-architecture-2026` renders full formatted text and code blocks.
   - In address bar, test alias: `https://stackandscale.org/blog/industrial-grade-multi-tenant-cloud-architecture-2026` &rarr; verify it automatically redirects to `/resources/industrial-grade-multi-tenant-cloud-architecture-2026`!

---

### Test Suite 1.5: Inbound Lead Capture & WhatsApp Attribution Funnel

#### Context:
Per **Q003, Q014, Q015, Q016, and Q091**, every prospect inquiry is validated, assigned attribution, and transmitted to the Fastify API to seed the CRM pipeline.

#### Click-by-Click Instructions:

##### Part A: Client-Side Form Validation (Negative Tests)
1. Go to `https://stackandscale.org/contact` (or scroll to homepage contact block).
2. Leave all fields empty and click **"Send Request"**.
   - Verify form is NOT submitted.
   - Verify red inline error messages: *"Name is required"*, *"Valid work email is required"*, *"Please select an area of interest"*.
3. Type an invalid email: `bad-email@` and click Send:
   - Verify error: *"Please provide a valid email address."*

##### Part B: Successful Lead Submission (Positive Test)
1. Open DevTools **Network** tab and filter by `Fetch/XHR`.
2. Enter exact test prospect details:
   - **Full Name:** `Alex Mercer`
   - **Work Email:** `alex.mercer@acmecorp-testing.com` *(Save this for Talha Shams!)*
   - **Company Name:** `Acme Global Technologies`
   - **Area of Interest:** Select **`Product Demo & Cloud Architecture`**
   - **Estimated Budget:** Select **`$25,000 – $50,000`**
   - **Message / Scope:**
     ```text
     We are evaluating Stack & Scale for enterprise multi-tenancy with Keycloak SSO and private MinIO storage. Need a technical scoping call.
     ```
3. Click the **"Send Request"** button.
4. **Verify Transmission & UI Confirmation:**
   - Network tab shows `POST /api/leads` returning HTTP **`201 Created`** with `x-correlation-id`.
   - UI transforms into a success banner:
     - Green checkmark icon.
     - *"Thank you, Alex Mercer!"*
     - Lead Reference ID displayed (e.g., `LEAD-XXXXXXXX`). **Record this ID!**

##### Part C: WhatsApp Attribution Inspection (Q015 / Journey J04)
1. On the contact page, right-click the **"Chat on WhatsApp"** button and click **Inspect**.
2. Verify the `href` attribute:
   - Starts with `https://wa.me/`.
   - Pre-filled message is URL-encoded with tracking tags (e.g., `?text=Hello...&utm_source=contact_page&utm_medium=web`).

---

## 4. Handoff Protocol to Talha Shams (Member 2)

Copy and send this handoff block to **Talha Shams**:

```text
================================================================================
QA HANDOFF: MUHAMMAD SAAD KHAN (M1) -> TALHA SHAMS (M2)
================================================================================
Timestamp: [Record UTC Date & Time]
Lead Name: Alex Mercer
Work Email: alex.mercer@acmecorp-testing.com
Company: Acme Global Technologies
Budget Range: $25,000 – $50,000
Submission Ref ID: [Paste Lead Ref ID from Step 1.5.B]
Published CMS Slug: industrial-grade-multi-tenant-cloud-architecture-2026

Instructions for Talha Shams:
Please open the Staff Lead Inbox (https://stackandscale.org/staff/leads),
verify Alex Mercer is present with status "NEW", and begin Test Suite 2.2.
================================================================================
```

---

## 5. Official Muhammad Saad Khan Sign-Off Sheet

| Test Case | Description | Pass / Fail | Operator Signature | Timestamp |
|---|---|---|---|---|
| **TC-1.1** | Vector SVG brand logo & desktop/mobile navigation shell | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.2** | Keyboard search palette (`Cmd+K`, fuzzy filtering, Esc) | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.3** | FAQ accordions (`aria-expanded`) & cookie consent persistence | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.4** | `/blog` 308 Permanent Redirect to `/resources` | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.5** | Payload CMS article draft, formatting & real-time publish | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.6** | Dynamic blog slug alias redirect (`/blog/[slug]` &rarr; `/resources/[slug]`) | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.7** | Lead form client-side validation & error banners | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.8** | Inbound demo submission & HTTP 201 Created confirmation | [ ] Pass / [ ] Fail | __________________ | _________ |
| **TC-1.9** | WhatsApp pre-filled link & UTM attribution parameters | [ ] Pass / [ ] Fail | __________________ | _________ |

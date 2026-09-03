# QA Runbook — Member 1: Marketing, Content CMS & Inbound Conversion

**Assigned Role:** Public Web, SEO, Editorial CMS & Inbound Lead Tester  
**Primary URLs:**
- Public Website: `https://stackandscale.org`
- Payload CMS Admin: `https://cms.stackandscale.org/admin`
- Blog / Resources Directory: `https://stackandscale.org/resources`
- Blog Alias: `https://stackandscale.org/blog`

---

## Mission Overview
As Tester 1, your job is to verify the entire customer-facing journey: how a prospective client explores Stack & Scale, discovers products and services, reads blog articles, searches for topics, and submits an inbound demo or project inquiry. You will also verify the editorial workflow inside Payload CMS to ensure content can be drafted, previewed, and published in real-time.

---

## Test Suite 1.1: Desktop & Mobile Navigation & Brand Elements

### Step-by-Step Instructions:
1. Open your browser and navigate to `https://stackandscale.org`.
2. **Brand Logo Verification:**
   - Look at the top-left header logo.
   - Right-click the logo and select **Inspect Element**.
   - Verify it renders inside a `<picture>` tag with the crisp vector source `/brand/stack-and-scale-logo.svg`.
   - Click the logo from any page: verify it always navigates back to the homepage (`/`).
3. **Primary Navigation Bar:**
   - In the desktop header, click each navigation link one by one:
     - Click **"Products"** &rarr; Verify URL updates to `/products` and the page renders the product catalogue.
     - Click **"Services"** &rarr; Verify URL updates to `/services` and engineering capabilities appear.
     - Click **"Work"** &rarr; Verify URL updates to `/work` and case studies appear.
     - Click **"Approach"** &rarr; Verify URL updates to `/approach` and architecture principles appear.
     - Click **"Contact"** &rarr; Verify smooth scroll to `/#contact` or navigation to `/contact`.
4. **Mobile Responsiveness:**
   - Open Developer Tools (`F12`), toggle Device Toolbar (`Ctrl + Shift + M`), and select an iPhone or Android screen width (e.g., 390px).
   - Verify the desktop navigation disappears and a **"Menu"** button with a hamburger icon appears.
   - Click the **"Menu"** button &rarr; Verify the navigation drawer/sheet smoothly slides in from the right.
   - Click any link in the drawer &rarr; Verify the sheet closes and the target page loads.

*Expected Result:* All links respond immediately, active page indicator highlights the current route, and the mobile menu operates without layout shifts.

---

## Test Suite 1.2: Global Keyboard Search (`Cmd + K`)

### Step-by-Step Instructions:
1. On `https://stackandscale.org`, press the keyboard shortcut **`Cmd + K`** (on macOS) or **`Ctrl + K`** (on Windows/Linux). Alternatively, click the search icon in the top header.
2. Verify the **Search Dialog** modal overlays the screen with a focused search input.
3. In the input box, type: `cloud`.
   - Verify that search results instantly populate showing relevant pages, services, or resources.
4. Press the **Down Arrow (`↓`)** key on your keyboard to highlight the first result, then press **`Enter`**.
   - Verify the modal closes and your browser immediately navigates to that page.
5. Press **`Escape`** from inside the search dialog:
   - Verify the search dialog closes immediately without navigation.

*Expected Result:* Instant fuzzy search with zero lag, full keyboard navigation accessibility, and accurate indexing.

---

## Test Suite 1.3: Blog & Resources Editorial Lifecycle (Payload CMS)

### Step-by-Step Instructions:

#### Part A: Test the `/blog` Redirect Alias
1. In your browser's address bar, type: `https://stackandscale.org/blog` and hit **Enter**.
2. Look at the final URL in the browser bar:
   - Verify it permanently redirects (HTTP 308) to `https://stackandscale.org/resources`.
   - Verify the heading reads: *"Useful thinking for useful software."*

#### Part B: CMS Editorial Publishing Workflow
1. Open a new tab and navigate to: `https://cms.stackandscale.org/admin`.
2. Sign in with your CMS Administrator account:
   - Enter your email and password.
   - Click **"Login"**.
3. In the left navigation menu under **"Content"**, click on **"Resources"**.
4. In the top right corner, click the blue **"+ Create New"** button.
5. Fill in the resource fields:
   - **Title**: Type `High-Availability Architecture in 2026: The Complete Guide`
   - **Slug**: Type `ha-architecture-2026-guide`
   - **Type**: Select **"Article"** from the dropdown options.
   - **Excerpt**: Type `An in-depth breakdown of self-healing multi-tier systems on unified VPS infrastructure.`
   - **Content Editor**: Click into the rich-text editor body. Write 2 paragraphs of text. Highlight a sentence and click the **Bold (`B`)** button. Add a heading 2 by typing `## Key Architecture Lessons`.
6. **Hero / Featured Image:**
   - Under the **Hero Media** section, click **"Upload Media"** or select an existing asset from the media library.
7. **Publish the Post:**
   - In the top right corner, click the **"Publish"** button.
   - Verify a green success notification appears: *"Resource successfully published."*
8. **Verify Public Live Site:**
   - Open a new tab and visit `https://stackandscale.org/resources`.
   - Refresh the page: verify your new article appears in the article list with its title, excerpt, and type badge ("Article").
   - Click on the article card &rarr; Verify it opens at `https://stackandscale.org/resources/ha-architecture-2026-guide`.
   - Test the slug alias: In your address bar, type `https://stackandscale.org/blog/ha-architecture-2026-guide` &rarr; Verify it automatically redirects to `/resources/ha-architecture-2026-guide`!

*Expected Result:* Content drafted in the CMS publishes instantaneously to the public website with proper metadata, tags, and clean URLs.

---

## Test Suite 1.4: Inbound Lead & Product Demo Submission (Journey J02 / J03)

### Step-by-Step Instructions:
1. Go to `https://stackandscale.org` and scroll down to the contact section or visit `https://stackandscale.org/contact`.
2. Locate the **Inbound Lead / Demo Request Form**.
3. Fill out the form with a realistic test lead:
   - **Full Name**: `Alex Mercer`
   - **Work Email**: `alex.mercer@acmecorp-testing.com` *(Save this email! You will pass it to Member 2).*
   - **Company**: `Acme Global Technologies`
   - **Interest / Requirement**: Select **"Product Demo"** or **"Cloud Architecture Project"**.
   - **Estimated Budget**: Select `$25k – $50k`.
   - **Message / Notes**: `We are scaling our core platform and need an enterprise-grade multi-tenant architecture with Keycloak OIDC.`
4. Click the **"Send Request"** (or **"Book Demo"**) button.
5. **Verify Form Submission:**
   - Verify a loading spinner appears briefly.
   - Verify the form replaces itself with a green confirmation banner:
     *"Thank you! Your request has been received. Our engineering team will review your inquiry within 24 hours."*
6. **WhatsApp Attribution Test (Journey J04):**
   - On the contact page, locate the **"Chat on WhatsApp"** button.
   - Right-click the button and select **Copy link address**.
   - Paste the link into a text editor:
     - Verify it starts with `https://wa.me/...`.
     - Verify it contains URL-encoded pre-filled attribution parameters (e.g., `?text=Hello%20Stack%20%26%20Scale...&utm_source=website`).

---

## Handoff to Member 2
Once you complete Test Suite 1.4:
- Send a message to **Member 2 (Identity & CRM Operations)**:
  > *"I just submitted a demo inquiry under the email `alex.mercer@acmecorp-testing.com` for company `Acme Global Technologies`. Please verify it in the Staff Lead Inbox."*

---

## Member 1 Sign-Off Checklist

| Test Item | Status | Verified By | Timestamp |
|---|---|---|---|
| Desktop Header Navigation & Vector SVG Brand Logo | [ ] Pass / [ ] Fail | ____________ | _________ |
| Mobile Navigation Drawer on small viewport | [ ] Pass / [ ] Fail | ____________ | _________ |
| Keyboard Search Modal (`Cmd + K` / `Ctrl + K`) | [ ] Pass / [ ] Fail | ____________ | _________ |
| `/blog` and `/blog/[slug]` 308 redirect to `/resources` | [ ] Pass / [ ] Fail | ____________ | _________ |
| CMS Article creation, rich text formatting, and publish | [ ] Pass / [ ] Fail | ____________ | _________ |
| Public `/resources` rendering of new CMS article | [ ] Pass / [ ] Fail | ____________ | _________ |
| Inbound Demo form submission & success confirmation | [ ] Pass / [ ] Fail | ____________ | _________ |
| WhatsApp link pre-filled attribution text | [ ] Pass / [ ] Fail | ____________ | _________ |

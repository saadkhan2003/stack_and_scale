# User Manual 1: Marketing, Web Showcase & Headless CMS

> **Assigned Role:** Growth, Marketing & CMS Lead  
> **Primary Operator:** Muhammad Saad Khan (`saadkhan`)  
> **Primary Surfaces:** `https://stackandscale.org` & `https://cms.stackandscale.org/admin`  
> **Target Audience:** Content Editors, Marketing Strategists, SEO Specialists

---

## 1. Role & Operational Scope

As the **Marketing & CMS Lead**, you are responsible for:
- Operating the public marketing surface and brand showcase at `https://stackandscale.org`.
- Authoring, editing, and publishing architectural articles and case studies via the **Payload Headless CMS**.
- Managing SEO metadata, OpenGraph cards, and schema.org structured data.
- Ensuring the inbound lead generation funnel (`/contact`, `/pricing`, `/services`) functions flawlessly.

---

## 2. Access & Authentication

### Payload CMS Admin Console
- **Console URL:** `https://cms.stackandscale.org/admin`
- **Email:** `msaad.official6@gmail.com`
- **Password:** `Saad_@123` OR '087908`
- **Role:** `admin` (Full Editorial & Publishing Rights)

### Keycloak Staff Account
- **IAM Console:** `https://identity.stackandscale.org`
- **Username:** `saadkhan`
- **Email:** `saad.khan@stackandscale.org`
- **Password:** `Saad_@123' OR '087908`
- **Roles:** `admin`, `owner`, `member`

---

## 3. Step-by-Step Editorial Lifecycle (Payload CMS)

### 3.1 Logging in to the CMS Admin
1. Open your browser and navigate to `https://cms.stackandscale.org/admin`.
2. Enter your email (`msaad.official6@gmail.com`) and password (`StackScale2026!#Saad`).
3. Click **Login**. You will land on the **Dashboard** displaying your collections:
   - **Articles:** Architectural deep dives, system blueprints, and tutorials.
   - **Categories:** Taxonomy tags (`Architecture`, `Security`, `Engineering`, `Case Studies`).
   - **Media:** Uploaded images, SVG diagrams, and hero graphics.
   - **Users:** Editorial team accounts.

### 3.2 Creating and Publishing a New Article
1. In the left sidebar, click **Articles** &rarr; **Create New**.
2. **Document Fields:**
   - **Title:** Enter an engaging, authoritative title (e.g. `Scaling Event-Driven Microservices on NVMe Hardware`).
   - **Slug:** Auto-generates or customize (e.g. `scaling-event-driven-microservices`).
   - **Author:** Select `Muhammad Saad Khan`.
   - **Category:** Select relevant tag (e.g. `Architecture`).
   - **Published Date:** Set current UTC date or schedule for future release.
3. **Rich Text Content:**
   - Use the rich text block editor to add headings (`H2`, `H3`), body paragraphs, code snippets, and callout blocks.
4. **SEO & Social Metadata:**
   - **Meta Title:** 50–60 characters summarizing the article.
   - **Meta Description:** 150–160 characters describing key takeaways.
   - **OG Image:** Upload a 1200x630px high-resolution banner.
5. **Publishing State:**
   - Toggle Status from **Draft** &rarr; **Published**.
   - Click **Save**. The article is immediately available via the API and rendered on the frontend.

---

## 4. Inbound Lead Intake & Conversion Funnel

### 4.1 How Prospects Reach Out
1. Prospects arrive at `https://stackandscale.org/contact` or click **Get in Touch** on the hero/navigation.
2. The prospect fills out the **Contact Form**:
   - Name, Email, Organization, Budget Range, Scope Description.
3. Upon clicking **Send Message**, the frontend issues `POST https://api.stackandscale.org/api/leads`.
4. The system validates the submission, stores it in PostgreSQL `platform.leads`, and automatically notifies Talha Shams in the Staff CRM.

### 4.2 Verifying Inbound Lead Delivery
You can verify that inbound leads are properly captured by inspecting the API health probe:
```bash
curl -i https://api.stackandscale.org/health
# Returns HTTP 200: {"status":"ok","uptime":...}
```

---

## 5. Troubleshooting & FAQ

- **Q: Why does `/blog` redirect to the home page?**  
  *A:* Stack & Scale enforces clean canonical routing. All legacy `/blog` requests receive an HTTP 308 permanent redirect to the root showcase or targeted article slug.
- **Q: Media upload fails in Payload CMS?**  
  *A:* Ensure image format is JPEG, PNG, WebP, or SVG and file size is under 15MB. ClamAV automatically checks attachments.

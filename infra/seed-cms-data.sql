-- ============================================================================
-- Stack & Scale Enterprise CMS Initial Seed
-- Populates: Site Settings, Navigation, Products, Services, Pages (Home, About, Contact)
-- ============================================================================

BEGIN;

-- 1. SITE SETTINGS
INSERT INTO site_settings (id, site_name, footer_note, updated_at, created_at)
VALUES (
  1,
  'Stack & Scale',
  'Software built for store floors, warehouses, and real operations.',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  footer_note = EXCLUDED.footer_note,
  updated_at = NOW();

-- 2. PRODUCTS
INSERT INTO products (id, title, slug, tagline, _status, updated_at, created_at)
VALUES
  (1, 'Retail POS & Edge Sync', 'retail-operations', 'Offline-first shop floor register with SQLite local sync and <2ms barcode scan latency', 'published', NOW(), NOW()),
  (2, 'Workflow Automation Hub', 'workflow-automation', 'Resilient event-driven automation engine connecting inventory to CRM', 'published', NOW(), NOW()),
  (3, 'Sovereign Cloud Deploy', 'cloud-infrastructure', 'Private VPC and air-gapped on-premise infrastructure without SaaS taxes', 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  tagline = EXCLUDED.tagline,
  _status = EXCLUDED._status,
  updated_at = NOW();

-- 3. SERVICES
INSERT INTO services (id, title, slug, summary, _status, updated_at, created_at)
VALUES
  (1, 'Edge Architecture Advisory', 'edge-architecture', 'Design edge networks that survive severe connectivity blackouts without downtime', 'published', NOW(), NOW()),
  (2, 'Turnkey Retail Rollout', 'turnkey-rollout', 'Full hardware provisioning, barcode integration, and staff on-boarding', 'published', NOW(), NOW()),
  (3, 'Sovereignty Migration', 'sovereignty-migration', 'Eliminate recurring per-seat SaaS tax by bringing operations onto owned servers', 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  _status = EXCLUDED._status,
  updated_at = NOW();

-- 4. PAGES
-- A: Home Page
INSERT INTO pages (id, title, slug, seo_meta_title, seo_meta_description, _status, updated_at, created_at)
VALUES (
  1,
  'Home',
  'home',
  'Software for real operations | Stack & Scale',
  'Keep registers scanning and orders moving even when your internet drops. Stack & Scale runs on your own hardware, syncs in milliseconds, and eliminates per-seat SaaS bills.',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  seo_meta_title = EXCLUDED.seo_meta_title,
  seo_meta_description = EXCLUDED.seo_meta_description,
  _status = EXCLUDED._status,
  updated_at = NOW();

-- Clean existing blocks for Home page (page id 1) before re-inserting
DELETE FROM pages_blocks_hero WHERE _parent_id = 1;
DELETE FROM pages_blocks_metric_group WHERE _parent_id = 1;
DELETE FROM pages_blocks_faq_block WHERE _parent_id = 1;

-- B: Home Hero Block
INSERT INTO pages_blocks_hero (_order, _parent_id, _path, id, variant, eyebrow, heading, subheading, block_name)
VALUES (
  1,
  1,
  'layout',
  'hero-home-01',
  'split',
  'Local-First Retail & Operations',
  'Software built for store floors, warehouses, and real operations.',
  'Keep registers scanning and orders moving even when your internet drops. Stack & Scale runs on your own hardware, syncs in milliseconds, and eliminates per-seat SaaS bills.',
  'Hero Section'
);

-- C: Home Metric Group Block
INSERT INTO pages_blocks_metric_group (_order, _parent_id, _path, id, block_name)
VALUES (
  2,
  1,
  'layout',
  'metric-home-01',
  'Operational Reliability Metrics'
);

INSERT INTO pages_blocks_metric_group_items (_order, _parent_id, id, label, value, suffix)
VALUES
  (1, 'metric-home-01', 'metric-item-01', 'Fault-Tolerant Edge SLA', '99.999', '%'),
  (2, 'metric-home-01', 'metric-item-02', 'Local SQLite Commit Latency', '< 2', 'ms'),
  (3, 'metric-home-01', 'metric-item-03', 'Per-Seat Cloud SaaS Tax', '0', '$'),
  (4, 'metric-home-01', 'metric-item-04', 'Air-Gapped Sovereign Readiness', '100', '%');

-- D: Home FAQ Block
INSERT INTO pages_blocks_faq_block (_order, _parent_id, _path, id, heading, block_name)
VALUES (
  3,
  1,
  'layout',
  'faq-home-01',
  'Frequently Asked Questions',
  'FAQ Section'
);

INSERT INTO pages_blocks_faq_block_items (_order, _parent_id, id, question, answer)
VALUES
  (1, 'faq-home-01', 'faq-item-01', 'How does offline-first register sync work?', 'Terminals write instantly to local SQLite in under 2ms. When internet connectivity returns, transactions reconcile automatically via cryptographic CRDT streams without operator intervention.'),
  (2, 'faq-home-01', 'faq-item-02', 'Can we self-host on our existing hardware?', 'Yes. Stack & Scale ships as lightweight immutable Docker containers that run on standard mini-PCs, Intel NUCs, or private cloud VPCs with zero proprietary hardware lock-in.'),
  (3, 'faq-home-01', 'faq-item-03', 'Is there any per-seat or per-terminal monthly fee?', 'No. You own the software and pay zero per-seat licensing fees, eliminating recurring subscription inflation as your store count expands.');

-- E: About Page
INSERT INTO pages (id, title, slug, seo_meta_title, seo_meta_description, _status, updated_at, created_at)
VALUES (
  2,
  'About Us',
  'about',
  'About Us | Stack & Scale',
  'Our mission is to build robust, sovereign software for businesses that operate in the physical world.',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  _status = EXCLUDED._status,
  updated_at = NOW();

-- F: Contact Page
INSERT INTO pages (id, title, slug, seo_meta_title, seo_meta_description, _status, updated_at, created_at)
VALUES (
  3,
  'Contact',
  'contact',
  'Contact & Project Discovery | Stack & Scale',
  'Discuss your retail POS, edge infrastructure, or warehouse automation project with our engineering team.',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  _status = EXCLUDED._status,
  updated_at = NOW();

-- 5. NAVIGATION
INSERT INTO navigation (id, updated_at, created_at)
VALUES (1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Clean existing items for navigation 1 before re-inserting
DELETE FROM navigation_items WHERE _parent_id = 1;

-- Menu Item 1: Product (has children)
INSERT INTO navigation_items (_order, _parent_id, id, label, link_type, url)
VALUES (1, 1, 'nav-item-prod', 'Product', 'external', '/products');

INSERT INTO navigation_items_children (_order, _parent_id, id, label, link_type, url)
VALUES
  (1, 'nav-item-prod', 'nav-child-pos', 'Retail POS & Edge Sync', 'external', '/products/retail-operations'),
  (2, 'nav-item-prod', 'nav-child-wf', 'Workflow Automation Hub', 'external', '/products/workflow-automation'),
  (3, 'nav-item-prod', 'nav-child-cloud', 'Sovereign Cloud Deploy', 'external', '/products/cloud-infrastructure');

-- Menu Item 2: Resources (has children)
INSERT INTO navigation_items (_order, _parent_id, id, label, link_type, url)
VALUES (2, 1, 'nav-item-res', 'Resources', 'external', '/resources');

INSERT INTO navigation_items_children (_order, _parent_id, id, label, link_type, url)
VALUES
  (1, 'nav-item-res', 'nav-child-docs', 'Documentation & Guides', 'external', '/resources/docs'),
  (2, 'nav-item-res', 'nav-child-arch', 'Architecture Explorer', 'external', '/resources/architecture'),
  (3, 'nav-item-res', 'nav-child-ops', 'Incident & Operations Manual', 'external', '/resources/operations');

-- Menu Item 3: Customers
INSERT INTO navigation_items (_order, _parent_id, id, label, link_type, url)
VALUES (3, 1, 'nav-item-cust', 'Customers', 'external', '/work');

-- Menu Item 4: Pricing
INSERT INTO navigation_items (_order, _parent_id, id, label, link_type, url)
VALUES (4, 1, 'nav-item-price', 'Pricing', 'external', '/#pricing');

-- Menu Item 5: Cloud Apps
INSERT INTO navigation_items (_order, _parent_id, id, label, link_type, url)
VALUES (5, 1, 'nav-item-cloud', 'Cloud Apps', 'external', '/cloud');

-- Menu Item 6: Contact
INSERT INTO navigation_items (_order, _parent_id, id, label, link_type, url)
VALUES (6, 1, 'nav-item-contact', 'Contact', 'external', '/#contact');

-- 6. DRAFT/LATEST VERSIONS (Required for Payload CMS Admin list views)
INSERT INTO _pages_v (id, parent_id, version_title, version_slug, version_seo_meta_title, version_seo_meta_description, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'Home', 'home', 'Software for real operations | Stack & Scale', 'Keep registers scanning and orders moving even when your internet drops. Stack & Scale runs on your own hardware, syncs in milliseconds, and eliminates per-seat SaaS bills.', 'published', NOW(), NOW(), true),
  (2, 2, 'About Us', 'about', 'About Us | Stack & Scale', 'Our mission is to build robust, sovereign software for businesses that operate in the physical world.', 'published', NOW(), NOW(), true),
  (3, 3, 'Contact', 'contact', 'Contact & Project Discovery | Stack & Scale', 'Discuss your retail POS, edge infrastructure, or warehouse automation project with our engineering team.', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version__status = EXCLUDED.version__status,
  latest = true;

INSERT INTO _products_v (id, parent_id, version_title, version_slug, version_tagline, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'Retail POS & Edge Sync', 'retail-operations', 'Offline-first shop floor register with SQLite local sync and <2ms barcode scan latency', 'published', NOW(), NOW(), true),
  (2, 2, 'Workflow Automation Hub', 'workflow-automation', 'Resilient event-driven automation engine connecting inventory to CRM', 'published', NOW(), NOW(), true),
  (3, 3, 'Sovereign Cloud Deploy', 'cloud-infrastructure', 'Private VPC and air-gapped on-premise infrastructure without SaaS taxes', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version_tagline = EXCLUDED.version_tagline,
  version__status = EXCLUDED.version__status,
  latest = true;

INSERT INTO _services_v (id, parent_id, version_title, version_slug, version_summary, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'Edge Architecture Advisory', 'edge-architecture', 'Design edge networks that survive severe connectivity blackouts without downtime', 'published', NOW(), NOW(), true),
  (2, 2, 'Turnkey Retail Rollout', 'turnkey-rollout', 'Full hardware provisioning, barcode integration, and staff on-boarding', 'published', NOW(), NOW(), true),
  (3, 3, 'Sovereignty Migration', 'sovereignty-migration', 'Eliminate recurring per-seat SaaS tax by bringing operations onto owned servers', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version_summary = EXCLUDED.version_summary,
  version__status = EXCLUDED.version__status,
  latest = true;

-- 7. FAQS
INSERT INTO faqs (id, question, answer, category, "order", _status, updated_at, created_at)
VALUES
  (1, 'Can I deploy Stack & Scale on my own VPC or bare-metal servers?', 'Yes. Stack & Scale is 100% self-hosted and sovereign. You can run it on your own hardware, Hetzner, AWS, GCP, Azure, or any Kubernetes cluster using our standard Docker Compose configurations. You retain full cryptographic control of all data.', 'Deployment', 1, 'published', NOW(), NOW()),
  (2, 'How does the point-of-sale terminal handle internet outages?', 'Our POS runtime runs an embedded local SQLite engine on each physical terminal. All transactions, receipts, and inventory changes write to local disk instantly. When internet connectivity returns, our automated delta engine synchronizes records with central PostgreSQL using idempotent conflict resolution.', 'Architecture', 2, 'published', NOW(), NOW()),
  (3, 'Are there per-seat or per-user monthly subscription fees?', 'No. Unlike legacy enterprise SaaS platforms that charge $150–$250 per user per month, Stack & Scale offers unlimited staff and client access under your deployment. You never pay arbitrary user-count penalties.', 'Pricing', 3, 'published', NOW(), NOW()),
  (4, 'How does Keycloak Single Sign-On integrate with our existing directory?', 'Keycloak natively bridges with Active Directory, Azure AD, Okta, Google Workspace, and SAML 2.0 / LDAP directories. We configure PKCE OIDC endpoints with hardware security key (FIDO2 / WebAuthn) support out of the box.', 'Security', 4, 'published', NOW(), NOW()),
  (5, 'How does ClamAV file sandboxing work for client uploads?', 'Every document, invoice, and asset uploaded via the portal or staff workspace is routed through a dedicated ClamAV daemon mirror. The file is inspected for malware signatures before being written to private encrypted MinIO object storage.', 'Security', 5, 'published', NOW(), NOW()),
  (6, 'What kind of support and service level agreements (SLAs) are available?', 'We provide dedicated enterprise partnership options with 24/7 incident response, guaranteed 99.999% uptime SLAs, custom module engineering, and hands-on migration assistance from legacy ERP and POS monoliths.', 'Operations', 6, 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  category = EXCLUDED.category,
  "order" = EXCLUDED."order",
  _status = EXCLUDED._status,
  updated_at = NOW();

INSERT INTO _faqs_v (id, parent_id, version_question, version_answer, version_category, version_order, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'Can I deploy Stack & Scale on my own VPC or bare-metal servers?', 'Yes. Stack & Scale is 100% self-hosted and sovereign. You can run it on your own hardware, Hetzner, AWS, GCP, Azure, or any Kubernetes cluster using our standard Docker Compose configurations. You retain full cryptographic control of all data.', 'Deployment', 1, 'published', NOW(), NOW(), true),
  (2, 2, 'How does the point-of-sale terminal handle internet outages?', 'Our POS runtime runs an embedded local SQLite engine on each physical terminal. All transactions, receipts, and inventory changes write to local disk instantly. When internet connectivity returns, our automated delta engine synchronizes records with central PostgreSQL using idempotent conflict resolution.', 'Architecture', 2, 'published', NOW(), NOW(), true),
  (3, 3, 'Are there per-seat or per-user monthly subscription fees?', 'No. Unlike legacy enterprise SaaS platforms that charge $150–$250 per user per month, Stack & Scale offers unlimited staff and client access under your deployment. You never pay arbitrary user-count penalties.', 'Pricing', 3, 'published', NOW(), NOW(), true),
  (4, 4, 'How does Keycloak Single Sign-On integrate with our existing directory?', 'Keycloak natively bridges with Active Directory, Azure AD, Okta, Google Workspace, and SAML 2.0 / LDAP directories. We configure PKCE OIDC endpoints with hardware security key (FIDO2 / WebAuthn) support out of the box.', 'Security', 4, 'published', NOW(), NOW(), true),
  (5, 5, 'How does ClamAV file sandboxing work for client uploads?', 'Every document, invoice, and asset uploaded via the portal or staff workspace is routed through a dedicated ClamAV daemon mirror. The file is inspected for malware signatures before being written to private encrypted MinIO object storage.', 'Security', 5, 'published', NOW(), NOW(), true),
  (6, 6, 'What kind of support and service level agreements (SLAs) are available?', 'We provide dedicated enterprise partnership options with 24/7 incident response, guaranteed 99.999% uptime SLAs, custom module engineering, and hands-on migration assistance from legacy ERP and POS monoliths.', 'Operations', 6, 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_question = EXCLUDED.version_question,
  version_answer = EXCLUDED.version_answer,
  version_category = EXCLUDED.version_category,
  version_order = EXCLUDED.version_order,
  version__status = EXCLUDED.version__status,
  latest = true;

-- 8. TESTIMONIALS
INSERT INTO testimonials (id, quote, author_name, author_role, company, _status, updated_at, created_at)
VALUES
  (1, 'We migrated 45 retail stores off legacy monolithic POS systems to Stack & Scale. Our inventory sync dropped from 12 minutes to under 80 milliseconds, and we haven''t had a single register crash during network outages.', 'Elena Rostova', 'VP of Engineering', 'Apex Global Retail', 'published', NOW(), NOW()),
  (2, 'Having our entire database, Keycloak SSO, and MinIO storage self-hosted within our sovereign VPC gave our audit committee 100% confidence. No per-seat penalties, no cloud vendor lock-in.', 'Marcus Vance', 'Chief Technology Officer', 'Vanguard Autonomous Labs', 'published', NOW(), NOW()),
  (3, 'The automated CRM routing and WhatsApp dispatch replaced three fragmented SaaS tools. Our operations staff now handles twice the freight volume with zero operational confusion.', 'Dr. Julian Weber', 'Head of Operations', 'Nexus Logistics GmbH', 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  quote = EXCLUDED.quote,
  author_name = EXCLUDED.author_name,
  author_role = EXCLUDED.author_role,
  company = EXCLUDED.company,
  _status = EXCLUDED._status,
  updated_at = NOW();

INSERT INTO _testimonials_v (id, parent_id, version_quote, version_author_name, version_author_role, version_company, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'We migrated 45 retail stores off legacy monolithic POS systems to Stack & Scale. Our inventory sync dropped from 12 minutes to under 80 milliseconds, and we haven''t had a single register crash during network outages.', 'Elena Rostova', 'VP of Engineering', 'Apex Global Retail', 'published', NOW(), NOW(), true),
  (2, 2, 'Having our entire database, Keycloak SSO, and MinIO storage self-hosted within our sovereign VPC gave our audit committee 100% confidence. No per-seat penalties, no cloud vendor lock-in.', 'Marcus Vance', 'Chief Technology Officer', 'Vanguard Autonomous Labs', 'published', NOW(), NOW(), true),
  (3, 3, 'The automated CRM routing and WhatsApp dispatch replaced three fragmented SaaS tools. Our operations staff now handles twice the freight volume with zero operational confusion.', 'Dr. Julian Weber', 'Head of Operations', 'Nexus Logistics GmbH', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_quote = EXCLUDED.version_quote,
  version_author_name = EXCLUDED.version_author_name,
  version_author_role = EXCLUDED.version_author_role,
  version_company = EXCLUDED.version_company,
  version__status = EXCLUDED.version__status,
  latest = true;

-- 9. INDUSTRIES
INSERT INTO industries (id, title, slug, _status, updated_at, created_at)
VALUES
  (1, 'Retail & Offline Point-of-Sale', 'retail-pos', 'published', NOW(), NOW()),
  (2, 'Warehouse & Event-Driven Logistics', 'warehouse-logistics', 'published', NOW(), NOW()),
  (3, 'Autonomous Infrastructure & Edge Energy', 'autonomous-energy', 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  _status = EXCLUDED._status,
  updated_at = NOW();

INSERT INTO _industries_v (id, parent_id, version_title, version_slug, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'Retail & Offline Point-of-Sale', 'retail-pos', 'published', NOW(), NOW(), true),
  (2, 2, 'Warehouse & Event-Driven Logistics', 'warehouse-logistics', 'published', NOW(), NOW(), true),
  (3, 3, 'Autonomous Infrastructure & Edge Energy', 'autonomous-energy', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version__status = EXCLUDED.version__status,
  latest = true;

-- 10. CAREERS
INSERT INTO careers (id, title, slug, location, employment_type, is_open, _status, updated_at, created_at)
VALUES
  (1, 'Senior Distributed Systems Engineer (Edge POS)', 'senior-distributed-systems-engineer', 'Remote (Global)', 'full-time', true, 'published', NOW(), NOW()),
  (2, 'Lead Infrastructure & Cloud Architect', 'lead-infrastructure-architect', 'Berlin / Remote', 'full-time', true, 'published', NOW(), NOW()),
  (3, 'Retail Automation Solutions Engineer', 'retail-automation-solutions-engineer', 'London / Hybrid', 'full-time', true, 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  location = EXCLUDED.location,
  employment_type = EXCLUDED.employment_type,
  is_open = EXCLUDED.is_open,
  _status = EXCLUDED._status,
  updated_at = NOW();

INSERT INTO _careers_v (id, parent_id, version_title, version_slug, version_location, version_employment_type, version_is_open, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'Senior Distributed Systems Engineer (Edge POS)', 'senior-distributed-systems-engineer', 'Remote (Global)', 'full-time', true, 'published', NOW(), NOW(), true),
  (2, 2, 'Lead Infrastructure & Cloud Architect', 'lead-infrastructure-architect', 'Berlin / Remote', 'full-time', true, 'published', NOW(), NOW(), true),
  (3, 3, 'Retail Automation Solutions Engineer', 'retail-automation-solutions-engineer', 'London / Hybrid', 'full-time', true, 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version_location = EXCLUDED.version_location,
  version_employment_type = EXCLUDED.version_employment_type,
  version_is_open = EXCLUDED.version_is_open,
  version__status = EXCLUDED.version__status,
  latest = true;

-- 11. PROJECTS
INSERT INTO projects (id, title, slug, client_name, industry_id, testimonial_quote, testimonial_author, _status, updated_at, created_at)
VALUES
  (1, '45-Store Offline-First POS Migration', 'pos-migration', 'Apex Global Retail', 1, 'Our inventory sync dropped from 12 minutes to under 80 milliseconds.', 'Elena Rostova', 'published', NOW(), NOW()),
  (2, 'Zero-Downtime Telemetry Gateway', 'telemetry-gateway', 'Vanguard Autonomous Labs', 3, 'No per-seat penalties, no cloud vendor lock-in.', 'Marcus Vance', 'published', NOW(), NOW()),
  (3, 'Omnichannel WhatsApp Order Dispatch', 'order-dispatch', 'Nexus Logistics GmbH', 2, 'Our staff now handles twice the freight volume with zero operational confusion.', 'Dr. Julian Weber', 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  client_name = EXCLUDED.client_name,
  industry_id = EXCLUDED.industry_id,
  testimonial_quote = EXCLUDED.testimonial_quote,
  testimonial_author = EXCLUDED.testimonial_author,
  _status = EXCLUDED._status,
  updated_at = NOW();

INSERT INTO _projects_v (id, parent_id, version_title, version_slug, version_client_name, version_industry_id, version_testimonial_quote, version_testimonial_author, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, '45-Store Offline-First POS Migration', 'pos-migration', 'Apex Global Retail', 1, 'Our inventory sync dropped from 12 minutes to under 80 milliseconds.', 'Elena Rostova', 'published', NOW(), NOW(), true),
  (2, 2, 'Zero-Downtime Telemetry Gateway', 'telemetry-gateway', 'Vanguard Autonomous Labs', 3, 'No per-seat penalties, no cloud vendor lock-in.', 'Marcus Vance', 'published', NOW(), NOW(), true),
  (3, 3, 'Omnichannel WhatsApp Order Dispatch', 'order-dispatch', 'Nexus Logistics GmbH', 2, 'Our staff now handles twice the freight volume with zero operational confusion.', 'Dr. Julian Weber', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version_client_name = EXCLUDED.version_client_name,
  version_industry_id = EXCLUDED.version_industry_id,
  version_testimonial_quote = EXCLUDED.version_testimonial_quote,
  version_testimonial_author = EXCLUDED.version_testimonial_author,
  version__status = EXCLUDED.version__status,
  latest = true;

-- 12. RESOURCES
INSERT INTO resources (id, title, slug, type, _status, updated_at, created_at)
VALUES
  (1, 'The Sovereign Retail Architecture Blueprint', 'sovereign-retail-architecture', 'whitepaper', 'published', NOW(), NOW()),
  (2, 'Local SQLite Replication & Offline POS Sync Guide', 'sqlite-pos-sync-guide', 'guide', 'published', NOW(), NOW()),
  (3, 'Keycloak SSO & FIDO2 WebAuthn Hardening Manual', 'keycloak-sso-hardening', 'article', 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  type = EXCLUDED.type,
  _status = EXCLUDED._status,
  updated_at = NOW();

INSERT INTO _resources_v (id, parent_id, version_title, version_slug, version_type, version__status, created_at, updated_at, latest)
VALUES
  (1, 1, 'The Sovereign Retail Architecture Blueprint', 'sovereign-retail-architecture', 'whitepaper', 'published', NOW(), NOW(), true),
  (2, 2, 'Local SQLite Replication & Offline POS Sync Guide', 'sqlite-pos-sync-guide', 'guide', 'published', NOW(), NOW(), true),
  (3, 3, 'Keycloak SSO & FIDO2 WebAuthn Hardening Manual', 'keycloak-sso-hardening', 'article', 'published', NOW(), NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  version_title = EXCLUDED.version_title,
  version_slug = EXCLUDED.version_slug,
  version_type = EXCLUDED.version_type,
  version__status = EXCLUDED.version__status,
  latest = true;

COMMIT;

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

COMMIT;

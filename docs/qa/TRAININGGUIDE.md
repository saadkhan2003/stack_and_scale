Stack & Scale — End-to-End Platform Operations & Training Manual
This comprehensive guide explains the complete lifecycle of how business data flows through Stack & Scale, and provides a step-by-step walkthrough for you and your team members to enter real client data.

1. High-Level Lifecycle & Dataflow Architecture
mermaid
flowchart TD
    subgraph STAGE1["Stage 1: Lead Capture"]
        C["Real Client Prospect"] -->|Fills Contact Form| W["Public Web<br/><code>stackandscale.org/contact</code>"]
        W -->|POST /api/leads| API["Platform API<br/><code>platform.leads</code>"]
    end
    subgraph STAGE2["Stage 2: Staff CRM Triage & Conversion"]
        API --> S["Staff CRM Inbox<br/><code>stackandscale.org/staff/leads</code>"]
        TS["Talha Shams"] -->|Logs in via Keycloak SSO| S
        TS -->|Qualifies Lead & Adds Notes| S
        TS -->|Converts Lead| OPP["Commercial Opportunity<br/><code>platform.opportunities</code>"]
        TS -->|Generates Proposal| PROP["Proposal & Line Items<br/><code>platform.proposals</code>"]
    end
    subgraph STAGE3["Stage 3: Client Portal & Contract"]
        PROP --> CP["Client Portal<br/><code>/portal/[orgId]</code>"]
        HK["Hanzala Khan"] -->|Invites Client Contact| CP
        CP -->|Digital E-Signature| SIGN["Signed Contract & Milestone"]
        CP -->|Uploads Specs & Assets| MINIO["MinIO S3 Vault<br/>(Scanned by ClamAV)"]
    end
    subgraph STAGE4["Stage 4: Infrastructure & Telemetry"]
        MK["Mehran Khan"] -->|Monitors Telemetry| GRAF["Grafana & Loki<br/><code>localhost:3001</code>"]
        MK -->|Runs Automated Backups| BAK["Encrypted SQL Snapshots<br/><code>/opt/stack-and-scale/backup</code>"]
    end
2. Team Member Role Matrix
Team Member	Functional Role	Primary Surface	Responsibilities
Muhammad Saad Khan	Growth, Marketing & CMS Lead	stackandscale.org
cms.stackandscale.org/admin	Publishing case studies, SEO articles, verifying lead intake forms and marketing funnels.
Talha Shams	Staff Operations & CRM Lead	stackandscale.org/staff	Single Sign-On (SSO), qualifying inbound leads, logging calls/tasks, creating commercial proposals and pricing tiers.
Hanzala Khan	Client Success & Storage Lead	stackandscale.org/portal/...
stackandscale.org/account/...	Managing client onboarding, project milestone delivery, digital signature verification, and secure S3 file vaulting.
Mehran Khan	Platform Reliability & Security	identity.stackandscale.org
Grafana / VPS SSH	Keycloak IAM administration, TLS edge protection, system metric audits, malware alert monitoring, and database backups.
3. Step-by-Step Real Data Entry Playbook
Follow these steps to take a prospective client from their first website visit to an active contract:

Step 1: Inbound Lead Capture (Muhammad Saad Khan / Marketing)
When a new prospective client reaches out:

Navigate to the contact page: https://stackandscale.org/contact
In the Get in Touch form, input the prospect's details:
Full Name: (e.g., Sarah Jenkins)
Work Email: (e.g., sarah.jenkins@fintechglobal.io)
Company: (e.g., FinTech Global Systems)
Project Budget: Select range (e.g., $25,000 – $50,000)
Message / Requirements: Enter project details (e.g., Need core transaction orchestration pipeline built on PostgreSQL and Node.js with high throughput.)
Click Send Message.
Behind the Scenes:
The frontend issues an encrypted POST request to https://api.stackandscale.org/api/leads.
The record is written to the platform.leads table with a initial status of new.
An event is queued in platform.outbox_events to notify the team.
Step 2: Keycloak SSO Authentication & Lead Triage (Talha Shams / CRM)
Open https://stackandscale.org/staff.
If not already authenticated, the system redirects to Keycloak IAM (https://identity.stackandscale.org):
Username: talhashams
Password: StackScale2026!#Talha
Upon login, open the Leads Pipeline (/staff/leads).
Reviewing the Lead:
Click on the new lead card (Sarah Jenkins — FinTech Global Systems).
The Lead 360 Drawer opens on the right side of the screen.
Updating Status & Adding Activity:
Change Status from new $\rightarrow$ contacted $\rightarrow$ qualified.
Click Add Note: Type notes from your discovery call (e.g., Discovery call completed. Client requires Q4 delivery with SOC2 compliance.).
Click Add Task: Assign a follow-up action (e.g., Draft architecture proposal by Tuesday).
Step 3: Opportunity Conversion & Proposal Creation (Talha Shams / CRM)
Once the lead is qualified:

Inside the Lead 360 Drawer, click Convert to Opportunity.
Enter the commercial terms:
Opportunity Title: FinTech Global - Cloud Infrastructure Modernization
Estimated Value: $45,000 USD
Target Close Date: Select date
Once converted, navigate to /staff/proposals and click New Proposal:
Client Name: FinTech Global Systems
Scope Overview: Enterprise Backend Architecture & Security Lockdown
Add Line Items:
Line Item 1: Cloud Architecture & Core API Gateway Setup — $20,000
Line Item 2: Database Schema Partitioning & Outbox Messaging — $15,000
Line Item 3: Keycloak IAM Federation & ClamAV File Vault — $10,000
Click Publish Proposal. The system automatically provisions the organization ID and generates a secure portal link.
Step 4: Client Portal Onboarding & Contract E-Signature (Hanzala Khan)
Navigate to the generated Client Portal URL:
https://stackandscale.org/portal/[clientOrganizationId]
Reviewing Milestones:
The client views the approved proposal, project milestones, and deliverables.
Digital Acceptance & Signature:
The client (or account manager during the review call) reviews the agreement terms.
Types their full legal name in the digital signature field.
Clicks Approve & Sign Agreement.
The system updates the contract status to Signed and generates an invoice reference for accounting.
Step 5: Secure File Vaulting & Antivirus Verification (Hanzala Khan)
When exchanging confidential architecture specifications, NDA documents, or design tokens:

Inside the Client Portal, switch to the Deliverables & Files tab.
Click Upload File and select the document (e.g., fintech-global-spec.pdf).
Behind the Scenes:
The file is streamed to the private MinIO S3 bucket (stack-and-scale-private).
Before persistence, the ClamAV daemon intercepts the byte stream via chunked scanning.
If clean, the file receives an SHA-256 integrity hash and becomes downloadable.
If malware is detected (e.g., EICAR test signature), ClamAV quarantines the file immediately, aborts the upload, and emits a security alert to Loki.
Step 6: Platform Health, Telemetry & Disaster Recovery (Mehran Khan)
Mehran Khan verifies that the production host remains resilient and secure:

Host Metrics via Grafana:
Open an SSH tunnel to the VPS:
bash
ssh -L 3001:localhost:3000 ubuntu@51.195.136.215
Open http://localhost:3001 in the browser.
Login with Grafana admin credentials.
Review CPU utilization (< 15%), RAM consumption (< 40%), and active container liveness.
Log Stream Telemetry via Loki:
In Grafana Explore, query application log streams:
logql
{container="stack-and-scale-production-api-1"} |= "lead.created"
Database Disaster Recovery Snapshots:
Verified automated daily cron dumps stored in /opt/stack-and-scale/backup.
Manual snapshot command whenever needed:
bash
ssh ubuntu@51.195.136.215 "docker exec stack-and-scale-production-postgres-1 pg_dump -U stack_and_scale stack_and_scale > /opt/stack-and-scale/backup/manual_$(date +%Y%m%d_%H%M%S).sql"
4. Where Real Data is Stored
Data Category	Target Store / Table	Access Method
Inbound Leads, Opportunities, Proposals	PostgreSQL platform schema (leads, opportunities, proposals, proposal_line_items)	Staff CRM (/staff/...) & NestJS API
Client Organizations & Milestones	PostgreSQL portal schema (client_organizations, project_milestones, signatures)	Client Portal (/portal/...)
User Authentication & Realm Roles	Keycloak IAM PostgreSQL (keycloak database, user_entity, user_role_mapping)	https://identity.stackandscale.org
Contracts, Invoices, Uploaded Assets	MinIO Encrypted S3 (stack-and-scale-private bucket)	Client Portal & API S3 Pre-signed URLs
Articles, SEO Metadata, Blog Content	Payload CMS PostgreSQL (cms schema)	https://cms.stackandscale.org/admin
5. First Real Customer Test Practice
To test the system and familiarize your team with the workflow:

text
1. [Saad]     Submit a live test lead on https://stackandscale.org/contact
              Name: "Enterprise Test Partner"
              Email: "partner@example.com"
2. [Talha]    Open https://stackandscale.org/staff/leads, open the drawer, and set status to Qualified.
3. [Talha]    Click "Convert to Opportunity" -> Value: $10,000 -> Create Proposal.
4. [Hanzala]  Open the generated Portal URL and inspect the contract view.
5. [Mehran]   Verify the new record exists in Postgres and monitor log stream in Loki.
This ensures complete operational alignment across marketing, sales, client delivery, and infrastructure.
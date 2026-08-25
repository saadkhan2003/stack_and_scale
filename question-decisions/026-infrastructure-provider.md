# Question 026 — Infrastructure provider

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which hosting direction should be used from the start?

## Your chosen direction

Use Hetzner-first infrastructure from day one.

## Why this was chosen

Hetzner provides suitable European infrastructure, cost control and container flexibility for the approved architecture.

## Why it is a strong fit

- Predictable infrastructure cost
- Strong control over deployment
- Supports Germany/EU data placement

## Tradeoffs and safeguards

The team accepts more operational responsibility than with a fully managed application platform.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 26 — Hosting and infrastructure philosophy

Because you want this to become a serious production platform, we should decide whether we optimize for convenience or infrastructure independence.

**A. Vercel-first**
Fastest Next.js deployment, previews, CDN, serverless functions, easy DX.

**B. Cloudflare-heavy**
Cloudflare DNS/CDN/WAF, R2 for media, potentially Workers where useful, while apps can run elsewhere.

**C. Container-first / cloud-independent**
Dockerize the apps and run them on DigitalOcean, AWS, Hetzner, etc. Easier to move providers later.

**D. Hybrid — recommended**
Use modern managed services where they give us real value, but don't architect the system so Vercel or any single vendor becomes impossible to leave.

For example:

```text
Cloudflare
├── DNS
├── CDN
├── WAF
└── R2 media

        ↓

Applications
├── www.company.com
├── admin.company.com
├── portal.company.com
└── account.company.com

        ↓

Container-compatible deployments

        ↓

PostgreSQL
Redis when needed
Object storage
Background jobs
```

We could initially deploy the marketing site somewhere convenient like Vercel while keeping Payload/PostgreSQL/media portable.

That means if the company grows and you later want:

```text
AWS
DigitalOcean
Hetzner
Google Cloud
Azure
```

we aren't rebuilding the application.

For your goal, I recommend **D — hybrid and portable**.

Do you want to lock **D**?

#### Your response

> i will use hetzner from start

#### Explanation or resolution

Perfect — then **Question 26 is locked as Hetzner-first from day one**.

I would actually prefer this for your project because it matches your goal of owning the infrastructure instead of becoming dependent on Vercel-specific deployment patterns.

A strong starting architecture would be:

```text
Internet
   │
Cloudflare
├── DNS
├── CDN
├── WAF / bot protection
└── R2 for media
   │
   ▼
Hetzner
   │
   ├── www.company.com
   │      Next.js marketing website
   │
   ├── admin.company.com
   │      Payload CMS
   │
   ├── portal.company.com
   │      Client portal
   │
   └── account.company.com
          Product customer portal
```

Behind those apps:

```text
Hetzner Infrastructure

┌─────────────────────────────────────┐
│ Reverse Proxy                       │
│ Caddy / Traefik / Nginx             │
└──────────────────┬──────────────────┘
                   │
       ┌───────────┼────────────┐
       │           │            │
       ▼           ▼            ▼
      www        admin       portal/account
    Next.js      Payload        Next.js

                   │
       ┌───────────┼──────────────┐
       ▼           ▼              ▼
 PostgreSQL      Redis        Background jobs
                              when required

Media
   ↓
Cloudflare R2
```

And I would **containerize the applications from the beginning**:

```text
Docker
├── web
├── cms
├── portal
├── account
├── worker
├── postgres
└── redis
```

Not because we need seven servers immediately. We don't.

For the first version, we could run several services on a sensibly sized Hetzner machine while keeping proper boundaries. When traffic grows, individual pieces can move onto separate servers.

For example, initially:

```text
SERVER 1
├── Next.js website
├── Payload
├── PostgreSQL
├── Redis
└── reverse proxy
```

Later:

```text
SERVER 1
Web applications

SERVER 2
Payload / APIs / workers

SERVER 3
PostgreSQL

Object Storage
R2
```

And much later, if justified:

```text
Load Balancer
      │
 ┌────┴────┐
App 1    App 2
 │          │
 └────┬─────┘
      │
 PostgreSQL
 primary/replica
```

The architecture should **scale progressively**, not start as an unnecessary Kubernetes cluster.

I would explicitly **not use Kubernetes at the beginning**. Docker + a good reverse proxy + automated CI/CD + backups + monitoring is more appropriate. Kubernetes can come later only if your operational scale actually demands it.

And GitHub can drive deployment:

```text
Developer pushes code
        ↓
GitHub
        ↓
CI
├── lint
├── typecheck
├── unit tests
├── integration tests
├── Playwright
└── build
        ↓
Docker image
        ↓
deploy to Hetzner
        ↓
health check
        ↓
production
```

We should also architect for:

```text
production
staging
local development
```

rather than developers making changes directly against production.

So something like:

```text
www.company.com
Production

staging.company.com
Staging

admin.company.com
Production CMS

admin-staging.company.com
Staging CMS
```

with completely separate production and staging databases.

That is much closer to a genuine production software-company setup.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

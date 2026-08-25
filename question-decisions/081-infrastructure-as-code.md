# Question 081 — Infrastructure as code

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should infrastructure be created and changed?

## Your chosen direction

Manage Docker-based Hetzner infrastructure through OpenTofu/Terraform-compatible code and automation.

## Why this was chosen

The environment must be reproducible, reviewable and recoverable without depending on undocumented manual server configuration.

## Why it is a strong fit

- Repeatable infrastructure
- Disaster-recovery support
- Traceable changes

## Tradeoffs and safeguards

State management, provider limitations and secret separation require operational discipline.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 81 — Infrastructure as Code (IaC)

Since we selected Hetzner, Docker, production monitoring, backups, and GitOps workflow, we need to decide how infrastructure is managed.

Options:

### A. Manual server setup

SSH into server and configure everything manually.

❌ Not recommended.

---

### B. Docker Compose + documented setup

Example:

```text
Server

Docker Compose

├── Website
├── Backend
├── PostgreSQL
├── Redis
├── Payload CMS
└── Monitoring
```

Good for starting.

---

### C. Infrastructure as Code

Use tools like:

- OpenTofu/Terraform
- Ansible
- Docker
- automated provisioning

Infrastructure becomes code:

```text
infra/

├── servers
├── networking
├── databases
├── storage
├── monitoring
└── deployments
```

A new server can be recreated consistently.

---

### D. Full platform engineering

Everything in C plus:

- Kubernetes
- service mesh
- internal developer platform
- advanced orchestration

Too much for now.

---

My recommendation:

**C — Infrastructure as Code with Docker + OpenTofu/Terraform + automation.**

This matches your goal of building a serious software company, not just a website.

Do you want to lock **C — Infrastructure as Code?**

#### Your response

> C

#### Explanation or resolution

Locked: **Question 81 = C — Infrastructure as Code with Docker + OpenTofu/Terraform + automation.**

This completes the infrastructure philosophy.

The rule:

> Infrastructure should be reproducible, reviewable, and version-controlled — not dependent on one person's server knowledge.

Final infrastructure direction:

```text
Infrastructure Repository

infra/

├── provisioning/
│   ├── Hetzner servers
│   ├── networking
│   ├── firewalls
│   └── access policies
│
├── containers/
│   ├── Dockerfiles
│   ├── Docker Compose
│   └── service definitions
│
├── databases/
│   ├── PostgreSQL
│   ├── Redis
│   └── backup policies
│
├── storage/
│   ├── object storage
│   └── file policies
│
├── monitoring/
│   ├── metrics
│   ├── logs
│   └── alerts
│
└── deployment/
    ├── staging
    └── production
```

---

Deployment flow:

```text
Developer

↓

GitHub Repository

↓

CI/CD Pipeline

↓

Build Docker Images

↓

Run Tests

↓

Deploy Using Infrastructure Definitions

↓

Health Checks

↓

Production
```

---

Server setup becomes repeatable:

Example:

A new production server is required.

Instead of:

```text
SSH manually
Install packages
Configure everything
Hope nothing is missed
```

we do:

```text
Run Infrastructure Code

↓

Server created

↓

Security configured

↓

Docker installed

↓

Services deployed

↓

Monitoring connected

↓

Backups enabled
```

---

Security practices included:

```text
Infrastructure Security

✓ Firewall rules
✓ SSH key authentication
✓ No password login
✓ Secret management
✓ Private networks where needed
✓ Automated updates strategy
✓ Container isolation
✓ Backup encryption
✓ Access logging
```

---

Important decision:

We are **not choosing Kubernetes now**.

Reason:

Kubernetes is powerful, but it adds operational complexity. Your current architecture can scale very far with:

- Docker
- OpenTofu/Terraform
- automated deployments
- good monitoring
- proper architecture

Later, if your products become large enough:

```text
Docker Infrastructure

↓

Kubernetes Platform

```

can be introduced without redesigning the whole system.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

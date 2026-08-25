# Question 096 — Edge architecture

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should domains, delivery and perimeter security work?

## Your chosen direction

Use managed DNS, CDN, TLS, WAF, DDoS protection, caching and basic bot controls, with advanced edge capabilities available later.

## Why this was chosen

An edge layer improves global delivery and reduces direct origin exposure without requiring enterprise networking on day one.

## Why it is a strong fit

- Faster public delivery
- Stronger perimeter protection
- Simpler certificate and DNS operations

## Tradeoffs and safeguards

Caching and proxy rules must never expose private or personalized content.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 96 — Domain, DNS, CDN, and edge security architecture

Now we decide how users reach your services securely.

You currently have:

```text
www.company.com
staff.company.com
portal.company.com
account.company.com
admin.company.com
api.company.com
status.company.com
```

Options:

### A. Basic DNS only

Domain points directly to servers.

Simple, but limited.

---

### B. CDN + DNS + security layer (recommended)

Example:

```text

User

↓

CDN / Edge Layer

↓

Firewall

↓

Load Balancing

↓

Hetzner Servers

```

Provides:

- faster global loading
- DDoS protection
- SSL management
- caching
- security rules

---

### C. Advanced edge architecture

Everything in B plus:

- edge functions
- global routing
- advanced bot protection
- traffic intelligence

---

### D. Enterprise edge platform

Everything in C plus:

- advanced zero-trust network
- private connectivity
- enterprise security controls

---

My recommendation:

**B now + architecture ready for C.**

Use a strong edge layer from the beginning because you want international users later, but avoid unnecessary complexity.

Do you want to lock **B + C-ready edge architecture?**

#### Your response

> for the remaining questions do what is recommended

#### Explanation or resolution

Understood. From this point, I will **lock the recommended option for the remaining questions** unless there is a major tradeoff that needs your decision.

This will keep the process efficient.

---

## Locked: Question 96 — B + C-ready edge architecture

Final decision:

```text
Internet Users

        ↓

CDN + DNS + Security Layer

        ↓

WAF / DDoS Protection

        ↓

Reverse Proxy

        ↓

Hetzner Infrastructure

        ↓

Applications
├── Website
├── Staff Portal
├── Client Portal
├── Account Portal
├── API
└── CMS
```

Capabilities:

### V1

✓ DNS management
✓ SSL certificates
✓ CDN caching
✓ DDoS protection
✓ Firewall rules
✓ Basic bot protection
✓ Security headers

### Future-ready

✓ Edge functions
✓ Advanced routing
✓ Zero-trust access
✓ Global traffic optimization

We avoid overcomplicating with enterprise edge systems now.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

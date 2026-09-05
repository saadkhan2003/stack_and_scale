# Security Policy

> **Stack & Scale Production Platform**  
> **Security Contact:** `security@stackandscale.org`  
> **PGP Key / Fingerprint:** Available upon request for encrypted communications

Stack & Scale takes platform security, customer data confidentiality, and infrastructure hardening seriously. We welcome responsible disclosures from researchers and users to identify and resolve vulnerabilities.

---

## 1. Supported Versions

We provide security patches and dependency updates for the following releases:

| Version | Status | Supported |
| :--- | :--- | :--- |
| **1.0.x (Production)** | Active Release (`main`) | :white_check_mark: Supported |
| **< 1.0.0** | Alpha / Development Milestones | :x: End of Life |

---

## 2. Reporting a Security Vulnerability

If you believe you have discovered a vulnerability, security flaw, or sensitive data exposure on **Stack & Scale** (`stackandscale.org`, `identity.stackandscale.org`, `cms.stackandscale.org`, `api.stackandscale.org`):

1. **Do NOT open a public GitHub issue.** Public issues disclose potential attack vectors before a remediation can be deployed.
2. Email your detailed findings to:
   ```text
   security@stackandscale.org
   ```
3. **Include the following information:**
   - Detailed description of the vulnerability and attack vector.
   - Exact steps or script to reproduce the vulnerability safely.
   - Potential impact (e.g. authentication bypass, privilege escalation, cross-tenant leak).
   - Any indicators of active exploitation if observed.
   - Recommended remediation if known.

---

## 3. Our Response & Remediation SLA

We commit to the following response timeline:

- **Initial Acknowledgement:** Within **24 hours** of receiving your disclosure report.
- **Triage & Severity Confirmation:** Within **48 hours**, including validation of impact.
- **Remediation & Patch Deployment:**
  - **Critical / High (SEV-1):** Within **72 hours** via emergency hotfix.
  - **Medium (SEV-2):** Within **7 business days**.
  - **Low (SEV-3):** Included in next scheduled production release cycle.
- **Public Disclosure:** Coordinated disclosure only after a verified patch is live in production.

---

## 4. Responsible Disclosure & Safe Harbor

When testing Stack & Scale within responsible research guidelines:

- **Do NOT** execute denial of service (DoS/DDoS) attacks against production infrastructure.
- **Do NOT** access, modify, or destroy customer or tenant data.
- **Do NOT** execute social engineering, phishing, or physical attacks against operators.
- **Do NOT** violate the privacy of our team members or active clients.

If you conduct your research in good faith in accordance with this policy, we will not pursue legal action against you and will work collaboratively with you to resolve the issue.

---

## 5. Security Architecture Baseline

Stack & Scale implements defense-in-depth across all operational tiers:

- **Edge:** Cloudflare DDoS mitigation, Web Application Firewall (WAF), TLS 1.3 Full (Strict), HSTS (`max-age=31536000`).
- **Network:** Non-routable private Docker bridge networks; internal ports (`5432`, `9000`, `3310`, `3000`) completely blocked from the public internet.
- **Identity:** Keycloak 26 OIDC with PKCE (S256), cryptographic session validation, and strict RBAC.
- **Storage:** MinIO S3 private object vault with chunked, real-time ClamAV antivirus stream scanning.
- **Database:** PostgreSQL 16 row-level tenant isolation, encrypted snapshots, and parameterized SQL queries.

# QA Runbook — Member 4: Infrastructure, Security & Observability

**Assigned Role:** Infrastructure, Network Perimeter, Observability & Disaster Recovery Tester  
**Primary Target Hosts & Endpoints:**

- Edge Domain: `https://stackandscale.org`
- API Liveness Gateway: `https://api.stackandscale.org/health`
- API Readiness Gateway: `https://api.stackandscale.org/ready`
- Grafana Telemetry: `http://127.0.0.1:3001` (via secure SSH tunnel)
- Prometheus Metrics: `http://127.0.0.1:9090` (internal host scrape)
- VPS Production Host: `ubuntu@vps-5d4dfcb1` (OVHcloud VPS-2)

---

## 1. Architectural Context & Scope

Stack & Scale operates on a hardened **Cost-First Single-Server Production Topology** designed to maximize reliability, performance, and security at minimal operating expenditure ($0 auxiliary cloud cost).

The infrastructure fabric consists of:

- **OVHcloud VPS-2 Host:** 4 vCPU, 4 GB RAM, 50 GB NVMe storage running Ubuntu 24.04 LTS.
- **16 Containerized Microservices:** Isolated into private Docker networks (`frontend`, `backend`, `database`, `storage`, `observability`).
- **Edge Reverse Proxy (Caddy):** Handles TLS termination using Cloudflare Origin CA certificates; external traffic is filtered through Cloudflare's DDoS and WAF edge.
- **Unified Observability Fabric:** Prometheus (metrics collection), Grafana (visualization dashboards), Loki (centralized log indexing), Promtail (log agent), cAdvisor (container telemetry), and Alertmanager (incident routing).
- **Hardened Kernel & Network Boundaries:** Unprivileged user execution, strict capability drops (`cap_drop`), and complete prohibition of host-published database and storage ports.

As Tester 4, you are the systems and reliability engineer. Your mission is to verify that:

1. Internal database, storage, and scanning ports are completely invisible to the public internet.
2. The API rate limiter reliably throttles volumetric traffic spikes.
3. Live container resource consumption conforms to efficiency baselines (< 15% CPU, < 40% RAM).
4. Loki indexes structured application logs and ClamAV scan events.
5. A crashed container automatically self-heals within 10 seconds.
6. The database backup script generates valid, uncorrupted SQL dumps.

---

## 2. Prerequisites & Tooling

- **Local Terminal:** With `ssh`, `curl`, `nc` (netcat), or `nmap` installed.
- **SSH Access to Host:** `ssh ubuntu@vps-5d4dfcb1` (using your authorized deploy key).
- **Web Browser:** To view Grafana dashboards via an encrypted local port forward.
- **Handoff from Member 3:** Ensure Member 3 has completed the Client Portal and ClamAV file upload tests.

---

## 3. Detailed Step-by-Step Test Suites

---

### Test Suite 4.1: Edge Firewall & Network Perimeter Hardening

#### Objective:

Verify that the server perimeter allows inbound traffic ONLY through Cloudflare's TLS proxy (ports 80, 443) and SSH (port 22), while strictly blocking all internal services.

#### Step-by-Step Actions:

##### Part A: Cloudflare SSL/TLS 1.3 Full (strict) Verification

1. From your local terminal, inspect the SSL handshake on the apex domain:
   ```bash
   curl -Iv https://stackandscale.org 2>&1 | grep -i -E "HTTP/|SSL certificate|server:|strict-transport"
   ```
2. **Verify Output Parameters:**
   - **Protocol:** `HTTP/2` or `HTTP/3`.
   - **TLS Version:** `TLSv1.3`.
   - **Server:** `cloudflare`.
   - **HSTS Header:** `strict-transport-security: max-age=31536000; includeSubDomains; preload` is present.
3. Test HTTP to HTTPS redirection:
   ```bash
   curl -I http://stackandscale.org
   ```

   - **Verification:** Returns HTTP **`301 Moved Permanently`** with `Location: https://stackandscale.org/`.

##### Part B: Public Port Scan & Database Denial Test (Critical Security Gate)

1. Determine your VPS public IP address (run `dig +short stackandscale.org` or inspect your host configuration).
2. From your local machine, run netcat connection probes against the internal service ports:

   ```bash
   TARGET_IP="<YOUR_VPS_PUBLIC_IP>"

   echo "--- Testing PostgreSQL Port 5432 ---"
   nc -zv -w 3 "$TARGET_IP" 5432 2>&1 || echo "Port 5432 BLOCKED (Passed)"

   echo "--- Testing MinIO S3 Port 9000 ---"
   nc -zv -w 3 "$TARGET_IP" 9000 2>&1 || echo "Port 9000 BLOCKED (Passed)"

   echo "--- Testing MinIO Console Port 9001 ---"
   nc -zv -w 3 "$TARGET_IP" 9001 2>&1 || echo "Port 9001 BLOCKED (Passed)"

   echo "--- Testing ClamAV Scanner Port 3310 ---"
   nc -zv -w 3 "$TARGET_IP" 3310 2>&1 || echo "Port 3310 BLOCKED (Passed)"

   echo "--- Testing API Internal Port 3000 ---"
   nc -zv -w 3 "$TARGET_IP" 3000 2>&1 || echo "Port 3000 BLOCKED (Passed)"
   ```

3. **Verify Strict Security Results:**
   - Every single test above MUST output `Connection timed out`, `Connection refused`, or `BLOCKED (Passed)`.
   - **Security Failure Condition:** If any of ports 5432, 9000, 9001, 3310, or 3000 respond with `open` or `succeeded`, immediately report a perimeter failure. Only ports 80, 443, and 22 are permitted to be reachable.

---

### Test Suite 4.2: API Liveness, Readiness & Rate Limiting Defense

#### Objective:

Verify API health endpoints and prove that volumetric traffic bursts are dynamically throttled to prevent Denial-of-Service.

#### Step-by-Step Actions:

##### Part A: API Probes

1. Run a request against the liveness probe:
   ```bash
   curl -i https://api.stackandscale.org/health
   ```

   - **Verification:** Status **`200 OK`**, Content-Type `application/json`, payload:
     ```json
     { "status": "ok" }
     ```
2. Run a request against the readiness probe:
   ```bash
   curl -i https://api.stackandscale.org/ready
   ```

   - **Verification:** Status **`200 OK`**. Confirms that the database connection pool, transactional outbox worker, and disk write paths are fully initialized and healthy.

##### Part B: Rate Limiting Abuse Defense Test

1. Execute a rapid burst of 120 HTTP GET requests against the API gateway within 5 seconds:
   ```bash
   for i in {1..120}; do
     curl -s -o /dev/null -w "%{http_code}\n" https://api.stackandscale.org/health
   done | sort | uniq -c
   ```
2. **Analyze the Distribution:**
   - The output will resemble:
     ```text
         60 200
         60 429
     ```
   - **Verification:** Early requests are served normally (`200 OK`). Once the quota is breached, the API immediately throttles excess requests with HTTP **`429 Too Many Requests`**.
3. Inspect the headers of a throttled request:
   ```bash
   curl -i https://api.stackandscale.org/health
   ```

   - **Verification:** Verify presence of the response header: `retry-after: [seconds]`.

---

### Test Suite 4.3: Observability Stack (Prometheus, Grafana, Loki)

#### Objective:

Audit host performance headroom, verify container metrics, and inspect real-time structured logs for ClamAV and API events.

#### Step-by-Step Actions:

##### Part A: Establish Secure Grafana SSH Tunnel

1. In your local terminal, open a port-forwarded SSH session to the VPS:
   ```bash
   ssh -L 3001:127.0.0.1:3001 ubuntu@vps-5d4dfcb1
   ```
2. In your local browser, navigate to: `http://localhost:3001`.
3. Sign in to Grafana:
   - **Username:** `admin`
   - **Password:** Read the password on the VPS:
     ```bash
     sudo cat /opt/stack-and-scale/secrets/grafana-admin-password
     ```

##### Part B: Verify System Resource Telemetry Dashboard

1. Inside Grafana, navigate to **Dashboards** &rarr; **Stack & Scale Platform Overview**.
2. Audit the live performance gauges across the full 16-container stack:
   - **Host CPU Utilization:** Must be below **15%** (typically idling between 4% – 8%).
   - **Host RAM Utilization:** Must be below **40%** (approx. 1.2 GB – 1.6 GB used of 4.0 GB total).
   - **Disk NVMe Usage:** Must be below **35%** (healthy headroom on 50GB drive).
   - **Network I/O:** Smooth baseline with zero abnormal egress spikes.

##### Part C: Prometheus Scrape Targets Audit

1. Open a new terminal tab and inspect Prometheus targets:
   ```bash
   ssh ubuntu@vps-5d4dfcb1 'curl -s http://127.0.0.1:9090/api/v1/targets | grep -o "\"health\":\"[^\"]*\"" | sort | uniq -c'
   ```
2. **Verification:**
   - All targets report `"health":"up"`.
   - Scrape jobs: `api`, `cAdvisor` (container metrics), and `node-exporter` (host metrics) are all green.

##### Part D: Structured Log Verification in Loki

1. In Grafana, click the **Explore** compass icon in the left navigation menu.
2. Ensure the data source is set to **Loki**.
3. **Query 1: Inspect ClamAV Scanning Logs from Member 3's Test:**
   - In the query input, enter:
     ```logql
     {container_name="stack-and-scale-production-clamav-1"}
     ```
   - Click **Run query**:
     - **Verification:** Locate the log entry generated during Member 3's EICAR test:
       `... FOUND: Eicar-Test-Signature`
       Confirming ClamAV caught and logged the malware event.
4. **Query 2: Inspect API Request Stream:**
   - Enter query:
     ```logql
     {container_name="stack-and-scale-production-api-1"} |= "POST /api/leads"
     ```
   - Click **Run query**:
     - **Verification:** Locate the log entry corresponding to Member 1's lead submission for `Alex Mercer`, including response status `201` and execution latency (< 40ms).

---

### Test Suite 4.4: Chaos Drill — Self-Healing Container Auto-Recovery

#### Objective:

Simulate an unexpected container process crash and prove that Docker's process manager resurrects the service with zero downtime for downstream components.

#### Step-by-Step Actions:

1. In your SSH session on the VPS, check the uptime of the live API container:
   ```bash
   docker ps --filter "name=api" --format "table {{.Names}}\t{{.Status}}"
   ```
2. **Simulate a Fatal Container Crash:**
   - Execute an ungraceful kill signal:
     ```bash
     docker kill stack-and-scale-production-api-1
     ```
3. **Observe Automated Docker Resurrection:**
   - Immediately watch the container state:
     ```bash
     for i in {1..8}; do
       docker ps --filter "name=api" --format "{{.Names}}: {{.Status}}"
       sleep 1
     done
     ```
4. **Analyze the Recovery:**
   - Within 2–4 seconds, Docker detects process termination.
   - Per the manifest directive `restart: unless-stopped`, Docker respawns the container.
   - Status transitions to `Up 3 seconds (health: starting)` &rarr; `Up 8 seconds (healthy)`.
5. From your local machine, test the API health probe:
   ```bash
   curl -i https://api.stackandscale.org/health
   ```

   - **Verification:** Returns **`200 OK`**. The system has completely self-healed without manual operator intervention.

---

### Test Suite 4.5: Database Backup Execution & Integrity Verification

#### Objective:

Execute the database snapshot script and verify that the resulting PostgreSQL dump file is uncorrupted, non-empty, and structurally valid.

#### Step-by-Step Actions:

1. In your SSH session on the VPS, navigate to the deployment root:
   ```bash
   cd /opt/stack-and-scale
   ```
2. **Execute the Platform Backup Script:**
   ```bash
   bash scripts/backup.sh
   ```
3. **Inspect the Backup Artifacts:**
   - List the contents of the backup directory:
     ```bash
     ls -lh /opt/stack-and-scale/backup/
     ```
   - Verify a new file exists: `stack_and_scale_backup_YYYYMMDD_HHMMSS.sql.gz` (or `.sql`).
   - Check the file size: **Must be > 500 KB** (confirming real database schema and data are present, not an empty zero-byte stub).
4. **Verify SQL Dump Integrity:**
   - Inspect the file header:
     ```bash
     zcat /opt/stack-and-scale/backup/stack_and_scale_backup_*.sql.gz 2>/dev/null | head -n 25 || head -n 25 /opt/stack-and-scale/backup/*.sql
     ```
   - **Verification:** Header confirms valid PostgreSQL export:
     ```text
     -- PostgreSQL database dump
     -- Dumped from database version 16.x
     -- Dumped by pg_dump version 16.x
     ```
5. Confirm that OVHcloud automated daily VPS snapshots are active in the OVH Cloud Manager dashboard as an independent, secondary host-level disaster recovery safeguard.

---

## 4. Master Team Sign-Off Assembly & Launch Gate

Once all 4 members have completed their respective runbooks and signed their sheets, Member 4 collects the signed checklists and verifies the master sign-off:

```text
================================================================================
STACK & SCALE PRODUCTION LAUNCH SIGN-OFF SUMMARY
================================================================================
Environment: OVHcloud Production Host (vps-5d4dfcb1)
Release Digest / Commit: [Current Git Commit SHA]
Sign-Off Timestamp: [Record UTC Date & Time]

Member 1 (Marketing & CMS):          [ ] APPROVED  (Signature: ________________)
Member 2 (Identity & Staff CRM):     [ ] APPROVED  (Signature: ________________)
Member 3 (Client Portal & Storage):  [ ] APPROVED  (Signature: ________________)
Member 4 (Infra & Observability):    [ ] APPROVED  (Signature: ________________)

FINAL VERDICT: [ ] 100% PRODUCTION READY FOR PUBLIC LAUNCH
================================================================================
```

---

## 5. Official Member 4 Sign-Off Sheet

| Test Case  | Description                                                           | Pass / Fail         | Operator Signature   | Timestamp  |
| ---------- | --------------------------------------------------------------------- | ------------------- | -------------------- | ---------- |
| **TC-4.1** | Cloudflare TLS 1.3 Full (strict) & HSTS response headers confirmed    | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.2** | Internal ports 5432, 9000, 9001, 3310, 3000 completely blocked        | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.3** | API liveness (`/health`) and readiness (`/ready`) return HTTP 200     | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.4** | Rate limiter throttles burst traffic with HTTP 429 & `retry-after`    | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.5** | Grafana host telemetry confirms CPU < 15% and RAM < 40%               | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.6** | Prometheus scrape targets (`api`, `cAdvisor`, `node-exporter`) all UP | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.7** | Loki indexes structured application logs and ClamAV malware alerts    | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.8** | Chaos Drill: killed API container self-heals healthy in < 10 seconds  | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |
| **TC-4.9** | Database backup script produces valid, uncorrupted SQL dump (> 500KB) | [ ] Pass / [ ] Fail | ********\_\_******** | ****\_**** |

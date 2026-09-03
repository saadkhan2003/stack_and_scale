# QA Runbook — Member 4: Infrastructure, Security & Observability

**Assigned Role:** Infrastructure, Network Perimeter, Observability & Disaster Recovery Tester  
**Primary URLs & Targets:**
- Host Domain: `https://stackandscale.org`
- API Health Probe: `https://api.stackandscale.org/health`
- API Readiness Probe: `https://api.stackandscale.org/ready`
- Grafana Telemetry: `http://127.0.0.1:3001` (or via secure SSH tunnel)
- Prometheus Scrapes: `http://127.0.0.1:9090` (internal)
- VPS Host: `ubuntu@vps-5d4dfcb1` (OVHcloud)

---

## Mission Overview
As Tester 4, you are the reliability and systems engineer. Your mission is to verify the infrastructure foundation: confirming that internal database and storage ports are strictly sealed from the internet, testing API rate limits and health probes, auditing container resource metrics in Grafana, proving Alertmanager notification routing, and performing a live container failover drill.

---

## Test Suite 4.1: Edge Firewall & Network Perimeter Hardening

### Step-by-Step Instructions:

#### Part A: Cloudflare SSL/TLS & Strict Edge Validation
1. From your local terminal, inspect the SSL certificate on the public apex domain:
   ```bash
   curl -Iv https://stackandscale.org 2>&1 | grep -i -E "HTTP/|SSL certificate|server:"
   ```
2. Verify:
   - The connection negotiates **TLS 1.3**.
   - The server reports Cloudflare proxy edge.
   - HTTP automatically redirects to HTTPS with HSTS headers (`Strict-Transport-Security`).

#### Part B: Direct Database & Storage Port Exposure Test
1. Identify your VPS public IPv4 address (e.g., `51.210.xxx.xxx`).
2. From an external machine, run a port scan against internal infrastructure ports:
   ```bash
   # Test PostgreSQL port (must be closed/filtered)
   nc -zv -w 3 <VPS_IP> 5432 || echo "Port 5432 blocked as required."

   # Test MinIO storage port (must be closed/filtered)
   nc -zv -w 3 <VPS_IP> 9000 || echo "Port 9000 blocked as required."

   # Test ClamAV scanner port (must be closed/filtered)
   nc -zv -w 3 <VPS_IP> 3310 || echo "Port 3310 blocked as required."
   ```
3. **Verify Result:**
   - Every single one of these internal service ports must return **Connection timed out** or **Connection refused**.
   - Under NO circumstances can PostgreSQL, MinIO, or ClamAV be accessible from the public internet. Only ports 80, 443 (Cloudflare), and 22 (SSH) may be open.

---

## Test Suite 4.2: API Probes & Rate Limiting Defense

### Step-by-Step Instructions:

#### Part A: Health and Readiness Probes
1. Run a request against the liveness probe:
   ```bash
   curl -i https://api.stackandscale.org/health
   ```
   - Verify: HTTP status **`200 OK`**, returning `{"status":"ok"}`.
2. Run a request against the readiness probe:
   ```bash
   curl -i https://api.stackandscale.org/ready
   ```
   - Verify: HTTP status **`200 OK`**, confirming that PostgreSQL connection pools and background workers are responsive.

#### Part B: Rate Limiting & Abuse Prevention
1. Execute a rapid burst of requests to test the API rate limiter:
   ```bash
   for i in {1..120}; do
     curl -s -o /dev/null -w "%{http_code}\n" https://api.stackandscale.org/health
   done | sort | uniq -c
   ```
2. **Verify Result:**
   - Verify the API accepts early requests (`200 OK`) and begins throttling excess traffic with HTTP **`429 Too Many Requests`**.
   - Inspect headers of a throttled response: verify `Retry-After` header is present.

---

## Test Suite 4.3: Observability Stack (Prometheus, Grafana, Loki)

### Step-by-Step Instructions:

#### Part A: Open a Secure Tunnel to Grafana
1. From your local terminal, open an SSH tunnel to the VPS:
   ```bash
   ssh -L 3001:127.0.0.1:3001 ubuntu@vps-5d4dfcb1
   ```
2. Open your local browser and navigate to: `http://localhost:3001`.
3. Sign in with the Grafana admin credentials located in `/opt/stack-and-scale/secrets/grafana-admin-password`.

#### Part B: Auditing Container Resource Telemetry
1. Open the **Docker Host & Container Metrics Dashboard**.
2. Inspect the live metrics gauges across all 16 running containers:
   - **Host CPU Usage:** Must be below **15%**.
   - **Host Memory Usage:** Must be below **40%** (healthy headroom on 4GB VPS-2).
   - **Network I/O:** Healthy baseline with no abnormal saturation spikes.
3. Check Prometheus scrape targets:
   - In Prometheus (`http://localhost:9090/targets`), verify that:
     - `api` scrape target is **UP**.
     - `cAdvisor` container metrics target is **UP**.
     - `node-exporter` host metrics target is **UP**.

#### Part C: Structured Log Inspection in Loki
1. Inside Grafana, click the **Explore** tab (compass icon) in the left sidebar.
2. Select **Loki** as the data source.
3. In the query builder, enter:
   ```logql
   {container_name="stack-and-scale-production-api-1"}
   ```
4. Click **Run query**:
   - Verify structured JSON logs from the API appear in real time, displaying inbound request IDs, response times, and status codes.

---

## Test Suite 4.4: Self-Healing Container Recovery Drill (Chaos Drill)

### Step-by-Step Instructions:
1. Log into your VPS terminal:
   ```bash
   ssh ubuntu@vps-5d4dfcb1
   ```
2. Check the currently running API container:
   ```bash
   docker ps --filter "name=api"
   ```
3. **Simulate a Process Crash:**
   - Force kill the live API container:
     ```bash
     docker kill stack-and-scale-production-api-1
     ```
4. **Observe Docker Daemon Auto-Recovery:**
   - Immediately run `docker ps --filter "name=api"`.
   - Watch Docker's restart policy (`restart: unless-stopped`) resurrect the service within 5–10 seconds.
5. In your local browser, hit `https://api.stackandscale.org/health` again:
   - Verify the API is back online and returning `200 OK` with zero operator intervention required.

---

## Test Suite 4.5: Automated Data Backup & Integrity Verification

### Step-by-Step Instructions:
1. On the VPS host, navigate to the backup directory:
   ```bash
   cd /opt/stack-and-scale
   ```
2. Run the platform backup utility:
   ```bash
   bash scripts/backup.sh
   ```
3. **Verify Backup Outputs:**
   - Check that a fresh PostgreSQL SQL dump is generated with a non-zero byte size:
     ```bash
     ls -lh /opt/stack-and-scale/backup/
     ```
   - Verify the database dump integrity:
     ```bash
     head -n 20 /opt/stack-and-scale/backup/*.sql | grep -i "PostgreSQL database dump"
     ```
4. Confirm OVHcloud daily snapshot schedule is active in the OVH Cloud Manager dashboard.

---

## Final Milestone: Full Team Sign-Off Assembly
Once you complete Test Suite 4.5:
- Collect the signed checklists from **Member 1**, **Member 2**, and **Member 3**.
- Combine all four verifications into the team launch sign-off record.

---

## Member 4 Sign-Off Checklist

| Test Item | Status | Verified By | Timestamp |
|---|---|---|---|
| Cloudflare TLS 1.3 Full (strict) & HSTS validated | [ ] Pass / [ ] Fail | ____________ | _________ |
| Internal ports 5432, 9000, 3310 strictly inaccessible from internet | [ ] Pass / [ ] Fail | ____________ | _________ |
| API `/health` and `/ready` probes return HTTP 200 | [ ] Pass / [ ] Fail | ____________ | _________ |
| API rate limiting throttles excess requests with HTTP 429 | [ ] Pass / [ ] Fail | ____________ | _________ |
| Grafana telemetry confirms CPU < 15% and RAM < 40% | [ ] Pass / [ ] Fail | ____________ | _________ |
| Prometheus targets all report healthy UP status | [ ] Pass / [ ] Fail | ____________ | _________ |
| Loki streams real-time structured container logs | [ ] Pass / [ ] Fail | ____________ | _________ |
| Simulated API container crash auto-heals within 10 seconds | [ ] Pass / [ ] Fail | ____________ | _________ |
| Backup script generates complete uncorrupted PostgreSQL dump | [ ] Pass / [ ] Fail | ____________ | _________ |

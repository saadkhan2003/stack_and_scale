# User Manual 4: Infrastructure, Edge Security & Disaster Recovery

> **Assigned Role:** Platform Reliability, Security & Infrastructure Lead  
> **Primary Operator:** Mehran Khan (`mehrankhan`)  
> **Primary Surfaces:** OVHcloud Production VPS (`51.195.136.215`), Grafana (`localhost:3001`), Keycloak Master IAM  
> **Target Audience:** DevOps Engineers, Site Reliability Engineers, Security Auditors

---

## 1. Role & Operational Scope

As the **Platform Reliability & Security Lead**, you are the guardian of platform uptime, perimeter hardening, and data integrity:
- Managing the single-server production topology on Ubuntu 24.04 LTS (`vps-5d4dfcb1`).
- Enforcing strict network isolation across 16 segregated Docker containers.
- Verifying Cloudflare Edge TLS 1.3 Full (Strict), HSTS, and rate-limiting abuse defenses.
- Operating the observability stack: Prometheus (metrics), Grafana (dashboards), Loki (logs), Promtail (shipper).
- Conducting chaos recovery drills and managing verified PostgreSQL disaster recovery backups.

---

## 2. Credentials & Production Access

### Host SSH Access
- **Host:** `51.195.136.215` (Port 22)
- **User:** `ubuntu`
- **Application Directory:** `/opt/stack-and-scale`
- **Backup Directory:** `/opt/stack-and-scale/backup`

### Grafana Telemetry Dashboard
- **SSH Tunnel Command:** `ssh -L 3001:localhost:3000 ubuntu@51.195.136.215`
- **URL:** `http://localhost:3001`
- **Username:** `admin`
- **Password:** `3672a5e96d2759c77cbcf8f7c10ce780a1d9d8af7b999952a34f6d3c9848b765`

### Keycloak Master Realm Admin
- **Console URL:** `https://identity.stackandscale.org`
- **Realm:** `master`
- **Username:** `admin`
- **Password:** `2d2641d5125f1fac78560e5664fe296936cb89fb5af0b68660af19292d9c7769`

### Keycloak Staff Account (Mehran Khan)
- **Username:** `mehrankhan`
- **Email:** `mehran.khan@stackandscale.org`
- **Password:** `StackScale2026!#Dragoooo`
- **Roles:** `admin`, `owner`, `member`, `mfa_verified`

---

## 3. Step-by-Step Infrastructure Playbook

### 3.1 Container Cluster Health Inspection
Connect to the host and inspect container health:
```bash
ssh ubuntu@51.195.136.215
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
All 16 containers must report `healthy` or `Up`:
- `caddy`, `web`, `api`, `cms`, `workers`, `postgres`, `keycloak`, `minio`, `clamav`
- `prometheus`, `grafana`, `loki`, `promtail`, `cadvisor`, `node-exporter`, `alertmanager`

---

### 3.2 Network Perimeter & Port Lockdown Verification
Stack & Scale enforces strict port security. Only ports `80` (redirect to 443), `443` (TLS), and `22` (SSH) may respond to the public internet:
```bash
# Verify internal database port 5432 is blocked from outside
nc -z -v -w 3 51.195.136.215 5432
# Expected: Connection timed out / Connection refused

# Verify internal storage port 9000 is blocked from outside
nc -z -v -w 3 51.195.136.215 9000
# Expected: Connection timed out / Connection refused
```

---

### 3.3 Observability via Grafana & Loki
1. Establish the encrypted tunnel from your local machine:
   ```bash
   ssh -L 3001:localhost:3000 ubuntu@51.195.136.215
   ```
2. Open **`http://localhost:3001`** and log in with your Grafana credentials.
3. **Dashboards to Inspect:**
   - **Host Resource Utilization:** Ensure CPU < 20%, Memory < 45%, and Disk utilization < 25%.
   - **Prometheus Targets:** Navigate to `Explore` &rarr; Metrics: verify `up{job="api"} == 1`.
   - **Loki LogQL Explorer:** Run queries across container streams:
     ```logql
     {container="stack-and-scale-production-api-1"} |= "error"
     {container="stack-and-scale-production-caddy-1"} |= "status=429"
     ```

---

### 3.4 Container Chaos Resilience Drill
To verify that the platform self-heals under unannounced container crashes:
```bash
ssh ubuntu@51.195.136.215 "docker kill stack-and-scale-production-api-1"
# Immediately check status:
ssh ubuntu@51.195.136.215 "docker ps --filter name=api --format '{{.Names}}: {{.Status}}'"
```
**Verification:** Docker's `restart: unless-stopped` supervisor detects the process exit and restarts the API within 5 to 10 seconds without dropping database sessions.

---

### 3.5 Database Disaster Recovery (DR) Backups

#### Automated Daily Backups:
Automated cron jobs run daily at `03:00 UTC` and write timestamped, compressed SQL snapshots to `/opt/stack-and-scale/backup/`:
```bash
ssh ubuntu@51.195.136.215 "ls -lh /opt/stack-and-scale/backup/"
```

#### Executing a Manual Pre-Deployment Snapshot:
Before any schema migration or major maintenance, execute an immediate snapshot:
```bash
ssh ubuntu@51.195.136.215 "docker exec stack-and-scale-production-postgres-1 pg_dump -U stack_and_scale stack_and_scale > /opt/stack-and-scale/backup/manual_stack_and_scale_\$(date +%Y%m%d_%H%M%S).sql"
```

#### Restoring from a Snapshot (DR Protocol):
```bash
ssh ubuntu@51.195.136.215 "cat /opt/stack-and-scale/backup/[SNAPSHOT_FILE].sql | docker exec -i stack-and-scale-production-postgres-1 psql -U stack_and_scale -d stack_and_scale"
```

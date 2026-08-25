# Processor and Vendor Register

No provider is activated by this placeholder register. Complete an entry before production data is sent to any external processor.

| Provider/capability | Purpose | Data categories | Location/transfer | Owner | Contract/DPA status | Retention/export/deletion | Approved? |
|---|---|---|---|---|---|---|---|
| Hetzner (baseline) | Compute/database hosting | Application and approved customer data | Exact location selected in Phase 10B | Infrastructure | Pending validation | Backup/restore/export documented before production | Baseline only |
| Cloudflare Free (baseline) | DNS/CDN/edge security | Network/request metadata as configured | Provider terms validated before activation | Infrastructure | Pending validation | Cookie/retention configuration recorded | Baseline only |
| Transactional email provider | Delivery of transactional email | Recipient/address and message metadata | Provider selected in Phase 09 | Sales operations | Not selected | Export/delete and sending limits required | No |
| Backup target | Encrypted geographic recovery | Encrypted backup material | Selected in ADR-BACKUP | Infrastructure | Not selected | Retention/expiry/recovery documented | No |


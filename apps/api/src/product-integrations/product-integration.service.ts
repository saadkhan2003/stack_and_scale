import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { createHash, createPrivateKey, randomBytes, randomUUID, sign } from "node:crypto";
import { canonicalProductIntegrationJson, PRODUCT_INTEGRATION_CONTRACT_VERSION, type SyncMutation, unsignedEntitlementLease } from "@stack-and-scale/contracts";

import { PlatformDatabaseService } from "../platform-database.service.js";
import type { ProductInstallationPrincipal } from "./product-integration-access.service.js";

const protectedEntityKinds = new Set(["financial", "inventory", "permission", "contractual"]);
const acceptedEntityKinds = new Set(["operational_note", "preference"]);

@Injectable()
export class ProductIntegrationService {
  public constructor(@Inject(PlatformDatabaseService) private readonly database: PlatformDatabaseService) {}

  private signingKey() {
    const encoded = process.env["PRODUCT_ENTITLEMENT_SIGNING_PRIVATE_KEY_B64"];
    if (!encoded?.trim()) throw new ConflictException("Entitlement signing is not configured.");
    try { return createPrivateKey({ key: Buffer.from(encoded, "base64").toString("utf8"), format: "pem", type: "pkcs8" }); }
    catch { throw new ConflictException("Entitlement signing key is invalid."); }
  }

  public async provisionCredential(actorId: string, installationId: string, expiresAtInput: string) {
    const expiresAt = new Date(expiresAtInput);
    if (Number.isNaN(expiresAt.valueOf()) || expiresAt <= new Date()) throw new BadRequestException("Credential expiry must be in the future.");
    const installation = await this.database.query(`SELECT installation.id, installation.status, account.product_id FROM product.installations installation JOIN product.account_organizations account ON account.id = installation.account_organization_id WHERE installation.id = $1`, [installationId]);
    if (!installation.rows.length || (installation.rows[0] as { status: string }).status !== "active") throw new NotFoundException("Active installation was not found.");
    const credential = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(credential).digest("hex");
    await this.database.transaction(async (client) => {
      await client.query(`UPDATE product.installation_credentials SET status = 'replaced', replaced_at = now() WHERE installation_id = $1 AND status = 'active'`, [installationId]);
      await client.query(`INSERT INTO product.installation_credentials (id,installation_id,credential_hash,status,expires_at) VALUES ($1,$2,$3,'active',$4)`, [`integration_credential_${randomUUID()}`, installationId, hash, expiresAt]);
    });
    return { installationId, credential, expiresAt: expiresAt.toISOString(), provisionedBy: actorId };
  }

  public async revokeCredentials(actorId: string, installationId: string) {
    const changed = await this.database.query(`UPDATE product.installation_credentials SET status = 'revoked', revoked_at = now() WHERE installation_id = $1 AND status = 'active' RETURNING id`, [installationId]);
    if (!changed.rows.length) throw new NotFoundException("Active installation credential was not found.");
    return { installationId, revokedBy: actorId };
  }

  public async issueLease(principal: ProductInstallationPrincipal) {
    return this.database.transaction(async (client) => {
      const state = await client.query(`SELECT installation.last_sequence, installation.status AS installation_status, license.status AS license_status, subscription.status AS subscription_status, version.entitlements
        FROM product.installations installation JOIN product.licenses license ON license.id = installation.license_id
        JOIN product.account_organizations account ON account.id = installation.account_organization_id
        LEFT JOIN LATERAL (SELECT * FROM product.subscriptions WHERE account_organization_id = installation.account_organization_id AND status IN ('trial','active','past_due') AND effective_at <= now() AND (ends_at IS NULL OR ends_at > now()) ORDER BY updated_at DESC LIMIT 1) subscription ON true
        LEFT JOIN product.plan_versions version ON version.id = subscription.plan_version_id
        WHERE installation.id = $1 AND installation.account_organization_id = $2 FOR UPDATE OF installation`, [principal.installationId, principal.accountOrganizationId]);
      const row = state.rows[0] as { last_sequence: string; installation_status: string; license_status: string; subscription_status: string | null; entitlements: Record<string, unknown> | null } | undefined;
      if (!row) throw new NotFoundException("Installation was not found.");
      if (row.installation_status !== "active" || row.license_status === "revoked") throw new ForbiddenException("Installation is revoked.");
      const issuedAt = new Date(); const expiresAt = new Date(issuedAt.valueOf() + 24 * 60 * 60_000); const graceUntil = new Date(expiresAt.valueOf() + 24 * 60 * 60_000);
      const sequence = Number(row.last_sequence) + 1;
      const keyId = process.env["PRODUCT_ENTITLEMENT_SIGNING_KEY_ID"]?.trim() || "account-snapshot-v1";
      const key = await client.query(`SELECT 1 FROM product.signing_key_metadata WHERE key_id = $1 AND status = 'active' AND not_before <= $2 AND not_after > $2`, [keyId, issuedAt]);
      if (!key.rows.length) throw new ConflictException("No active entitlement signing key is available.");
      const lease = unsignedEntitlementLease({ contractVersion: PRODUCT_INTEGRATION_CONTRACT_VERSION, keyId, installationId: principal.installationId, accountOrganizationId: principal.accountOrganizationId, sequence, issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString(), graceUntil: graceUntil.toISOString(), entitlements: row.subscription_status ? (row.entitlements ?? {}) : {} });
      const signature = sign(null, Buffer.from(canonicalProductIntegrationJson(lease)), this.signingKey()).toString("base64url");
      await client.query(`UPDATE product.installations SET last_sequence = $1, lease_expires_at = $2, updated_at = now() WHERE id = $3`, [sequence, expiresAt, principal.installationId]);
      await client.query(`INSERT INTO product.integration_leases (id,installation_id,account_organization_id,sequence,contract_version,key_id,payload,signature,issued_at,expires_at,grace_until) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [`integration_lease_${randomUUID()}`, principal.installationId, principal.accountOrganizationId, sequence, PRODUCT_INTEGRATION_CONTRACT_VERSION, keyId, lease, signature, issuedAt, expiresAt, graceUntil]);
      return { ...lease, signature };
    });
  }

  public async heartbeat(principal: ProductInstallationPrincipal, input: { softwareVersion: string; leaseState: string; syncCursor: number; syncStatus: string }) {
    if (!input.softwareVersion.trim() || !["valid", "grace", "expired", "revoked"].includes(input.leaseState) || !["idle", "pending", "blocked", "error"].includes(input.syncStatus) || !Number.isSafeInteger(input.syncCursor) || input.syncCursor < 0) throw new BadRequestException("Heartbeat is invalid.");
    const enabled = await this.database.query(`SELECT telemetry_enabled FROM product.account_organizations WHERE id = $1`, [principal.accountOrganizationId]);
    if ((enabled.rows[0] as { telemetry_enabled?: boolean } | undefined)?.telemetry_enabled !== true) throw new ForbiddenException("Telemetry is not enabled.");
    const recent = await this.database.query(`SELECT 1 FROM product.installation_heartbeats WHERE installation_id = $1 AND received_at > now() - interval '5 minutes'`, [principal.installationId]);
    if (recent.rows.length) return { accepted: false, reason: "rate_limited" };
    await this.database.query(`INSERT INTO product.installation_heartbeats (id,installation_id,account_organization_id,software_version,lease_state,sync_cursor,sync_status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [`heartbeat_${randomUUID()}`, principal.installationId, principal.accountOrganizationId, input.softwareVersion.trim(), input.leaseState, input.syncCursor, input.syncStatus]);
    return { accepted: true };
  }

  public async sync(principal: ProductInstallationPrincipal, mutations: readonly unknown[]) {
    if (mutations.length === 0 || mutations.length > 100 || Buffer.byteLength(JSON.stringify(mutations), "utf8") > 1_000_000) throw new BadRequestException("Sync batch must contain 1 to 100 mutations within 1 MiB.");
    const parsedMutations = mutations.map(parseSyncMutation);
    const enabled = await this.database.query(`SELECT sync_enabled FROM product.account_organizations WHERE id = $1`, [principal.accountOrganizationId]);
    if ((enabled.rows[0] as { sync_enabled?: boolean } | undefined)?.sync_enabled !== true) throw new ForbiddenException("Synchronization is not enabled.");
    return this.database.transaction(async (client) => {
      const outcomes: Array<Record<string, unknown>> = [];
      for (const mutation of parsedMutations) {
        const duplicate = await client.query(`SELECT outcome, outcome_detail FROM product.integration_sync_mutations WHERE installation_id = $1 AND mutation_id = $2`, [principal.installationId, mutation.mutationId]);
        if (duplicate.rows.length) { outcomes.push({ mutationId: mutation.mutationId, ...(duplicate.rows[0] as object), replayed: true }); continue; }
        const protectedKind = protectedEntityKinds.has(mutation.entityKind);
        const outcome = protectedKind ? "conflicted" : acceptedEntityKinds.has(mutation.entityKind) ? "accepted" : "rejected";
        const detail = protectedKind ? { code: "server_authoritative", entityKind: mutation.entityKind } : outcome === "rejected" ? { code: "unsupported_entity_kind" } : { cursor: mutation.localSequence };
        await client.query(`INSERT INTO product.integration_sync_mutations (id,installation_id,account_organization_id,mutation_id,local_sequence,entity_kind,base_version,payload,outcome,outcome_detail) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [`sync_mutation_${randomUUID()}`, principal.installationId, principal.accountOrganizationId, mutation.mutationId, mutation.localSequence, mutation.entityKind, mutation.baseVersion ?? null, mutation.payload, outcome, detail]);
        if (protectedKind) await client.query(`INSERT INTO product.integration_conflicts (id,installation_id,mutation_id,entity_kind,policy,evidence) VALUES ($1,$2,$3,$4,'server_authoritative',$5)`, [`integration_conflict_${randomUUID()}`, principal.installationId, mutation.mutationId, mutation.entityKind, { mutation, detail }]);
        outcomes.push({ mutationId: mutation.mutationId, outcome, detail, replayed: false });
      }
      const cursor = Math.max(...parsedMutations.map((mutation) => mutation.localSequence));
      await client.query(`INSERT INTO product.integration_sync_cursors (installation_id,account_organization_id,cursor) VALUES ($1,$2,$3) ON CONFLICT (installation_id) DO UPDATE SET cursor = GREATEST(product.integration_sync_cursors.cursor, EXCLUDED.cursor), updated_at = now()`, [principal.installationId, principal.accountOrganizationId, cursor]);
      return { cursor, outcomes };
    });
  }
}

function parseSyncMutation(value: unknown): SyncMutation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new BadRequestException("Sync mutation is invalid.");
  const candidate = value as Record<string, unknown>;
  if (typeof candidate["mutationId"] !== "string" || !candidate["mutationId"].trim() || typeof candidate["localSequence"] !== "number" || !Number.isSafeInteger(candidate["localSequence"]) || candidate["localSequence"] < 1 || typeof candidate["entityKind"] !== "string" || !candidate["entityKind"].trim() || typeof candidate["payload"] !== "object" || candidate["payload"] === null || Array.isArray(candidate["payload"]) || (candidate["baseVersion"] !== undefined && typeof candidate["baseVersion"] !== "string")) throw new BadRequestException("Sync mutation is invalid.");
  return { mutationId: candidate["mutationId"], localSequence: candidate["localSequence"], entityKind: candidate["entityKind"], ...(typeof candidate["baseVersion"] === "string" ? { baseVersion: candidate["baseVersion"] } : {}), payload: candidate["payload"] as Record<string, unknown> };
}

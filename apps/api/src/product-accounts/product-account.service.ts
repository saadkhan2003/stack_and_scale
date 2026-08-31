import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID, createHash } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";
import type { ProductAccountPrincipal } from "./product-account-access.service.js";

const legalTransitions: Record<string, readonly string[]> = {
  pending: ["trial", "active", "cancelled"], trial: ["active", "expired", "cancelled"],
  active: ["past_due", "cancelled", "suspended"], past_due: ["active", "suspended"],
  suspended: ["active", "terminated"], cancelled: ["expired"], expired: ["active"], terminated: [],
};

@Injectable()
export class ProductAccountService {
  public constructor(@Inject(PlatformDatabaseService) private readonly database: PlatformDatabaseService) {}

  public async home(principal: ProductAccountPrincipal) {
    const [account, subscriptions, licenses, releases] = await Promise.all([
      this.database.query(`SELECT display_name, billing_enabled, downloads_enabled, license_enforcement_enabled FROM product.account_organizations WHERE id = $1`, [principal.accountOrganizationId]),
      this.database.query(`SELECT id, status, effective_at, ends_at FROM product.subscriptions WHERE account_organization_id = $1 ORDER BY updated_at DESC LIMIT 20`, [principal.accountOrganizationId]),
      this.database.query(`SELECT id, status, seat_limit FROM product.licenses WHERE account_organization_id = $1 ORDER BY created_at DESC LIMIT 20`, [principal.accountOrganizationId]),
      this.database.query(`SELECT id, version, platform, checksum_sha256, signature, key_id, support_status FROM product.releases WHERE product_id = $1 AND support_status = 'supported' ORDER BY created_at DESC LIMIT 20`, [principal.productId]),
    ]);
    return { account: account.rows[0] ?? null, subscriptions: subscriptions.rows, licenses: licenses.rows, releases: releases.rows };
  }

  public async listMembers(principal: ProductAccountPrincipal) {
    const result = await this.database.query(`SELECT membership.id, user.email, membership.role, membership.status FROM product.account_memberships membership JOIN identity.users user ON user.id = membership.user_id WHERE membership.account_organization_id = $1 ORDER BY membership.created_at`, [principal.accountOrganizationId]);
    return result.rows;
  }

  public async transitionSubscription(principal: ProductAccountPrincipal, subscriptionId: string, input: { status: string; reason: string; idempotencyKey: string; effectiveAt?: string; overrideUntil?: string }) {
    if (!input.idempotencyKey || !input.reason || !legalTransitions[input.status]) throw new BadRequestException("A valid transition is required.");
    return this.database.transaction(async (client) => {
      const existing = await client.query(`SELECT id, status, account_organization_id FROM product.subscriptions WHERE id = $1 FOR UPDATE`, [subscriptionId]);
      const row = existing.rows[0] as { id: string; status: string; account_organization_id: string } | undefined;
      if (!row || row.account_organization_id !== principal.accountOrganizationId) throw new NotFoundException("Subscription was not found.");
      const duplicate = await client.query(`SELECT id FROM product.subscription_events WHERE subscription_id = $1 AND idempotency_key = $2`, [subscriptionId, input.idempotencyKey]);
      if (duplicate.rows.length) return { subscriptionId, status: row.status, replayed: true };
      if (!legalTransitions[row.status]?.includes(input.status)) throw new ConflictException("The subscription transition is not allowed.");
      const effectiveAt = input.effectiveAt ? new Date(input.effectiveAt) : new Date();
      if (Number.isNaN(effectiveAt.valueOf())) throw new BadRequestException("effectiveAt is invalid.");
      const overrideUntil = input.overrideUntil ? new Date(input.overrideUntil) : null;
      if (overrideUntil && (Number.isNaN(overrideUntil.valueOf()) || overrideUntil <= effectiveAt)) throw new BadRequestException("overrideUntil must be after effectiveAt.");
      await client.query(`UPDATE product.subscriptions SET status = $1, effective_at = $2, override_until = $3, updated_at = now() WHERE id = $4`, [input.status, effectiveAt, overrideUntil, subscriptionId]);
      await client.query(`INSERT INTO product.subscription_events (id, subscription_id, account_organization_id, actor_id, from_status, to_status, reason, effective_at, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [randomUUID(), subscriptionId, principal.accountOrganizationId, principal.actorId, row.status, input.status, input.reason, effectiveAt, input.idempotencyKey]);
      return { subscriptionId, status: input.status, replayed: false };
    });
  }

  public async entitlementSnapshot(principal: ProductAccountPrincipal, subjectId: string) {
    if (subjectId !== principal.actorId && principal.role !== "owner" && principal.role !== "admin") throw new ForbiddenException("You cannot request this snapshot.");
    const at = new Date();
    const result = await this.database.query(
      `SELECT subscription.id, subscription.status, version.entitlements, subscription.override_until
         FROM product.subscriptions subscription JOIN product.plan_versions version ON version.id = subscription.plan_version_id
        WHERE subscription.account_organization_id = $1 AND subscription.status IN ('trial','active','past_due') AND subscription.effective_at <= $2 AND (subscription.ends_at IS NULL OR subscription.ends_at > $2)
        ORDER BY subscription.updated_at DESC LIMIT 1`, [principal.accountOrganizationId, at]);
    const subscription = result.rows[0] as { id: string; status: string; entitlements: Record<string, unknown>; override_until: Date | null } | undefined;
    const overrides = await this.database.query(`SELECT key, value FROM product.entitlement_overrides WHERE account_organization_id = $1 AND effective_from <= $2 AND (effective_until IS NULL OR effective_until > $2) ORDER BY created_at`, [principal.accountOrganizationId, at]);
    const values: Record<string, unknown> = { ...(subscription?.entitlements ?? {}) };
    for (const row of overrides.rows as Array<{ key: string; value: unknown }>) values[row.key] = row.value;
    const latest = await this.database.query(`SELECT COALESCE(MAX(sequence), 0) AS sequence FROM product.entitlement_snapshots WHERE account_organization_id = $1 AND subject_id = $2`, [principal.accountOrganizationId, subjectId]);
    const sequence = Number((latest.rows[0] as { sequence: string }).sequence) + 1;
    const issuedAt = new Date(); const expiresAt = new Date(issuedAt.valueOf() + 15 * 60_000);
    const payload = { contractVersion: "0.1", accountOrganizationId: principal.accountOrganizationId, subjectId, sequence, subscriptionStatus: subscription?.status ?? "inactive", entitlements: values, issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString() };
    await this.database.query(`INSERT INTO product.entitlement_snapshots (id,account_organization_id,subject_id,sequence,contract_version,payload,key_id,issued_at,expires_at) VALUES ($1,$2,$3,$4,'0.1',$5,'unsigned-metadata',$6,$7)`, [randomUUID(), principal.accountOrganizationId, subjectId, sequence, payload, issuedAt, expiresAt]);
    return payload;
  }

  public async issueLease(principal: ProductAccountPrincipal, installationId: string, sequence: number) {
    if (!Number.isSafeInteger(sequence) || sequence < 1) throw new BadRequestException("sequence is invalid.");
    return this.database.transaction(async (client) => {
      const result = await client.query(`SELECT installation.id, installation.status, installation.last_sequence, license.status AS license_status FROM product.installations installation JOIN product.licenses license ON license.id = installation.license_id WHERE installation.id = $1 AND installation.account_organization_id = $2 FOR UPDATE`, [installationId, principal.accountOrganizationId]);
      const row = result.rows[0] as { id: string; status: string; last_sequence: string; license_status: string } | undefined;
      if (!row) throw new NotFoundException("Installation was not found.");
      if (row.status === "revoked" || row.license_status === "revoked") throw new ForbiddenException("The installation is revoked.");
      if (sequence <= Number(row.last_sequence)) throw new ConflictException("Lease sequence must advance.");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60_000);
      await client.query(`UPDATE product.installations SET status = 'active', last_sequence = $1, lease_expires_at = $2, updated_at = now() WHERE id = $3`, [sequence, expiresAt, installationId]);
      return { installationId, sequence, expiresAt: expiresAt.toISOString(), offlineGraceSeconds: 86_400 };
    });
  }

  public async billing(principal: ProductAccountPrincipal) {
    const enabled = await this.database.query(`SELECT billing_enabled FROM product.account_organizations WHERE id = $1`, [principal.accountOrganizationId]);
    if ((enabled.rows[0] as { billing_enabled?: boolean } | undefined)?.billing_enabled !== true) throw new ForbiddenException("Billing account is not enabled.");
    return (await this.database.query(`SELECT id, canonical_invoice_id, status, currency, amount_minor, due_at, payment_instruction FROM product.billing_projections WHERE account_organization_id = $1 ORDER BY created_at DESC LIMIT 100`, [principal.accountOrganizationId])).rows;
  }

  public async download(principal: ProductAccountPrincipal, releaseId: string) {
    const enabled = await this.database.query(`SELECT downloads_enabled FROM product.account_organizations WHERE id = $1`, [principal.accountOrganizationId]);
    if ((enabled.rows[0] as { downloads_enabled?: boolean } | undefined)?.downloads_enabled !== true) throw new ForbiddenException("Downloads are not enabled.");
    const entitlement = await this.database.query(`SELECT 1 FROM product.subscriptions WHERE account_organization_id = $1 AND status IN ('trial','active') AND effective_at <= now() AND (ends_at IS NULL OR ends_at > now()) LIMIT 1`, [principal.accountOrganizationId]);
    if (!entitlement.rows.length) throw new ForbiddenException("An active entitlement is required.");
    const release = await this.database.query(`SELECT id, version, platform, checksum_sha256, signature, key_id, support_status FROM product.releases WHERE id = $1 AND product_id = $2`, [releaseId, principal.productId]);
    if (!release.rows.length || (release.rows[0] as { support_status: string }).support_status !== "supported") throw new NotFoundException("Release was not found.");
    await this.database.query(`INSERT INTO product.download_audit_events (id,account_organization_id,release_id,actor_id) VALUES ($1,$2,$3,$4)`, [randomUUID(), principal.accountOrganizationId, releaseId, principal.actorId]);
    return { release: release.rows[0], capability: null, message: "Download capability requires separately verified private storage." };
  }

  public async support(principal: ProductAccountPrincipal) {
    return (await this.database.query(`SELECT id, title, status, public_detail, created_at FROM product.support_projections WHERE account_organization_id = $1 AND product_id = $2 ORDER BY created_at DESC LIMIT 100`, [principal.accountOrganizationId, principal.productId])).rows;
  }

  public async preferences(principal: ProductAccountPrincipal) {
    await this.database.query(`INSERT INTO product.notification_preferences (account_organization_id,user_id,category,enabled) VALUES ($1,$2,'security',true),($1,$2,'billing',true),($1,$2,'product',true) ON CONFLICT DO NOTHING`, [principal.accountOrganizationId, principal.actorId]);
    return (await this.database.query(`SELECT category, enabled FROM product.notification_preferences WHERE account_organization_id = $1 AND user_id = $2 ORDER BY category`, [principal.accountOrganizationId, principal.actorId])).rows;
  }

  public async setPreference(principal: ProductAccountPrincipal, category: string, enabled: unknown) {
    if ((category !== "billing" && category !== "product") || typeof enabled !== "boolean") throw new BadRequestException("The notification preference is invalid.");
    await this.database.query(`INSERT INTO product.notification_preferences (account_organization_id,user_id,category,enabled) VALUES ($1,$2,$3,$4) ON CONFLICT (account_organization_id,user_id,category) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`, [principal.accountOrganizationId, principal.actorId, category, enabled]);
    return { category, enabled };
  }

  public installationKeyHash(value: string): string { return createHash("sha256").update(value).digest("hex"); }

  public async createCatalogProduct(actorId: string, input: { code: string; name: string }) {
    if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(input.code) || !input.name.trim()) throw new BadRequestException("Product code and name are required.");
    const id = `product_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.catalog_products (id,code,name,status) VALUES ($1,$2,$3,'draft')`, [id, input.code, input.name.trim()]);
    return { id, code: input.code, createdBy: actorId };
  }

  public async createAccountOrganization(actorId: string, input: { productId: string; displayName: string; ownerUserId: string }) {
    if (!input.displayName.trim() || !input.productId || !input.ownerUserId) throw new BadRequestException("Product, owner and display name are required.");
    const id = `account_${randomUUID()}`; const membershipId = `account_membership_${randomUUID()}`;
    await this.database.transaction(async (client) => {
      const product = await client.query(`SELECT id FROM product.catalog_products WHERE id = $1 AND status = 'active'`, [input.productId]);
      const owner = await client.query(`SELECT id FROM identity.users WHERE id = $1 AND status = 'active'`, [input.ownerUserId]);
      if (!product.rows.length || !owner.rows.length) throw new NotFoundException("Product or owner was not found.");
      await client.query(`INSERT INTO product.account_organizations (id,product_id,display_name,status,account_enabled) VALUES ($1,$2,$3,'active',false)`, [id, input.productId, input.displayName.trim()]);
      await client.query(`INSERT INTO product.account_memberships (id,account_organization_id,user_id,role) VALUES ($1,$2,$3,'owner')`, [membershipId, id, input.ownerUserId]);
      await client.query(`INSERT INTO product.account_events (id,account_organization_id,actor_id,event_type,idempotency_key,detail) VALUES ($1,$2,$3,'account_created',$1,$4)`, [randomUUID(), id, actorId, { ownerUserId: input.ownerUserId }]);
    });
    return { id, enabled: false };
  }
}

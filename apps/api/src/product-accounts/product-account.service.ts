import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID, createHash, createPrivateKey, sign } from "node:crypto";

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

  private snapshotSigningKey() {
    const encoded = process.env["PRODUCT_ENTITLEMENT_SIGNING_PRIVATE_KEY_B64"];
    if (!encoded?.trim()) throw new ConflictException("Entitlement signing is not configured.");
    try {
      return createPrivateKey({ key: Buffer.from(encoded, "base64").toString("utf8"), format: "pem", type: "pkcs8" });
    } catch {
      throw new ConflictException("Entitlement signing key is invalid.");
    }
  }

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

  public async listBranches(principal: ProductAccountPrincipal) {
    return (await this.database.query(`SELECT id, name, status FROM product.account_branches WHERE account_organization_id = $1 ORDER BY created_at`, [principal.accountOrganizationId])).rows;
  }

  public async createBranch(principal: ProductAccountPrincipal, input: { name: string; idempotencyKey: string }) {
    if (!input.name.trim() || !input.idempotencyKey) throw new BadRequestException("Branch name and idempotency key are required.");
    return this.database.transaction(async (client) => {
      const replay = await client.query(`SELECT detail FROM product.account_events WHERE account_organization_id = $1 AND idempotency_key = $2`, [principal.accountOrganizationId, input.idempotencyKey]);
      if (replay.rows.length) return { ...(replay.rows[0] as { detail: object }).detail, replayed: true };
      const id = `branch_${randomUUID()}`;
      await client.query(`INSERT INTO product.account_branches (id,account_organization_id,name) VALUES ($1,$2,$3)`, [id, principal.accountOrganizationId, input.name.trim()]);
      const detail = { branchId: id, name: input.name.trim() };
      await client.query(`INSERT INTO product.account_events (id,account_organization_id,actor_id,event_type,idempotency_key,detail) VALUES ($1,$2,$3,'branch_created',$4,$5)`, [randomUUID(), principal.accountOrganizationId, principal.actorId, input.idempotencyKey, detail]);
      return { ...detail, replayed: false };
    });
  }

  public async setMembership(principal: ProductAccountPrincipal, userId: string, input: { role: string; status: string; idempotencyKey: string }) {
    const role = input.role as ProductAccountPrincipal["role"];
    if (!input.idempotencyKey || !["owner", "admin", "member", "billing"].includes(role) || !["active", "suspended", "revoked"].includes(input.status)) throw new BadRequestException("Membership change is invalid.");
    if (role === "owner" && principal.role !== "owner") throw new ForbiddenException("Only an owner can assign ownership.");
    return this.database.transaction(async (client) => {
      const replay = await client.query(`SELECT detail FROM product.account_events WHERE account_organization_id = $1 AND idempotency_key = $2`, [principal.accountOrganizationId, input.idempotencyKey]);
      if (replay.rows.length) return { ...(replay.rows[0] as { detail: object }).detail, replayed: true };
      const user = await client.query(`SELECT id FROM identity.users WHERE id = $1 AND status = 'active'`, [userId]);
      if (!user.rows.length) throw new NotFoundException("User was not found.");
      const current = await client.query(`SELECT id, role, status FROM product.account_memberships WHERE account_organization_id = $1 AND user_id = $2 FOR UPDATE`, [principal.accountOrganizationId, userId]);
      const previous = current.rows[0] as { id: string; role: string; status: string } | undefined;
      if (previous?.role === "owner" && (role !== "owner" || input.status !== "active")) {
        const owners = await client.query(`SELECT count(*)::int AS count FROM product.account_memberships WHERE account_organization_id = $1 AND role = 'owner' AND status = 'active'`, [principal.accountOrganizationId]);
        if (Number((owners.rows[0] as { count: number }).count) < 2) throw new ConflictException("An account must retain an active owner.");
      }
      const membershipId = previous?.id ?? `account_membership_${randomUUID()}`;
      await client.query(`INSERT INTO product.account_memberships (id,account_organization_id,user_id,role,status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (account_organization_id,user_id) DO UPDATE SET role = EXCLUDED.role,status = EXCLUDED.status,updated_at = now()`, [membershipId, principal.accountOrganizationId, userId, role, input.status]);
      const detail = { membershipId, userId, role, status: input.status };
      await client.query(`INSERT INTO product.account_events (id,account_organization_id,actor_id,event_type,idempotency_key,detail) VALUES ($1,$2,$3,'membership_changed',$4,$5)`, [randomUUID(), principal.accountOrganizationId, principal.actorId, input.idempotencyKey, detail]);
      return { ...detail, replayed: false };
    });
  }

  public async setBranchMember(principal: ProductAccountPrincipal, branchId: string, userId: string, input: { present: boolean; idempotencyKey: string }) {
    if (!input.idempotencyKey) throw new BadRequestException("An idempotency key is required.");
    return this.database.transaction(async (client) => {
      const branch = await client.query(`SELECT id FROM product.account_branches WHERE id = $1 AND account_organization_id = $2 AND status = 'active'`, [branchId, principal.accountOrganizationId]);
      if (!branch.rows.length) throw new NotFoundException("Branch was not found.");
      const member = await client.query(`SELECT id FROM product.account_memberships WHERE account_organization_id = $1 AND user_id = $2 AND status = 'active'`, [principal.accountOrganizationId, userId]);
      if (!member.rows.length) throw new NotFoundException("Active account member was not found.");
      const eventKey = `${input.idempotencyKey}:${branchId}`;
      const replay = await client.query(`SELECT detail FROM product.account_events WHERE account_organization_id = $1 AND idempotency_key = $2`, [principal.accountOrganizationId, eventKey]);
      if (replay.rows.length) return { ...(replay.rows[0] as { detail: object }).detail, replayed: true };
      if (input.present) await client.query(`INSERT INTO product.branch_memberships (branch_id,user_id,account_membership_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [branchId, userId, (member.rows[0] as { id: string }).id]);
      else await client.query(`DELETE FROM product.branch_memberships WHERE branch_id = $1 AND user_id = $2`, [branchId, userId]);
      const detail = { branchId, userId, present: input.present };
      await client.query(`INSERT INTO product.account_events (id,account_organization_id,actor_id,event_type,idempotency_key,detail) VALUES ($1,$2,$3,'branch_membership_changed',$4,$5)`, [randomUUID(), principal.accountOrganizationId, principal.actorId, eventKey, detail]);
      return { ...detail, replayed: false };
    });
  }

  public async setEntitlementOverride(principal: ProductAccountPrincipal, input: { key: string; value: unknown; effectiveUntil?: string; idempotencyKey: string }) {
    if (!/^[a-z][a-z0-9_.-]{0,80}$/.test(input.key) || !input.idempotencyKey) throw new BadRequestException("Entitlement override is invalid.");
    const until = input.effectiveUntil === undefined ? null : new Date(input.effectiveUntil);
    if (until !== null && (Number.isNaN(until.valueOf()) || until <= new Date())) throw new BadRequestException("Override expiry must be in the future.");
    return this.database.transaction(async (client) => {
      const replay = await client.query(`SELECT detail FROM product.account_events WHERE account_organization_id = $1 AND idempotency_key = $2`, [principal.accountOrganizationId, input.idempotencyKey]);
      if (replay.rows.length) return { ...(replay.rows[0] as { detail: object }).detail, replayed: true };
      const id = `entitlement_override_${randomUUID()}`;
      await client.query(`INSERT INTO product.entitlement_overrides (id,account_organization_id,key,value,effective_from,effective_until,actor_id) VALUES ($1,$2,$3,$4,now(),$5,$6)`, [id, principal.accountOrganizationId, input.key, input.value, until, principal.actorId]);
      const detail = { overrideId: id, key: input.key, effectiveUntil: until?.toISOString() ?? null };
      await client.query(`INSERT INTO product.account_events (id,account_organization_id,actor_id,event_type,idempotency_key,detail) VALUES ($1,$2,$3,'entitlement_override_issued',$4,$5)`, [randomUUID(), principal.accountOrganizationId, principal.actorId, input.idempotencyKey, detail]);
      return { ...detail, replayed: false };
    });
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
    if (subscription !== undefined) {
      const addons = await this.database.query(
        `SELECT DISTINCT addon.entitlements, addon.code
           FROM product.subscriptions subscription
           JOIN product.plan_version_addons included ON included.plan_version_id = subscription.plan_version_id
           JOIN product.addons addon ON addon.id = included.addon_id AND addon.status = 'active'
          WHERE subscription.id = $1
         UNION
         SELECT DISTINCT addon.entitlements, addon.code
           FROM product.subscription_addons assignment
           JOIN product.addons addon ON addon.id = assignment.addon_id AND addon.status = 'active'
          WHERE assignment.subscription_id = $1 AND assignment.effective_from <= $2 AND (assignment.effective_until IS NULL OR assignment.effective_until > $2)
         ORDER BY code`, [subscription.id, at],
      );
      for (const row of addons.rows as Array<{ entitlements: Record<string, unknown> }>) Object.assign(values, row.entitlements);
    }
    for (const row of overrides.rows as Array<{ key: string; value: unknown }>) values[row.key] = row.value;
    const latest = await this.database.query(`SELECT COALESCE(MAX(sequence), 0) AS sequence FROM product.entitlement_snapshots WHERE account_organization_id = $1 AND subject_id = $2`, [principal.accountOrganizationId, subjectId]);
    const sequence = Number((latest.rows[0] as { sequence: string }).sequence) + 1;
    const issuedAt = new Date(); const expiresAt = new Date(issuedAt.valueOf() + 15 * 60_000);
    const payload = { contractVersion: "0.1", accountOrganizationId: principal.accountOrganizationId, subjectId, sequence, subscriptionStatus: subscription?.status ?? "inactive", entitlements: values, issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString() };
    const keyId = process.env["PRODUCT_ENTITLEMENT_SIGNING_KEY_ID"]?.trim() || "account-snapshot-v1";
    const signingKey = await this.database.query(`SELECT 1 FROM product.signing_key_metadata WHERE key_id = $1 AND status = 'active' AND not_before <= $2 AND not_after > $2`, [keyId, issuedAt]);
    if (!signingKey.rows.length) throw new ConflictException("No active entitlement signing key is available.");
    const signature = sign(null, Buffer.from(JSON.stringify(payload)), this.snapshotSigningKey()).toString("base64url");
    await this.database.query(`INSERT INTO product.entitlement_snapshots (id,account_organization_id,subject_id,sequence,contract_version,payload,key_id,signature,issued_at,expires_at) VALUES ($1,$2,$3,$4,'0.1',$5,$6,$7,$8,$9)`, [randomUUID(), principal.accountOrganizationId, subjectId, sequence, payload, keyId, signature, issuedAt, expiresAt]);
    return { ...payload, keyId, signatureAlgorithm: "ed25519", signature };
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
    const release = await this.database.query(`SELECT release.id, release.version, release.platform, release.checksum_sha256, release.signature, release.key_id, release.support_status, key.status AS key_status FROM product.releases release JOIN product.signing_key_metadata key ON key.key_id = release.key_id WHERE release.id = $1 AND release.product_id = $2`, [releaseId, principal.productId]);
    if (!release.rows.length || (release.rows[0] as { support_status: string; key_status: string }).support_status !== "supported" || (release.rows[0] as { key_status: string }).key_status === "revoked") throw new NotFoundException("Release was not found.");
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

  public async setCatalogProductStatus(actorId: string, productId: string, status: string) {
    if (!["draft", "active", "retired"].includes(status)) throw new BadRequestException("Product status is invalid.");
    const changed = await this.database.query(`UPDATE product.catalog_products SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, code, status`, [status, productId]);
    if (!changed.rows.length) throw new NotFoundException("Product was not found.");
    return { ...(changed.rows[0] as object), changedBy: actorId };
  }

  public async createEdition(actorId: string, input: { productId: string; code: string; name: string }) {
    if (!input.productId || !/^[a-z0-9][a-z0-9_-]{1,62}$/.test(input.code) || !input.name.trim()) throw new BadRequestException("Edition is invalid.");
    const product = await this.database.query(`SELECT id FROM product.catalog_products WHERE id = $1 AND status != 'retired'`, [input.productId]);
    if (!product.rows.length) throw new NotFoundException("Product was not found.");
    const id = `edition_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.editions (id,product_id,code,name) VALUES ($1,$2,$3,$4)`, [id, input.productId, input.code, input.name.trim()]);
    return { id, productId: input.productId, code: input.code, createdBy: actorId };
  }

  public async createPlan(actorId: string, input: { editionId: string; code: string; name: string }) {
    if (!input.editionId || !/^[a-z0-9][a-z0-9_-]{1,62}$/.test(input.code) || !input.name.trim()) throw new BadRequestException("Plan is invalid.");
    const edition = await this.database.query(`SELECT id FROM product.editions WHERE id = $1 AND status = 'active'`, [input.editionId]);
    if (!edition.rows.length) throw new NotFoundException("Edition was not found.");
    const id = `plan_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.plans (id,edition_id,code,name,status) VALUES ($1,$2,$3,$4,'draft')`, [id, input.editionId, input.code, input.name.trim()]);
    return { id, editionId: input.editionId, code: input.code, createdBy: actorId };
  }

  public async createPlanVersion(actorId: string, input: { planId: string; version: number; effectiveFrom: string; priceCurrency: string; priceMinor: number; entitlements: unknown }) {
    const effectiveFrom = new Date(input.effectiveFrom);
    if (!Number.isSafeInteger(input.version) || input.version < 1 || Number.isNaN(effectiveFrom.valueOf()) || !/^[A-Z]{3}$/.test(input.priceCurrency) || !Number.isSafeInteger(input.priceMinor) || input.priceMinor < 0 || typeof input.entitlements !== "object" || input.entitlements === null || Array.isArray(input.entitlements)) throw new BadRequestException("Plan version is invalid.");
    const plan = await this.database.query(`SELECT id FROM product.plans WHERE id = $1 AND status != 'retired'`, [input.planId]);
    if (!plan.rows.length) throw new NotFoundException("Plan was not found.");
    const id = `plan_version_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.plan_versions (id,plan_id,version,effective_from,price_currency,price_minor,entitlements) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id, input.planId, input.version, effectiveFrom, input.priceCurrency, input.priceMinor, input.entitlements]);
    return { id, planId: input.planId, version: input.version, createdBy: actorId };
  }

  public async createAddon(actorId: string, input: { productId: string; code: string; name: string; entitlements: unknown }) {
    if (!input.productId || !/^[a-z0-9][a-z0-9_-]{1,62}$/.test(input.code) || !input.name.trim() || typeof input.entitlements !== "object" || input.entitlements === null || Array.isArray(input.entitlements)) throw new BadRequestException("Add-on is invalid.");
    const product = await this.database.query(`SELECT id FROM product.catalog_products WHERE id = $1 AND status != 'retired'`, [input.productId]);
    if (!product.rows.length) throw new NotFoundException("Product was not found.");
    const id = `addon_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.addons (id,product_id,code,name,entitlements) VALUES ($1,$2,$3,$4,$5)`, [id, input.productId, input.code, input.name.trim(), input.entitlements]);
    return { id, productId: input.productId, code: input.code, createdBy: actorId };
  }

  public async assignPlanAddon(actorId: string, planVersionId: string, addonId: string) {
    const check = await this.database.query(`SELECT version.id FROM product.plan_versions version JOIN product.plans plan ON plan.id = version.plan_id JOIN product.editions edition ON edition.id = plan.edition_id JOIN product.addons addon ON addon.id = $2 AND addon.product_id = edition.product_id WHERE version.id = $1`, [planVersionId, addonId]);
    if (!check.rows.length) throw new NotFoundException("Plan version or compatible add-on was not found.");
    await this.database.query(`INSERT INTO product.plan_version_addons (plan_version_id,addon_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [planVersionId, addonId]);
    return { planVersionId, addonId, assignedBy: actorId };
  }

  public async setAccountFlags(actorId: string, accountOrganizationId: string, input: { accountEnabled?: boolean; billingEnabled?: boolean; downloadsEnabled?: boolean; licenseEnforcementEnabled?: boolean; integrationEnabled?: boolean; telemetryEnabled?: boolean; syncEnabled?: boolean }) {
    const values = Object.entries(input).filter(([, value]) => typeof value === "boolean");
    if (!values.length) throw new BadRequestException("At least one account flag is required.");
    const columns: Record<string, string> = { accountEnabled: "account_enabled", billingEnabled: "billing_enabled", downloadsEnabled: "downloads_enabled", licenseEnforcementEnabled: "license_enforcement_enabled", integrationEnabled: "integration_enabled", telemetryEnabled: "telemetry_enabled", syncEnabled: "sync_enabled" };
    const clauses = values.map(([key], index) => `${columns[key]} = $${index + 1}`);
    const result = await this.database.query(`UPDATE product.account_organizations SET ${clauses.join(", ")}, updated_at = now() WHERE id = $${values.length + 1} RETURNING id, account_enabled, billing_enabled, downloads_enabled, license_enforcement_enabled, integration_enabled, telemetry_enabled, sync_enabled`, [...values.map(([, value]) => value), accountOrganizationId]);
    if (!result.rows.length) throw new NotFoundException("Product account was not found.");
    return { ...(result.rows[0] as object), changedBy: actorId };
  }

  public async grantLicense(actorId: string, input: { accountOrganizationId: string; productId: string; seatLimit: number }) {
    if (!Number.isSafeInteger(input.seatLimit) || input.seatLimit < 1) throw new BadRequestException("Seat limit is invalid.");
    const account = await this.database.query(`SELECT id FROM product.account_organizations WHERE id = $1 AND product_id = $2`, [input.accountOrganizationId, input.productId]);
    if (!account.rows.length) throw new NotFoundException("Product account was not found.");
    const id = `license_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.licenses (id,account_organization_id,product_id,status,seat_limit) VALUES ($1,$2,$3,'granted',$4)`, [id, input.accountOrganizationId, input.productId, input.seatLimit]);
    return { id, accountOrganizationId: input.accountOrganizationId, status: "granted", grantedBy: actorId };
  }

  public async setInstallationStatus(actorId: string, installationId: string, status: string) {
    if (!["active", "lease_expired", "revoked", "replaced"].includes(status)) throw new BadRequestException("Installation status is invalid.");
    const updated = await this.database.query(`UPDATE product.installations SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, account_organization_id, status`, [status, installationId]);
    if (!updated.rows.length) throw new NotFoundException("Installation was not found.");
    const row = updated.rows[0] as { id: string; account_organization_id: string; status: string };
    await this.database.query(`INSERT INTO product.account_events (id,account_organization_id,actor_id,event_type,idempotency_key,detail) VALUES ($1,$2,$3,'installation_status_changed',$4,$5) ON CONFLICT (account_organization_id,idempotency_key) DO NOTHING`, [randomUUID(), row.account_organization_id, actorId, `staff-installation-${installationId}-${status}`, { installationId, status }]);
    return { installationId: row.id, status: row.status, changedBy: actorId };
  }

  public async registerSigningKey(actorId: string, input: { keyId: string; algorithm: string; publicKey: string; notBefore: string; notAfter: string }) {
    const notBefore = new Date(input.notBefore); const notAfter = new Date(input.notAfter);
    if (!input.keyId.trim() || !input.algorithm.trim() || !input.publicKey.trim() || Number.isNaN(notBefore.valueOf()) || Number.isNaN(notAfter.valueOf()) || notAfter <= notBefore) throw new BadRequestException("Signing-key metadata is invalid.");
    const id = `signing_key_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.signing_key_metadata (id,key_id,algorithm,public_key,status,not_before,not_after) VALUES ($1,$2,$3,$4,'active',$5,$6)`, [id, input.keyId, input.algorithm, input.publicKey, notBefore, notAfter]);
    return { id, keyId: input.keyId, registeredBy: actorId };
  }

  public async setSigningKeyStatus(actorId: string, keyId: string, status: string) {
    if (!["active", "retiring", "revoked"].includes(status)) throw new BadRequestException("Signing-key status is invalid.");
    const result = await this.database.query(`UPDATE product.signing_key_metadata SET status = $1 WHERE key_id = $2 RETURNING key_id, status`, [status, keyId]);
    if (!result.rows.length) throw new NotFoundException("Signing key was not found.");
    return { ...(result.rows[0] as object), changedBy: actorId };
  }

  public async registerRelease(actorId: string, input: { productId: string; version: string; platform: string; checksumSha256: string; signature: string; keyId: string; storageReference: string }) {
    if (!input.productId || !input.version.trim() || !input.platform.trim() || !/^[a-f0-9]{64}$/.test(input.checksumSha256) || !input.signature.trim() || !input.keyId.trim() || !input.storageReference.trim()) throw new BadRequestException("Release metadata is invalid.");
    const key = await this.database.query(`SELECT key_id FROM product.signing_key_metadata WHERE key_id = $1 AND status = 'active' AND not_before <= now() AND not_after > now()`, [input.keyId]);
    if (!key.rows.length) throw new ConflictException("An active signing key is required.");
    const id = `release_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.releases (id,product_id,version,platform,checksum_sha256,signature,key_id,support_status,storage_reference) VALUES ($1,$2,$3,$4,$5,$6,$7,'supported',$8)`, [id, input.productId, input.version, input.platform, input.checksumSha256, input.signature, input.keyId, input.storageReference]);
    return { id, productId: input.productId, version: input.version, registeredBy: actorId };
  }

  public async upsertBillingProjection(actorId: string, input: { accountOrganizationId: string; canonicalInvoiceId: string; sourceEventKey: string; status: string; currency: string; amountMinor: number; dueAt?: string; paymentInstruction?: string }) {
    if (!input.accountOrganizationId || !input.canonicalInvoiceId || !input.sourceEventKey || !input.status || !/^[A-Z]{3}$/.test(input.currency) || !Number.isSafeInteger(input.amountMinor) || input.amountMinor < 0) throw new BadRequestException("Billing projection is invalid.");
    const account = await this.database.query(`SELECT id FROM product.account_organizations WHERE id = $1`, [input.accountOrganizationId]);
    if (!account.rows.length) throw new NotFoundException("Product account was not found.");
    const dueAt = input.dueAt === undefined ? null : new Date(input.dueAt);
    if (dueAt !== null && Number.isNaN(dueAt.valueOf())) throw new BadRequestException("Billing due date is invalid.");
    const id = `billing_projection_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.billing_projections (id,account_organization_id,canonical_invoice_id,source_event_key,status,currency,amount_minor,due_at,payment_instruction) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (account_organization_id,canonical_invoice_id) DO UPDATE SET status = EXCLUDED.status,currency = EXCLUDED.currency,amount_minor = EXCLUDED.amount_minor,due_at = EXCLUDED.due_at,payment_instruction = EXCLUDED.payment_instruction`, [id, input.accountOrganizationId, input.canonicalInvoiceId, input.sourceEventKey, input.status, input.currency, input.amountMinor, dueAt, input.paymentInstruction?.trim() || null]);
    return { accountOrganizationId: input.accountOrganizationId, canonicalInvoiceId: input.canonicalInvoiceId, projectedBy: actorId };
  }

  public async upsertSupportProjection(actorId: string, input: { accountOrganizationId: string; productId: string; sourceEventKey: string; title: string; status: string; publicDetail: string }) {
    if (!input.accountOrganizationId || !input.productId || !input.sourceEventKey || !input.title.trim() || !input.status.trim() || !input.publicDetail.trim()) throw new BadRequestException("Support projection is invalid.");
    const account = await this.database.query(`SELECT id FROM product.account_organizations WHERE id = $1 AND product_id = $2`, [input.accountOrganizationId, input.productId]);
    if (!account.rows.length) throw new NotFoundException("Product account was not found.");
    const id = `support_projection_${randomUUID()}`;
    await this.database.query(`INSERT INTO product.support_projections (id,account_organization_id,product_id,source_event_key,title,status,public_detail) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (account_organization_id,source_event_key) WHERE source_event_key IS NOT NULL DO UPDATE SET title = EXCLUDED.title,status = EXCLUDED.status,public_detail = EXCLUDED.public_detail`, [id, input.accountOrganizationId, input.productId, input.sourceEventKey, input.title.trim(), input.status.trim(), input.publicDetail.trim()]);
    return { accountOrganizationId: input.accountOrganizationId, sourceEventKey: input.sourceEventKey, projectedBy: actorId };
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

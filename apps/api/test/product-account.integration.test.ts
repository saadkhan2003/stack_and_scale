import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPostgresPoolFromEnv, runMigrations, type DatabasePool } from "@stack-and-scale/database";
import { AppModule } from "../src/app.module.js";

const ACCOUNT = "phase16-test-account"; const FOREIGN = "phase16-foreign-account"; const PRODUCT = "phase16-test-product";
const USER = "phase16-test-user"; const FOREIGN_USER = "phase16-foreign-user"; const SUBSCRIPTION = "phase16-test-subscription"; const INSTALLATION = "phase16-test-installation";

describe("product account control plane", () => {
  let app: INestApplication; let fastify: FastifyInstance; let pool: DatabasePool;
  beforeAll(async () => {
    await runMigrations(); pool = createPostgresPoolFromEnv();
    await pool.query(`INSERT INTO platform.organizations (id,name) VALUES ('phase16-org','Phase 16') ON CONFLICT DO NOTHING`);
    await pool.query(`INSERT INTO identity.users (id,external_subject,email) VALUES ($1,$1,'phase16@example.test'),($2,$2,'phase16-foreign@example.test') ON CONFLICT DO NOTHING`, [USER, FOREIGN_USER]);
    await pool.query(`INSERT INTO product.catalog_products (id,code,name,status) VALUES ($1,'phase16-product','Phase 16 Product','active') ON CONFLICT DO NOTHING`, [PRODUCT]);
    await pool.query(`INSERT INTO product.editions (id,product_id,code,name) VALUES ('phase16-edition',$1,'standard','Standard') ON CONFLICT DO NOTHING`, [PRODUCT]);
    await pool.query(`INSERT INTO product.plans (id,edition_id,code,name,status) VALUES ('phase16-plan','phase16-edition','core','Core','active') ON CONFLICT DO NOTHING`);
    await pool.query(`INSERT INTO product.plan_versions (id,plan_id,version,effective_from,price_currency,price_minor,entitlements) VALUES ('phase16-plan-v1','phase16-plan',1,'2020-01-01','USD',1000,'{"reports":true}') ON CONFLICT DO NOTHING`);
    await pool.query(`INSERT INTO product.addons (id,product_id,code,name,entitlements) VALUES ('phase16-addon',$1,'export','Export','{"exports":true}') ON CONFLICT DO NOTHING`, [PRODUCT]);
    await pool.query(`INSERT INTO product.plan_version_addons (plan_version_id,addon_id) VALUES ('phase16-plan-v1','phase16-addon') ON CONFLICT DO NOTHING`);
    await pool.query(`INSERT INTO product.account_organizations (id,product_id,display_name,status,account_enabled,license_enforcement_enabled,canonical_organization_id) VALUES ($1,$3,'Account','active',true,true,'phase16-org'),($2,$3,'Foreign','active',true,true,'phase16-org') ON CONFLICT (id) DO UPDATE SET account_enabled = true,status = 'active'`, [ACCOUNT, FOREIGN, PRODUCT]);
    await pool.query(`INSERT INTO product.account_memberships (id,account_organization_id,user_id,role,status) VALUES ('phase16-member',$1,$3,'admin','active'),('phase16-foreign-member',$2,$4,'member','active') ON CONFLICT DO NOTHING`, [ACCOUNT, FOREIGN, USER, FOREIGN_USER]);
    await pool.query(`INSERT INTO product.subscriptions (id,account_organization_id,plan_version_id,status,effective_at) VALUES ($1,$2,'phase16-plan-v1','active','2020-01-01') ON CONFLICT (id) DO UPDATE SET status = 'active', effective_at = EXCLUDED.effective_at, override_until = NULL`, [SUBSCRIPTION, ACCOUNT]);
    await pool.query(`INSERT INTO product.licenses (id,account_organization_id,product_id,status) VALUES ('phase16-license',$1,$2,'active') ON CONFLICT DO NOTHING`, [ACCOUNT, PRODUCT]);
    await pool.query(`INSERT INTO product.installations (id,license_id,account_organization_id,installation_key_hash,last_sequence,status) VALUES ($1,'phase16-license',$2,'${"a".repeat(64)}',0,'active') ON CONFLICT (id) DO UPDATE SET last_sequence = 0, status = 'active'`, [INSTALLATION, ACCOUNT]);
    await pool.query(`DELETE FROM product.subscription_events WHERE subscription_id = $1`, [SUBSCRIPTION]);
    await pool.query(`DELETE FROM product.entitlement_snapshots WHERE account_organization_id = $1`, [ACCOUNT]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile(); app = module.createNestApplication(new FastifyAdapter()); await app.init(); fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });
  afterAll(async () => { await app?.close(); await pool?.end(); });
  const request = (url: string, actor = USER, method: "GET" | "POST" = "GET", payload?: object) => fastify.inject({ method, url, headers: { "x-actor-id": actor }, ...(payload ? { payload } : {}) });

  it("enforces explicit active account membership and does not reveal another account", async () => {
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}`)).statusCode).toBe(200);
    expect((await request(`/api/v1/product-accounts/organizations/${FOREIGN}`)).statusCode).toBe(403);
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}`, FOREIGN_USER)).statusCode).toBe(403);
  });
  it("records only legal idempotent subscription transitions", async () => {
    const input = { status: "past_due", reason: "test", idempotencyKey: "phase16-transition-1" };
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/subscriptions/${SUBSCRIPTION}/transitions`, USER, "POST", input)).json()).toMatchObject({ status: "past_due", replayed: false });
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/subscriptions/${SUBSCRIPTION}/transitions`, USER, "POST", input)).json()).toMatchObject({ status: "past_due", replayed: true });
    const illegal = await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/subscriptions/${SUBSCRIPTION}/transitions`, USER, "POST", { status: "trial", reason: "illegal", idempotencyKey: "phase16-transition-2" });
    expect(illegal.statusCode).toBe(409);
  });
  it("issues increasing bounded entitlement snapshots and rejects stale leases", async () => {
    const snapshot = await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/entitlements/${USER}`);
    expect(snapshot.json()).toMatchObject({ contractVersion: "0.1", subscriptionStatus: "past_due", entitlements: { reports: true, exports: true } });
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/installations/${INSTALLATION}/leases`, USER, "POST", { sequence: 1 })).statusCode).toBe(201);
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/installations/${INSTALLATION}/leases`, USER, "POST", { sequence: 1 })).statusCode).toBe(409);
  });
  it("records idempotent branch and membership workflows without cross-account writes", async () => {
    const branch = await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/branches`, USER, "POST", { name: "Karachi", idempotencyKey: "phase16-branch-1" });
    expect(branch.statusCode).toBe(201);
    const branchId = (branch.json() as { branchId: string }).branchId;
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/branches`, USER, "POST", { name: "Karachi", idempotencyKey: "phase16-branch-1" })).json()).toMatchObject({ branchId, replayed: true });
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/branches/${branchId}/members/${USER}`, USER, "POST", { present: true, idempotencyKey: "phase16-branch-member-1" })).statusCode).toBe(201);
    const foreign = await request(`/api/v1/product-accounts/organizations/${FOREIGN}/branches/${branchId}/members/${FOREIGN_USER}`, FOREIGN_USER, "POST", { present: true, idempotencyKey: "phase16-foreign-write" });
    expect(foreign.statusCode).toBe(403);
  });
  it("enforces entitlement override expiry and preserves an active owner", async () => {
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/entitlement-overrides`, USER, "POST", { key: "priority", value: true, effectiveUntil: "2000-01-01T00:00:00.000Z", idempotencyKey: "phase16-expired-override" })).statusCode).toBe(400);
    expect((await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/entitlement-overrides`, USER, "POST", { key: "priority", value: true, idempotencyKey: "phase16-override" })).statusCode).toBe(201);
    await pool.query(`UPDATE product.account_memberships SET role = 'owner' WHERE id = 'phase16-member'`);
    const removeLastOwner = await request(`/api/v1/product-accounts/organizations/${ACCOUNT}/members/${USER}`, USER, "POST", { role: "admin", status: "active", idempotencyKey: "phase16-last-owner" });
    expect(removeLastOwner.statusCode).toBe(409);
    await pool.query(`UPDATE product.account_memberships SET role = 'admin' WHERE id = 'phase16-member'`);
  });
});

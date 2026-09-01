import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateKeyPairSync, verify } from "node:crypto";
import { canonicalProductIntegrationJson } from "@stack-and-scale/contracts";
import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";

import { AppModule } from "../src/app.module.js";
import { ProductIntegrationService } from "../src/product-integrations/product-integration.service.js";

const ACCOUNT = "phase17-test-account";
const PRODUCT = "phase17-test-product";
const INSTALLATION = "phase17-test-installation";
const pair = generateKeyPairSync("ed25519");
process.env["PRODUCT_ENTITLEMENT_SIGNING_PRIVATE_KEY_B64"] = Buffer.from(
  pair.privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
).toString("base64");
process.env["PRODUCT_ENTITLEMENT_SIGNING_KEY_ID"] = "phase17-test-key";

describe("product integration protocol", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  let integrations: ProductIntegrationService;
  let credential: string;
  beforeAll(async () => {
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query(
      `INSERT INTO platform.organizations (id,name) VALUES ('phase17-org','Phase 17') ON CONFLICT DO NOTHING`,
    );
    await pool.query(
      `INSERT INTO product.catalog_products (id,code,name,status) VALUES ($1,'phase17-product','Phase 17 Product','active') ON CONFLICT DO NOTHING`,
      [PRODUCT],
    );
    await pool.query(
      `INSERT INTO product.editions (id,product_id,code,name) VALUES ('phase17-edition',$1,'standard','Standard') ON CONFLICT DO NOTHING`,
      [PRODUCT],
    );
    await pool.query(
      `INSERT INTO product.plans (id,edition_id,code,name,status) VALUES ('phase17-plan','phase17-edition','core','Core','active') ON CONFLICT DO NOTHING`,
    );
    await pool.query(
      `INSERT INTO product.plan_versions (id,plan_id,version,effective_from,price_currency,price_minor,entitlements) VALUES ('phase17-plan-v1','phase17-plan',1,'2020-01-01','USD',0,'{"offline":true}') ON CONFLICT DO NOTHING`,
    );
    await pool.query(
      `INSERT INTO product.account_organizations (id,product_id,display_name,status,account_enabled,integration_enabled,telemetry_enabled,sync_enabled,canonical_organization_id) VALUES ($1,$2,'Phase 17 Account','active',true,true,true,true,'phase17-org') ON CONFLICT (id) DO UPDATE SET account_enabled = true,integration_enabled = true,telemetry_enabled = true,sync_enabled = true,status = 'active'`,
      [ACCOUNT, PRODUCT],
    );
    await pool.query(
      `INSERT INTO product.subscriptions (id,account_organization_id,plan_version_id,status,effective_at) VALUES ('phase17-subscription',$1,'phase17-plan-v1','active','2020-01-01') ON CONFLICT (id) DO UPDATE SET status = 'active'`,
      [ACCOUNT],
    );
    await pool.query(
      `INSERT INTO product.licenses (id,account_organization_id,product_id,status) VALUES ('phase17-license',$1,$2,'active') ON CONFLICT (id) DO UPDATE SET status = 'active'`,
      [ACCOUNT, PRODUCT],
    );
    await pool.query(
      `INSERT INTO product.installations (id,license_id,account_organization_id,installation_key_hash,status,last_sequence) VALUES ($1,'phase17-license',$2,'${"c".repeat(64)}','active',0) ON CONFLICT (id) DO UPDATE SET status = 'active',last_sequence = 0`,
      [INSTALLATION, ACCOUNT],
    );
    await pool.query(
      `INSERT INTO product.signing_key_metadata (id,key_id,algorithm,public_key,status,not_before,not_after) VALUES ('phase17-test-key-metadata','phase17-test-key','Ed25519',$1,'active','2020-01-01','2099-01-01') ON CONFLICT (key_id) DO UPDATE SET public_key = EXCLUDED.public_key,status = 'active'`,
      [pair.publicKey.export({ format: "pem", type: "spki" }).toString()],
    );
    await pool.query(
      `DELETE FROM product.installation_credentials WHERE installation_id = $1`,
      [INSTALLATION],
    );
    await pool.query(
      `DELETE FROM product.integration_leases WHERE installation_id = $1`,
      [INSTALLATION],
    );
    await pool.query(
      `DELETE FROM product.integration_sync_mutations WHERE installation_id = $1`,
      [INSTALLATION],
    );
    await pool.query(
      `DELETE FROM product.integration_conflicts WHERE installation_id = $1`,
      [INSTALLATION],
    );
    await pool.query(
      `DELETE FROM product.installation_heartbeats WHERE installation_id = $1`,
      [INSTALLATION],
    );
    await pool.query(
      `DELETE FROM product.integration_event_deliveries WHERE recipient_installation_id = $1`,
      [INSTALLATION],
    );
    await pool.query(
      `DELETE FROM product.integration_events WHERE account_organization_id = $1`,
      [ACCOUNT],
    );
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
    integrations = app.get(ProductIntegrationService);
    credential = (
      await integrations.provisionCredential(
        "phase17-staff",
        INSTALLATION,
        "2099-01-01T00:00:00.000Z",
      )
    ).credential;
  });
  afterAll(async () => {
    await app?.close();
    await pool?.end();
  });
  const request = (
    url: string,
    method: "GET" | "POST" = "GET",
    payload?: object,
  ) =>
    fastify.inject({
      method,
      url,
      headers: { "x-product-installation-credential": credential },
      ...(payload ? { payload } : {}),
    });

  it("requires an installation credential and issues a verifiable anti-rollback lease", async () => {
    expect(
      (
        await fastify.inject({
          method: "GET",
          url: "/api/v1/product-integrations/status",
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (await request("/api/v1/product-integrations/status")).statusCode,
    ).toBe(200);
    const response = await request(
      "/api/v1/product-integrations/lease",
      "POST",
    );
    expect(response.statusCode).toBe(201);
    const lease = JSON.parse(response.body) as Record<string, unknown>;
    const signature = lease["signature"];
    delete lease["signature"];
    expect(typeof signature).toBe("string");
    expect(
      verify(
        null,
        Buffer.from(canonicalProductIntegrationJson(lease)),
        pair.publicKey,
        Buffer.from(String(signature), "base64url"),
      ),
    ).toBe(true);
    expect(lease).toMatchObject({
      installationId: INSTALLATION,
      accountOrganizationId: ACCOUNT,
      sequence: 1,
      entitlements: { offline: true },
    });
    const eventsPayload = JSON.parse(
      (await request("/api/v1/product-integrations/events")).body,
    ) as { events: Array<Record<string, unknown>> };
    const event = eventsPayload.events[0];
    if (
      !event ||
      typeof event["eventId"] !== "string" ||
      typeof event["signature"] !== "string"
    )
      throw new Error("Signed event was not delivered.");
    const eventSignature = event["signature"];
    delete event["signature"];
    expect(
      verify(
        null,
        Buffer.from(canonicalProductIntegrationJson(event)),
        pair.publicKey,
        Buffer.from(eventSignature, "base64url"),
      ),
    ).toBe(true);
    expect(
      (
        await request(
          `/api/v1/product-integrations/events/${event["eventId"]}/ack`,
          "POST",
        )
      ).json(),
    ).toMatchObject({ acknowledged: true });
    expect(
      (
        JSON.parse(
          (await request("/api/v1/product-integrations/events")).body,
        ) as { events: unknown[] }
      ).events,
    ).toHaveLength(0);
  });

  it("rate-limits privacy-minimized heartbeats and preserves safe sync outcomes", async () => {
    const heartbeat = {
      softwareVersion: "1.0.0",
      leaseState: "valid",
      syncCursor: 0,
      syncStatus: "idle",
    };
    expect(
      (
        await request(
          "/api/v1/product-integrations/heartbeat",
          "POST",
          heartbeat,
        )
      ).json(),
    ).toMatchObject({ accepted: true });
    expect(
      (
        await request(
          "/api/v1/product-integrations/heartbeat",
          "POST",
          heartbeat,
        )
      ).json(),
    ).toMatchObject({ accepted: false, reason: "rate_limited" });
    const mutations = [
      {
        mutationId: "phase17-note-1",
        localSequence: 1,
        entityKind: "operational_note",
        payload: { note: "queued locally" },
      },
      {
        mutationId: "phase17-inventory-1",
        localSequence: 2,
        entityKind: "inventory",
        payload: { quantity: 9 },
      },
    ];
    expect(
      (
        await request("/api/v1/product-integrations/sync", "POST", {
          mutations,
        })
      ).json(),
    ).toMatchObject({
      cursor: 2,
      outcomes: [
        expect.objectContaining({
          mutationId: "phase17-note-1",
          outcome: "accepted",
        }),
        expect.objectContaining({
          mutationId: "phase17-inventory-1",
          outcome: "conflicted",
        }),
      ],
    });
    expect(
      (
        await request("/api/v1/product-integrations/sync", "POST", {
          mutations: [mutations[0]],
        })
      ).json(),
    ).toMatchObject({
      outcomes: [
        expect.objectContaining({
          mutationId: "phase17-note-1",
          replayed: true,
        }),
      ],
    });
    expect(
      Number(
        (
          await pool.query(
            `SELECT count(*)::int AS count FROM product.integration_conflicts WHERE installation_id = $1 AND mutation_id = 'phase17-inventory-1'`,
            [INSTALLATION],
          )
        ).rows[0]?.["count"],
      ),
    ).toBe(1);
  });

  it("backs off failed event delivery, dead-letters it, and permits audited replay", async () => {
    await request("/api/v1/product-integrations/lease", "POST");
    const event = (
      JSON.parse(
        (await request("/api/v1/product-integrations/events")).body,
      ) as { events: Array<{ eventId: string }> }
    ).events[0];
    if (!event) throw new Error("Lease event was not delivered.");
    expect(
      (
        await request(
          `/api/v1/product-integrations/events/${event.eventId}/failure`,
          "POST",
          { errorCode: "network.timeout" },
        )
      ).json(),
    ).toMatchObject({ status: "pending", attempt_count: 1 });
    await pool.query(
      `UPDATE product.integration_event_deliveries SET status = 'dead_letter' WHERE event_id = $1 AND recipient_installation_id = $2`,
      [event.eventId, INSTALLATION],
    );
    expect(
      await integrations.replayEvent(
        "phase17-staff",
        event.eventId,
        INSTALLATION,
      ),
    ).toMatchObject({ eventId: event.eventId, installationId: INSTALLATION });
    expect(
      (
        JSON.parse(
          (await request("/api/v1/product-integrations/events")).body,
        ) as { events: Array<{ eventId: string }> }
      ).events,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventId: event.eventId }),
      ]),
    );
  });

  it("rejects revoked credentials and prevents new leases from a revoked signing key", async () => {
    await pool.query(
      `UPDATE product.signing_key_metadata SET status = 'revoked' WHERE key_id = 'phase17-test-key'`,
    );
    expect(
      (await request("/api/v1/product-integrations/lease", "POST")).statusCode,
    ).toBe(409);
    await pool.query(
      `UPDATE product.signing_key_metadata SET status = 'active' WHERE key_id = 'phase17-test-key'`,
    );
    await integrations.revokeCredentials("phase17-staff", INSTALLATION);
    expect(
      (await request("/api/v1/product-integrations/status")).statusCode,
    ).toBe(403);
    credential = (
      await integrations.provisionCredential(
        "phase17-staff",
        INSTALLATION,
        "2099-01-01T00:00:00.000Z",
      )
    ).credential;
    expect(
      (await request("/api/v1/product-integrations/verification-keys"))
        .statusCode,
    ).toBe(200);
  });
});

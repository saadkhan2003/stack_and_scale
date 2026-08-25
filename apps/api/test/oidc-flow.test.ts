import {
  generateKeyPairSync,
  sign as cryptoSign,
  type KeyObject,
} from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createPostgresPoolFromEnv,
  type DatabasePool,
} from "@stack-and-scale/database";

import { AuthModule } from "../src/auth/auth.module.js";
import {
  OidcFlowService,
  SESSION_COOKIE,
} from "../src/auth/oidc-flow.service.js";
import {
  TOKEN_VALIDATOR,
  TokenValidator,
} from "../src/auth/token-validator.js";

const ISSUER = "https://keycloak.example.local/realms/stack-and-scale";
const CLIENT_ID = "web";
const AUDIENCE = CLIENT_ID;
const SUBJECT = "flow-subject-1";
const EMAIL = "flow-user@example.test";

function base64Url(input: object | Buffer): string {
  return Buffer.from(
    typeof input === "string" || Buffer.isBuffer(input)
      ? input
      : JSON.stringify(input),
  ).toString("base64url");
}

function makeKey(kid: string) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const jwk = publicKey.export({ format: "jwk" }) as Record<string, unknown>;
  return { kid, privateKey, jwk };
}

function makeIdToken(
  key: { kid: string; privateKey: KeyObject },
  claims: Record<string, unknown>,
): string {
  const header = { alg: "RS256", typ: "JWT", kid: key.kid };
  const signingInput = `${base64Url(header)}.${base64Url(claims)}`;
  const signature = cryptoSign("sha256", Buffer.from(signingInput), {
    key: key.privateKey,
  });
  return `${signingInput}.${base64Url(signature)}`;
}

describe("oidc browser flow", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  let key: ReturnType<typeof makeKey>;
  let fetchCalls: { url: string; body: URLSearchParams }[];
  let idTokenToReturn: string;
  let tokenEndpointStatus: number;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    key = makeKey("flow-key-1");

    const validator = new TokenValidator({
      issuers: [ISSUER],
      audience: AUDIENCE,
      loadJwks: () =>
        Promise.resolve({
          keys: [{ ...key.jwk, kid: key.kid }],
        }),
      resolveSubject: () => Promise.resolve(null),
      requireSubject: false,
    });

    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(TOKEN_VALIDATOR)
      .useValue(validator)
      .compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();

    pool = createPostgresPoolFromEnv();
    await pool.query(
      `CREATE TABLE IF NOT EXISTS platform.audit_events (
         id text PRIMARY KEY,
         organization_id text,
         actor_id text,
         action text NOT NULL,
         correlation_id text NOT NULL,
         occurred_at timestamptz NOT NULL DEFAULT now(),
         metadata jsonb NOT NULL DEFAULT '{}'::jsonb
       )`,
    );

    const flow = app.get(OidcFlowService);
    flow.configureValidator(validator);
    flow.configureFetcher((input, init) => {
      const body = init?.body;
      expect(body).toBeInstanceOf(URLSearchParams);
      fetchCalls.push({
        url: input instanceof Request ? input.url : input.toString(),
        body: body as URLSearchParams,
      });
      return Promise.resolve(
        new Response(JSON.stringify({ id_token: idTokenToReturn }), {
          status: tokenEndpointStatus,
          headers: { "content-type": "application/json" },
        }),
      );
    });

    process.env["STACK_AND_SCALE_OIDC_ISSUER"] = ISSUER;
    process.env["STACK_AND_SCALE_OIDC_CLIENT_ID"] = CLIENT_ID;
  });

  beforeEach(() => {
    fetchCalls = [];
    tokenEndpointStatus = 200;
    const nowSec = Math.floor(Date.now() / 1000);
    idTokenToReturn = makeIdToken(key, {
      iss: ISSUER,
      aud: AUDIENCE,
      azp: CLIENT_ID,
      sub: SUBJECT,
      email: EMAIL,
      preferred_username: "flow-user",
      exp: nowSec + 300,
      realm_access: { roles: ["member"] },
    });
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await pool.query(
        "DELETE FROM identity.sessions WHERE user_id = ANY($1)",
        [createdUserIds],
      );
      await pool.query("DELETE FROM identity.users WHERE id = ANY($1)", [
        createdUserIds,
      ]);
      await pool.query(
        "DELETE FROM platform.audit_events WHERE actor_id = ANY($1)",
        [createdUserIds],
      );
    }
    await app.close();
    await pool.end();
    delete process.env["STACK_AND_SCALE_OIDC_ISSUER"];
    delete process.env["STACK_AND_SCALE_OIDC_CLIENT_ID"];
  });

  function extractSetCookies(
    replyHeaders: Record<string, string | number | string[] | undefined>,
  ): Record<string, string> {
    const raw = replyHeaders["set-cookie"];
    const jar: Record<string, string> = {};
    const cookies =
      typeof raw === "string" ? [raw] : Array.isArray(raw) ? raw : [];
    for (const cookie of cookies) {
      const pair = cookie.split(";")[0];
      if (pair === undefined) {
        continue;
      }
      const index = pair.indexOf("=");
      if (index > 0) {
        jar[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
      }
    }
    return jar;
  }

  it("redirects sign-in start to the authorize endpoint with PKCE and state cookies", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/start",
    });

    expect(response.statusCode).toBe(302);
    const location = new URL(response.headers.location as string);
    expect(`${location.origin}${location.pathname}`).toBe(
      `${ISSUER}/protocol/openid-connect/auth`,
    );
    expect(location.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(location.searchParams.get("response_type")).toBe("code");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.get("code_challenge")).toBeTruthy();
    expect(location.searchParams.get("state")).toBeTruthy();

    const jar = extractSetCookies(response.headers);
    expect(jar["ss_oidc_state"]).toBe(location.searchParams.get("state"));
    expect(jar["ss_oidc_verifier"]).toBeTruthy();
  });

  it("completes the callback: validates id token, creates session and audit event", async () => {
    const start = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/start",
    });
    const startJar = extractSetCookies(start.headers);
    const state = startJar["ss_oidc_state"];

    const callback = await fastify.inject({
      method: "GET",
      url: `/api/auth/oidc/callback?state=${state}&code=auth-code-1`,
      headers: {
        cookie: `ss_oidc_state=${state}; ss_oidc_verifier=${startJar["ss_oidc_verifier"]}`,
      },
    });
    expect(callback.statusCode).toBe(302);
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]?.url).toBe(`${ISSUER}/protocol/openid-connect/token`);
    expect(fetchCalls[0]?.body.get("grant_type")).toBe("authorization_code");
    expect(fetchCalls[0]?.body.get("code_verifier")).toBe(
      startJar["ss_oidc_verifier"],
    );

    const jar = extractSetCookies(callback.headers);
    const sessionId = jar[SESSION_COOKIE];
    expect(sessionId).toBeTruthy();

    const session = await pool.query(
      "SELECT user_id, status, mfa_satisfied FROM identity.sessions WHERE id = $1",
      [sessionId],
    );
    expect(session.rows).toHaveLength(1);
    expect(session.rows[0]?.["status"]).toBe("active");
    createdUserIds.push(String(session.rows[0]?.["user_id"]));

    const audit = await pool.query(
      "SELECT action FROM platform.audit_events WHERE actor_id = $1 AND action = 'identity.login_succeeded'",
      [session.rows[0]?.["user_id"]],
    );
    expect(audit.rows).toHaveLength(1);
  });

  it("rejects a callback whose state does not match the cookie", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/callback?state=tampered&code=auth-code-2",
      headers: { cookie: "ss_oidc_state=expected; ss_oidc_verifier=ver" },
    });

    expect(response.statusCode).toBe(403);
    expect(fetchCalls).toHaveLength(0);
  });

  it("rejects the flow when the token endpoint fails", async () => {
    tokenEndpointStatus = 400;
    const start = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/start",
    });
    const jar = extractSetCookies(start.headers);

    const callback = await fastify.inject({
      method: "GET",
      url: `/api/auth/oidc/callback?state=${jar["ss_oidc_state"]}&code=bad-code`,
      headers: {
        cookie: `ss_oidc_state=${jar["ss_oidc_state"]}; ss_oidc_verifier=${jar["ss_oidc_verifier"]}`,
      },
    });

    expect(callback.statusCode).toBe(403);
  });

  it("denies privileged roles without an MFA claim", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    idTokenToReturn = makeIdToken(key, {
      iss: ISSUER,
      aud: AUDIENCE,
      azp: CLIENT_ID,
      sub: SUBJECT,
      email: EMAIL,
      exp: nowSec + 300,
      realm_access: { roles: ["admin"] },
    });

    const start = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/start",
    });
    const jar = extractSetCookies(start.headers);

    const callback = await fastify.inject({
      method: "GET",
      url: `/api/auth/oidc/callback?state=${jar["ss_oidc_state"]}&code=code-3`,
      headers: {
        cookie: `ss_oidc_state=${jar["ss_oidc_state"]}; ss_oidc_verifier=${jar["ss_oidc_verifier"]}`,
      },
    });

    expect(callback.statusCode).toBe(403);
    expect(callback.body).toContain("Multi-factor authentication");
  });

  it("allows privileged roles when the MFA claim is present", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    idTokenToReturn = makeIdToken(key, {
      iss: ISSUER,
      aud: AUDIENCE,
      azp: CLIENT_ID,
      sub: SUBJECT,
      email: EMAIL,
      exp: nowSec + 300,
      realm_access: { roles: ["admin", "mfa_verified"] },
    });

    const start = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/start",
    });
    const jar = extractSetCookies(start.headers);

    const callback = await fastify.inject({
      method: "GET",
      url: `/api/auth/oidc/callback?state=${jar["ss_oidc_state"]}&code=code-4`,
      headers: {
        cookie: `ss_oidc_state=${jar["ss_oidc_state"]}; ss_oidc_verifier=${jar["ss_oidc_verifier"]}`,
      },
    });

    expect(callback.statusCode).toBe(302);
    expect(extractSetCookies(callback.headers)[SESSION_COOKIE]).toBeTruthy();
  });

  it("logs out: revokes the session and redirects to the provider", async () => {
    const login = await fastify.inject({
      method: "GET",
      url: "/api/auth/oidc/start",
    });
    const loginJar = extractSetCookies(login.headers);
    const callback = await fastify.inject({
      method: "GET",
      url: `/api/auth/oidc/callback?state=${loginJar["ss_oidc_state"]}&code=code-5`,
      headers: {
        cookie: `ss_oidc_state=${loginJar["ss_oidc_state"]}; ss_oidc_verifier=${loginJar["ss_oidc_verifier"]}`,
      },
    });
    const sessionId = extractSetCookies(callback.headers)[SESSION_COOKIE];

    const logout = await fastify.inject({
      method: "GET",
      url: "/api/auth/logout",
      headers: { cookie: `${SESSION_COOKIE}=${sessionId}` },
    });

    expect(logout.statusCode).toBe(302);
    expect(logout.headers.location).toContain(
      "/protocol/openid-connect/logout",
    );
    const cleared = extractSetCookies(logout.headers);
    expect(cleared[SESSION_COOKIE]).toBe("");

    const row = await pool.query(
      "SELECT status FROM identity.sessions WHERE id = $1",
      [sessionId],
    );
    expect(row.rows[0]?.["status"]).toBe("revoked");
  });
});

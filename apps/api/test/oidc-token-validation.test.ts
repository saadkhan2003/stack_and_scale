import { generateKeyPairSync, sign as cryptoSign } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_OIDC_AUDIENCE,
  TokenValidator,
  readOidcAudience,
  readOidcIssuerAllowList,
} from "../src/auth/token-validator.js";

const ISSUER = "https://keycloak.example.local/realms/stack-and-scale";
const OTHER_ISSUER = "https://other.example.local/realms/other";
const AUDIENCE = "api";
const SUBJECT = "kc-subject-1";

function base64Url(input: object | Buffer): string {
  return Buffer.from(
    typeof input === "string" || Buffer.isBuffer(input)
      ? input
      : JSON.stringify(input),
  ).toString("base64url");
}

interface TestKey {
  kid: string;
  privateKey: ReturnType<typeof generateKeyPairSync>["privateKey"];
  jwk: Record<string, unknown>;
}

function makeKey(kid: string): TestKey {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const jwk = publicKey.export({ format: "jwk" }) as Record<string, unknown>;
  return { kid, privateKey, jwk };
}

function makeValidator(options: {
  keys: readonly TestKey[];
  issuers?: readonly string[];
  subjects?: ReadonlyMap<string, string>;
}): TokenValidator {
  const issuers = options.issuers ?? [ISSUER];
  const subjects = options.subjects ?? new Map([[SUBJECT, "actor-uuid-1"]]);
  return new TokenValidator({
    issuers,
    audience: AUDIENCE,
    loadJwks: (issuer) =>
      Promise.resolve(
        issuer === ISSUER
          ? { keys: options.keys.map((key) => ({ ...key.jwk, kid: key.kid })) }
          : { keys: [] },
      ),
    resolveSubject: (subject) => Promise.resolve(subjects.get(subject) ?? null),
  });
}

function makeToken(
  key: TestKey,
  claims: Record<string, unknown>,
  headerOverrides: Record<string, unknown> = {},
): string {
  const header = { alg: "RS256", typ: "JWT", kid: key.kid, ...headerOverrides };
  const signingInput = `${base64Url(header)}.${base64Url(claims)}`;
  const signature = cryptoSign("sha256", Buffer.from(signingInput), {
    key: key.privateKey,
    dsaEncoding: undefined,
  });
  return `${signingInput}.${base64Url(signature)}`;
}

const nowSeconds = Math.floor(Date.now() / 1000);

const validClaims = {
  iss: ISSUER,
  aud: AUDIENCE,
  sub: SUBJECT,
  exp: nowSeconds + 300,
};

describe("oidc token validation", () => {
  it("accepts a valid RS256 token and maps the subject to an actor id", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key] });
    const result = await validator.validate(makeToken(key, validClaims));
    expect(result).toEqual({
      valid: true,
      subject: SUBJECT,
      actorId: "actor-uuid-1",
    });
  });

  it("rejects a token signed by an untrusted issuer", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key], issuers: [] });
    const result = await validator.validate(makeToken(key, validClaims));
    expect(result).toEqual({ valid: false, reason: "untrusted_issuer" });
  });

  it("rejects a token whose issuer is not in the allow-list", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({
      keys: [key],
      issuers: [OTHER_ISSUER],
    });
    const result = await validator.validate(makeToken(key, validClaims));
    expect(result).toEqual({ valid: false, reason: "untrusted_issuer" });
  });

  it("rejects a token with a wrong audience", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key] });
    const result = await validator.validate(
      makeToken(key, { ...validClaims, aud: "web" }),
    );
    expect(result).toEqual({ valid: false, reason: "invalid_audience" });
  });

  it("accepts a token with audience array containing the expected value", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key] });
    const result = await validator.validate(
      makeToken(key, { ...validClaims, aud: ["web", AUDIENCE] }),
    );
    expect(result.valid).toBe(true);
  });

  it("rejects an expired token", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key] });
    const result = await validator.validate(
      makeToken(key, { ...validClaims, exp: nowSeconds - 10 }),
    );
    expect(result).toEqual({ valid: false, reason: "expired" });
  });

  it("rejects a not-yet-valid token", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key] });
    const result = await validator.validate(
      makeToken(key, { ...validClaims, nbf: nowSeconds + 300 }),
    );
    expect(result).toEqual({ valid: false, reason: "not_yet_valid" });
  });

  it("rejects a malformed token string", async () => {
    const validator = makeValidator({ keys: [] });
    const result = await validator.validate("not-a-jwt");
    expect(result).toEqual({ valid: false, reason: "malformed" });
  });

  it("rejects a token signed with a different key (invalid signature)", async () => {
    const signerKey = makeKey("attacker-key");
    const trustKey = makeKey("key-1");
    const validator = makeValidator({ keys: [trustKey] });
    const result = await validator.validate(
      makeToken(signerKey, validClaims, { kid: "key-1" }),
    );
    expect(result).toEqual({ valid: false, reason: "invalid_signature" });
  });

  it("rejects a token whose kid is absent from the JWKS", async () => {
    const key = makeKey("unknown-kid");
    const validator = makeValidator({ keys: [] });
    const result = await validator.validate(makeToken(key, validClaims));
    expect(result).toEqual({ valid: false, reason: "key_not_found" });
  });

  it("rejects a token with an unsupported algorithm", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({ keys: [key] });
    const token = makeToken(key, validClaims);
    const [, payload] = token.split(".");
    expect(payload).toBeDefined();
    const forgedHeader = base64Url({ alg: "HS256", typ: "JWT", kid: key.kid });
    const forged = `${forgedHeader}.${payload}.${"c2lnbmF0dXJl"}`;
    const result = await validator.validate(forged);
    expect(result).toEqual({ valid: false, reason: "unsupported_algorithm" });
  });

  it("rejects a subject without a known identity.users row", async () => {
    const key = makeKey("key-1");
    const validator = makeValidator({
      keys: [key],
      subjects: new Map(),
    });
    const result = await validator.validate(makeToken(key, validClaims));
    expect(result).toEqual({ valid: false, reason: "unknown_subject" });
  });

  it("reads the issuer allow-list from a comma-separated env value", () => {
    expect(readOidcIssuerAllowList(" https://a/x , https://b/y ,, ")).toEqual([
      "https://a/x",
      "https://b/y",
    ]);
    expect(readOidcIssuerAllowList(undefined)).toEqual([]);
  });

  it("defaults the audience to api when env is unset or blank", () => {
    expect(readOidcAudience(undefined)).toBe(DEFAULT_OIDC_AUDIENCE);
    expect(readOidcAudience("   ")).toBe(DEFAULT_OIDC_AUDIENCE);
    expect(readOidcAudience("custom-api")).toBe("custom-api");
  });
});

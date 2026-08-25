import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";

import { PlatformDatabaseService } from "../platform-database.service.js";

export const TOKEN_VALIDATOR = Symbol("TOKEN_VALIDATOR");

export const OIDC_ISSUER_ENV = "STACK_AND_SCALE_OIDC_ISSUER";
export const OIDC_AUDIENCE_ENV = "STACK_AND_SCALE_OIDC_AUDIENCE";
export const DEFAULT_OIDC_AUDIENCE = "api";

export type JwksLoader = (jwksUri: string) => Promise<unknown>;

export type SubjectResolver = (subject: string) => Promise<string | null>;

export interface TokenValidatorOptions {
  readonly issuers: readonly string[];
  readonly audience: string;
  readonly loadJwks: JwksLoader;
  readonly resolveSubject?: SubjectResolver;
}

export type TokenValidationResult =
  | Readonly<{ valid: true; subject: string; actorId: string }>
  | Readonly<{
      valid: false;
      reason:
        | "malformed"
        | "unsupported_algorithm"
        | "untrusted_issuer"
        | "invalid_audience"
        | "expired"
        | "not_yet_valid"
        | "key_not_found"
        | "invalid_signature"
        | "unknown_subject";
    }>;

interface JwkLike {
  kty?: unknown;
  kid?: unknown;
  alg?: unknown;
  use?: unknown;
  n?: unknown;
  e?: unknown;
}

interface JwtHeader {
  readonly alg: string;
  readonly kid?: string;
}

interface JwtClaims {
  readonly iss?: unknown;
  readonly aud?: unknown;
  readonly exp?: unknown;
  readonly nbf?: unknown;
  readonly azp?: unknown;
  readonly sub?: unknown;
}

type PublicKeyObject = ReturnType<typeof createPublicKey>;

function base64UrlDecode(segment: string): Buffer {
  return Buffer.from(segment, "base64url");
}

function parseJson<T>(buffer: Buffer): T | null {
  try {
    return JSON.parse(buffer.toString("utf8")) as T;
  } catch {
    return null;
  }
}

function audienceMatches(aud: unknown, expected: string): boolean {
  if (typeof aud === "string") {
    return aud === expected;
  }
  if (Array.isArray(aud)) {
    return aud.some((entry) => entry === expected);
  }
  return false;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export class TokenValidator {
  private readonly keyCache = new Map<string, Map<string, PublicKeyObject>>();

  public constructor(private readonly options: TokenValidatorOptions) {}

  public async validate(
    token: string,
    now: number = Date.now(),
  ): Promise<TokenValidationResult> {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, reason: "malformed" };
    }
    const encodedHeader = parts[0] as string;
    const encodedPayload = parts[1] as string;
    const encodedSignature = parts[2] as string;

    const header = parseJson<JwtHeader>(base64UrlDecode(encodedHeader));
    const claims = parseJson<JwtClaims>(base64UrlDecode(encodedPayload));
    if (header === null || claims === null || header.alg !== "RS256") {
      return header !== null && header.alg !== "RS256"
        ? { valid: false, reason: "unsupported_algorithm" }
        : { valid: false, reason: "malformed" };
    }

    const issuers = this.options.issuers;
    if (typeof claims.iss !== "string" || !issuers.includes(claims.iss)) {
      return { valid: false, reason: "untrusted_issuer" };
    }

    if (
      !audienceMatches(claims.aud, this.options.audience) &&
      claims.azp !== this.options.audience
    ) {
      return { valid: false, reason: "invalid_audience" };
    }

    const exp = asNumber(claims.exp);
    if (exp === null || now / 1000 >= exp) {
      return { valid: false, reason: "expired" };
    }

    const nbf = asNumber(claims.nbf);
    if (nbf !== null && now / 1000 < nbf) {
      return { valid: false, reason: "not_yet_valid" };
    }

    if (typeof claims.sub !== "string" || claims.sub.length === 0) {
      return { valid: false, reason: "malformed" };
    }

    const key = await this.findSigningKey(claims.iss, header.kid);
    if (key === null) {
      return { valid: false, reason: "key_not_found" };
    }

    const signature = base64UrlDecode(encodedSignature);
    const signed = Buffer.from(`${encodedHeader}.${encodedPayload}`, "utf8");
    const signatureValid = cryptoVerify("rsa-sha256", signed, key, signature);
    if (!signatureValid) {
      return { valid: false, reason: "invalid_signature" };
    }

    const resolve =
      this.options.resolveSubject ??
      ((): Promise<string | null> => Promise.resolve(null));
    const actorId = await resolve(claims.sub);
    if (actorId === null) {
      return { valid: false, reason: "unknown_subject" };
    }

    return { valid: true, subject: claims.sub, actorId };
  }

  private async findSigningKey(
    issuer: string,
    kid: string | undefined,
  ): Promise<PublicKeyObject | null> {
    let cacheKey = this.keyCache.get(issuer);
    if (cacheKey === undefined) {
      cacheKey = new Map();
      this.keyCache.set(issuer, cacheKey);
    }

    if (kid !== undefined) {
      const cached = cacheKey.get(kid);
      if (cached !== undefined) {
        return cached;
      }
    }

    await this.refreshKeys(issuer, cacheKey);

    if (kid === undefined) {
      return cacheKey.size === 1 ? ([...cacheKey.values()][0] ?? null) : null;
    }
    return cacheKey.get(kid) ?? null;
  }

  private async refreshKeys(
    issuer: string,
    cache: Map<string, PublicKeyObject>,
  ): Promise<void> {
    let jwks: unknown;
    try {
      jwks = await this.options.loadJwks(issuer);
    } catch {
      return;
    }

    if (
      jwks === null ||
      typeof jwks !== "object" ||
      !Array.isArray((jwks as { keys?: unknown }).keys)
    ) {
      return;
    }

    for (const jwk of (jwks as { keys: unknown }).keys as unknown[]) {
      if (jwk === null || typeof jwk !== "object") {
        continue;
      }
      const candidate = jwk as JwkLike;
      if (
        candidate.kty !== "RSA" ||
        typeof candidate.kid !== "string" ||
        typeof candidate.n !== "string" ||
        typeof candidate.e !== "string"
      ) {
        continue;
      }
      try {
        cache.set(
          candidate.kid,
          createPublicKey({ key: candidate as never, format: "jwk" }),
        );
      } catch {
        continue;
      }
    }
  }
}

@Injectable()
export class DatabaseSubjectResolver {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async resolve(subject: string): Promise<string | null> {
    const result = await this.database.query(
      `SELECT id
         FROM identity.users
        WHERE external_subject = $1`,
      [subject],
    );
    const id = result.rows[0]?.["id"];
    return typeof id === "string" && id.length > 0 ? id : null;
  }
}

export function readOidcIssuerAllowList(
  raw: string | undefined,
): readonly string[] {
  return (raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function readOidcAudience(raw: string | undefined): string {
  const value = raw?.trim();
  return value !== undefined && value.length > 0
    ? value
    : DEFAULT_OIDC_AUDIENCE;
}

export const defaultJwksLoader: JwksLoader = async (issuer) => {
  const configurationResponse = await fetch(
    `${issuer}/.well-known/openid-configuration`,
  );
  if (!configurationResponse.ok) {
    throw new Error(
      `discovery request failed: ${configurationResponse.status}`,
    );
  }
  const configuration = (await configurationResponse.json()) as {
    jwks_uri?: unknown;
  };
  if (typeof configuration.jwks_uri !== "string") {
    throw new Error("missing jwks_uri in discovery document");
  }
  const response = await fetch(configuration.jwks_uri);
  if (!response.ok) {
    throw new Error(`jwks request failed: ${response.status}`);
  }
  return response.json();
};

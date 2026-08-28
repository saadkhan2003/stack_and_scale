import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { recordIdentityAuditEvent } from "@stack-and-scale/database";
import {
  evaluateMfaRequirement,
  type StaffRole,
} from "@stack-and-scale/contracts";

import { PlatformDatabaseService } from "../platform-database.service.js";
import {
  TokenValidator,
  defaultJwksLoader,
  readOidcIssuerAllowList,
} from "./token-validator.js";

export const OIDC_CLIENT_ID_ENV = "STACK_AND_SCALE_OIDC_CLIENT_ID";
export const OIDC_REDIRECT_URI_ENV = "STACK_AND_SCALE_OIDC_REDIRECT_URI";
export const OIDC_POST_LOGOUT_REDIRECT_ENV =
  "STACK_AND_SCALE_OIDC_POST_LOGOUT_REDIRECT";
export const SESSION_COOKIE = "ss_session";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const STATE_COOKIE = "ss_oidc_state";
const VERIFIER_COOKIE = "ss_oidc_verifier";
const STATE_TTL_SECONDS = 600;

export type CookieSpec = Readonly<{
  name: string;
  value: string;
  maxAgeSeconds?: number;
  secure?: boolean;
}>;

export function serializeCookie(spec: CookieSpec): string {
  const parts = [
    `${spec.name}=${spec.value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (spec.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${spec.maxAgeSeconds}`);
  }
  if (spec.secure ?? process.env["NODE_ENV"] === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function parseCookies(
  header: string | undefined,
): Record<string, string> {
  const jar: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index > 0) {
      jar[part.slice(0, index).trim()] = part.slice(index + 1).trim();
    }
  }
  return jar;
}

function base64Url(input: Buffer): string {
  return input.toString("base64url");
}

function safeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

type TokenEndpointResponse = {
  id_token?: string;
  error?: string;
};

type IdTokenClaims = {
  sub?: unknown;
  email?: unknown;
  preferred_username?: unknown;
  amr?: unknown;
  realm_access?: { roles?: unknown };
};

@Injectable()
export class OidcFlowService {
  private flowValidator: TokenValidator | null = null;

  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public configureValidator(validator: TokenValidator): void {
    this.flowValidator = validator;
  }

  private validator(): TokenValidator {
    if (this.flowValidator !== null) {
      return this.flowValidator;
    }
    this.flowValidator = new TokenValidator({
      issuers: readOidcIssuerAllowList(
        process.env["STACK_AND_SCALE_OIDC_ISSUER"],
      ),
      audience: process.env[OIDC_CLIENT_ID_ENV] ?? "web",
      loadJwks: defaultJwksLoader,
      // This flow provisions a local identity after the token has been
      // cryptographically verified, so it must accept a new subject.
      requireSubject: false,
    });
    return this.flowValidator;
  }

  public issuer(): string {
    const issuer = process.env["STACK_AND_SCALE_OIDC_ISSUER"];
    if (issuer === undefined || issuer.trim().length === 0) {
      throw new Error("STACK_AND_SCALE_OIDC_ISSUER is not configured");
    }
    return issuer.replace(/\/$/, "");
  }

  private clientId(): string {
    return process.env[OIDC_CLIENT_ID_ENV] ?? "web";
  }

  private redirectUri(): string {
    return (
      process.env[OIDC_REDIRECT_URI_ENV] ??
      "http://127.0.0.1:3100/api/auth/oidc/callback"
    );
  }

  private postLogoutRedirect(): string {
    return (
      process.env[OIDC_POST_LOGOUT_REDIRECT_ENV] ?? "http://localhost:3000/"
    );
  }

  private fetchJson: typeof fetch = (input, init) => fetch(input, init);

  public configureFetcher(fetcher: typeof fetch): void {
    this.fetchJson = fetcher;
  }

  public buildAuthorizeRedirect(): {
    location: string;
    cookies: readonly CookieSpec[];
  } {
    const state = base64Url(randomBytes(16));
    const verifier = base64Url(randomBytes(32));
    const challenge = base64Url(createHash("sha256").update(verifier).digest());

    const url = new URL(`${this.issuer()}/protocol/openid-connect/auth`);
    url.searchParams.set("client_id", this.clientId());
    url.searchParams.set("redirect_uri", this.redirectUri());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid profile email");
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");

    return {
      location: url.toString(),
      cookies: [
        { name: STATE_COOKIE, value: state, maxAgeSeconds: STATE_TTL_SECONDS },
        {
          name: VERIFIER_COOKIE,
          value: verifier,
          maxAgeSeconds: STATE_TTL_SECONDS,
        },
      ],
    };
  }

  public isStateValid(
    stateCookie: string | undefined,
    stateQuery: string | undefined,
  ): boolean {
    if (
      stateCookie === undefined ||
      stateQuery === undefined ||
      stateCookie.length === 0 ||
      stateQuery.length === 0
    ) {
      return false;
    }
    return safeEquals(stateCookie, stateQuery);
  }

  public async exchangeCode(
    code: string,
    verifier: string,
  ): Promise<string | null> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.redirectUri(),
      client_id: this.clientId(),
      code_verifier: verifier,
    });

    const response = await this.fetchJson(
      `${this.issuer()}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as TokenEndpointResponse;
    return payload.id_token ?? null;
  }

  public staffRoleFromRealmRoles(roles: unknown): StaffRole | null {
    if (!Array.isArray(roles)) {
      return null;
    }
    for (const candidate of ["owner", "admin", "manager", "member"] as const) {
      if (roles.includes(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  public mfaDecisionForRole(
    role: StaffRole | null,
    claims: IdTokenClaims,
  ): "allow" | "deny" {
    const policy = { requiredRoles: ["owner", "admin"] as const };
    const realmRoles = claims.realm_access?.roles;
    const mfaSatisfied =
      (Array.isArray(realmRoles) && realmRoles.includes("mfa_verified")) ||
      (Array.isArray(claims.amr) && claims.amr.includes("mfa"));
    const decision = evaluateMfaRequirement({
      role: role ?? "member",
      mfaSatisfied,
      now: new Date().toISOString(),
      policy,
    });
    return decision.outcome === "allow" ? "allow" : "deny";
  }

  public async upsertUserFromClaims(
    subject: string,
    claims: IdTokenClaims,
  ): Promise<string | null> {
    const email = typeof claims.email === "string" ? claims.email : null;
    if (email === null) {
      return null;
    }
    const displayName =
      typeof claims.preferred_username === "string"
        ? claims.preferred_username
        : null;
    const result = await this.database.query(
      `INSERT INTO identity.users (id, external_subject, email, display_name, email_verified_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (external_subject) DO UPDATE
         SET email = EXCLUDED.email,
             display_name = EXCLUDED.display_name,
             version = identity.users.version + 1
       RETURNING id`,
      [
        `user-${subject.slice(0, 8)}-${base64Url(randomBytes(8))}`,
        subject,
        email,
        displayName,
      ],
    );
    const id = result.rows[0]?.["id"];
    return typeof id === "string" ? id : null;
  }

  public async createSession(
    userId: string,
    mfaSatisfied: boolean,
  ): Promise<string> {
    const sessionId = base64Url(randomBytes(24));
    await this.database.query(
      `INSERT INTO identity.sessions (id, user_id, status, mfa_satisfied, expires_at)
       VALUES ($1, $2, 'active', $3, now() + interval '12 hours')`,
      [sessionId, userId, mfaSatisfied],
    );
    return sessionId;
  }

  public async finalizeLogin(
    userId: string,
    role: StaffRole | null,
  ): Promise<CookieSpec | null> {
    await recordIdentityAuditEvent(this.database, {
      id: base64Url(randomBytes(12)),
      eventName: "login_succeeded",
      correlationId: base64Url(randomBytes(8)),
      actorId: userId,
      metadata: { role: role ?? "unknown" },
    });
    const sessionId = await this.createSession(userId, true);
    return {
      name: SESSION_COOKIE,
      value: sessionId,
      maxAgeSeconds: SESSION_TTL_MS / 1000,
    };
  }

  public buildLogoutRedirect(): {
    location: string;
    cookies: readonly CookieSpec[];
  } {
    const url = new URL(`${this.issuer()}/protocol/openid-connect/logout`);
    url.searchParams.set("post_logout_redirect_uri", this.postLogoutRedirect());
    return {
      location: url.toString(),
      cookies: [
        { name: SESSION_COOKIE, value: "", maxAgeSeconds: 0 },
        { name: STATE_COOKIE, value: "", maxAgeSeconds: 0 },
        { name: VERIFIER_COOKIE, value: "", maxAgeSeconds: 0 },
      ],
    };
  }

  public async revokeSession(sessionId: string): Promise<boolean> {
    const result = await this.database.query(
      `UPDATE identity.sessions
          SET status = 'revoked', revoked_at = now()
        WHERE id = $1 AND status = 'active'
       RETURNING id`,
      [sessionId],
    );
    return result.rows.length > 0;
  }

  public parseIdTokenClaims(idToken: string): IdTokenClaims | null {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return null;
    }
    try {
      const claims = JSON.parse(
        Buffer.from(parts[1] as string, "base64url").toString("utf8"),
      ) as IdTokenClaims;
      return claims;
    } catch {
      return null;
    }
  }

  public async validateIdToken(
    idToken: string,
  ): Promise<
    { valid: true; subject: string } | { valid: false; reason: string }
  > {
    const result = await this.validator().validate(idToken);
    return result.valid
      ? { valid: true, subject: result.subject }
      : { valid: false, reason: result.reason };
  }
}

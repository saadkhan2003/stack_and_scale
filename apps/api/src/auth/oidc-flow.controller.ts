import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { RateLimitInterceptor } from "../common/http/rate-limit.interceptor.js";
import { UseInterceptors } from "@nestjs/common";
import {
  OidcFlowService,
  SESSION_COOKIE,
  parseCookies,
  serializeCookie,
} from "./oidc-flow.service.js";

@Controller("api/auth")
@UseInterceptors(RateLimitInterceptor)
export class OidcFlowController {
  public constructor(
    @Inject(OidcFlowService)
    private readonly oidc: OidcFlowService,
  ) {}

  @Get("oidc/start")
  public start(@Res() reply: FastifyReply): void {
    const { location, cookies } = this.oidc.buildAuthorizeRedirect();
    reply.header("set-cookie", cookies.map(serializeCookie));
    reply.code(302).redirect(location);
  }

  @Get("oidc/callback")
  public async callback(
    @Req() request: FastifyRequest,
    @Query("state") state: string | undefined,
    @Query("code") code: string | undefined,
    @Query("error") error: string | undefined,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const jar = parseCookies(request.headers.cookie);

    if (
      error !== undefined ||
      !this.oidc.isStateValid(jar["ss_oidc_state"], state)
    ) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }

    const verifier = jar["ss_oidc_verifier"];
    if (verifier === undefined || code === undefined) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }

    const idToken = await this.oidc.exchangeCode(code, verifier);
    if (idToken === null) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }

    const validation = await this.oidc.validateIdToken(idToken);
    if (!validation.valid) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }

    const claims = this.oidc.parseIdTokenClaims(idToken);
    if (claims === null) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }

    const role = this.oidc.staffRoleFromRealmRoles(claims.realm_access?.roles);
    if (this.oidc.mfaDecisionForRole(role, claims) === "deny") {
      throw new ForbiddenException(
        "Multi-factor authentication is required for this account.",
      );
    }

    const userId = await this.oidc.upsertUserFromClaims(
      validation.subject,
      claims,
    );
    if (userId === null) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }

    const sessionCookie = await this.oidc.finalizeLogin(userId, role);
    if (sessionCookie === null) {
      throw new ForbiddenException("Sign-in could not be completed.");
    }
    reply.header("set-cookie", [
      serializeCookie(sessionCookie),
      serializeCookie({ name: "ss_oidc_state", value: "", maxAgeSeconds: 0 }),
      serializeCookie({
        name: "ss_oidc_verifier",
        value: "",
        maxAgeSeconds: 0,
      }),
    ]);
    // This session belongs to the public site's staff CRM, not Payload's
    // separately authenticated CMS administration surface.
    reply.code(302).redirect("/staff/leads");
  }

  @Get("logout")
  public async logout(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const jar = parseCookies(request.headers.cookie);
    const session = jar[SESSION_COOKIE];
    if (session !== undefined) {
      await this.oidc.revokeSession(session);
    }
    const { location, cookies } = this.oidc.buildLogoutRedirect();
    reply.header("set-cookie", cookies.map(serializeCookie));
    reply.code(302).redirect(location);
  }
}

import { Module, type Provider } from "@nestjs/common";

import { PlatformDatabaseService } from "../platform-database.service.js";

import { ActorResolverService } from "./actor-resolver.service.js";
import { OidcFlowService } from "./oidc-flow.service.js";
import { OidcFlowController } from "./oidc-flow.controller.js";
import { RateLimitModule } from "../common/http/rate-limit.module.js";
import {
  DatabaseSubjectResolver,
  TOKEN_VALIDATOR,
  TokenValidator,
  defaultJwksLoader,
  readOidcAudience,
  readOidcIssuerAllowList,
  OIDC_AUDIENCE_ENV,
  OIDC_ISSUER_ENV,
} from "./token-validator.js";

const tokenValidatorProvider: Provider = {
  provide: TOKEN_VALIDATOR,
  useFactory: (resolver: DatabaseSubjectResolver) =>
    new TokenValidator({
      issuers: readOidcIssuerAllowList(process.env[OIDC_ISSUER_ENV]),
      audience: readOidcAudience(process.env[OIDC_AUDIENCE_ENV]),
      loadJwks: defaultJwksLoader,
      resolveSubject: (subject) => resolver.resolve(subject),
    }),
  inject: [DatabaseSubjectResolver],
};

@Module({
  imports: [RateLimitModule],
  controllers: [OidcFlowController],
  providers: [
    PlatformDatabaseService,
    DatabaseSubjectResolver,
    tokenValidatorProvider,
    ActorResolverService,
    OidcFlowService,
  ],
  exports: [tokenValidatorProvider, ActorResolverService],
})
export class AuthModule {}

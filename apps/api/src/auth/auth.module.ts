import { Module, type Provider } from "@nestjs/common";

import { PlatformDatabaseService } from "../platform-database.service.js";

import { ActorResolverService } from "./actor-resolver.service.js";
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
  providers: [
    PlatformDatabaseService,
    DatabaseSubjectResolver,
    tokenValidatorProvider,
    ActorResolverService,
  ],
  exports: [tokenValidatorProvider, ActorResolverService],
})
export class AuthModule {}

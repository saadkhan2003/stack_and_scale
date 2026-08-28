import { relayOidcRequest } from "../../../../../src/oidc-proxy";

export async function GET(request: Request): Promise<Response> {
  return relayOidcRequest(request, "/api/auth/oidc/callback");
}

import { verify } from "node:crypto";
import {
  canonicalProductIntegrationJson,
  type EntitlementLease,
  type ProductIntegrationEvent,
} from "@stack-and-scale/contracts";

export type LeaseState = "valid" | "grace" | "expired" | "revoked";
export type VerificationKeys = Readonly<
  Record<
    string,
    | Readonly<{ publicKey: string; status: "active" | "retiring" | "revoked" }>
    | string
  >
>;

export class OfflineLeaseStore {
  private lastSequence = 0;
  private current: EntitlementLease | undefined;

  public accept(
    lease: EntitlementLease,
    verificationKeys: VerificationKeys,
  ): void {
    const entry = verificationKeys[lease.keyId];
    const publicKey = typeof entry === "string" ? entry : entry?.publicKey;
    if (!publicKey)
      throw new Error("No verification key is available for this lease.");
    if (typeof entry === "object" && entry.status === "revoked")
      throw new Error("Lease signing key is revoked.");
    const { signature, ...unsigned } = lease;
    if (
      !verify(
        null,
        Buffer.from(canonicalProductIntegrationJson(unsigned)),
        publicKey,
        Buffer.from(signature, "base64url"),
      )
    )
      throw new Error("Lease signature is invalid.");
    if (lease.sequence <= this.lastSequence)
      throw new Error("Lease sequence must advance.");
    if (
      Date.parse(lease.expiresAt) <= Date.parse(lease.issuedAt) ||
      Date.parse(lease.graceUntil) < Date.parse(lease.expiresAt)
    )
      throw new Error("Lease time window is invalid.");
    this.lastSequence = lease.sequence;
    this.current = lease;
  }

  public status(now = new Date()): LeaseState {
    if (!this.current) return "expired";
    if (now.valueOf() <= Date.parse(this.current.expiresAt)) return "valid";
    if (now.valueOf() <= Date.parse(this.current.graceUntil)) return "grace";
    return "expired";
  }

  public entitlements(now = new Date()): Record<string, unknown> {
    const state = this.status(now);
    if (state === "expired" || state === "revoked" || !this.current) return {};
    return { ...this.current.entitlements };
  }
}

export class EventDeduplicator {
  private readonly ids = new Set<string>();
  public accept(
    event: ProductIntegrationEvent,
    verificationKeys: VerificationKeys,
  ): boolean {
    const entry = verificationKeys[event.keyId];
    const publicKey = typeof entry === "string" ? entry : entry?.publicKey;
    if (!publicKey)
      throw new Error("No verification key is available for this event.");
    if (typeof entry === "object" && entry.status === "revoked")
      throw new Error("Event signing key is revoked.");
    const { signature, ...unsigned } = event;
    if (
      !verify(
        null,
        Buffer.from(canonicalProductIntegrationJson(unsigned)),
        publicKey,
        Buffer.from(signature, "base64url"),
      )
    )
      throw new Error("Event signature is invalid.");
    if (this.ids.has(event.eventId)) return false;
    this.ids.add(event.eventId);
    return true;
  }
}

export type IntegrationTransport = Readonly<{
  request: (
    path: string,
    init?: Readonly<{
      method?: "GET" | "POST";
      body?: unknown;
      idempotencyKey?: string;
    }>,
  ) => Promise<unknown>;
}>;

export class ProductIntegrationClient {
  public constructor(
    private readonly transport: IntegrationTransport,
    private readonly retryAttempts = 3,
  ) {}
  public async request(
    path: string,
    init?: Readonly<{
      method?: "GET" | "POST";
      body?: unknown;
      idempotencyKey?: string;
    }>,
  ): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt < this.retryAttempts; attempt += 1) {
      try {
        return await this.transport.request(path, init);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Integration request failed.");
  }
}

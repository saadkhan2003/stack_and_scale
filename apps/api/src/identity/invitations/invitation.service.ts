import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import {
  randomBytes,
  createHash,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";
import {
  authorize,
  isStaffRole,
  type Permission,
  type StaffRole,
} from "@stack-and-scale/contracts";
import { recordIdentityAuditEvent } from "@stack-and-scale/database";

import { PlatformDatabaseService } from "../../platform-database.service.js";

export type InvitationDecision =
  | Readonly<{ allowed: true; role: StaffRole }>
  | Readonly<{
      allowed: false;
      reason:
        | "unauthenticated"
        | "actor_not_member"
        | "membership_suspended"
        | "permission_not_granted";
    }>;

export type CreateInvitationResult = Readonly<{
  id: string;
  email: string;
  role: StaffRole;
  token: string;
  expiresAt: Date;
}>;

type MembershipRow = Readonly<{ role: string; status: string }>;

type InvitationRow = Readonly<{
  id: string;
  organization_id: string;
  email: string;
  role: string;
  token_hash: string;
  status: string;
  expires_at: Date;
  consumed_at: Date | null;
}>;

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class InvitationService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async authorizeAction(
    actorId: string | undefined,
    organizationId: string,
    permission: Permission,
    assigningRole: StaffRole | undefined,
  ): Promise<InvitationDecision> {
    if (actorId === undefined || actorId.trim().length === 0) {
      return { allowed: false, reason: "unauthenticated" };
    }

    const result = await this.database.query(
      `SELECT role, status
         FROM identity.memberships
        WHERE user_id = $1 AND organization_id = $2`,
      [actorId, organizationId],
    );

    const row = result.rows[0] as MembershipRow | undefined;
    const decision = authorize(
      assigningRole === undefined
        ? {
            membership:
              row === undefined
                ? null
                : {
                    organizationId,
                    actorId,
                    role: row.role,
                    status: row.status === "suspended" ? "suspended" : "active",
                  },
            organizationId,
            permission,
          }
        : {
            membership: {
              organizationId,
              actorId,
              role: row?.role ?? "",
              status: row?.status === "suspended" ? "suspended" : "active",
            },
            organizationId,
            permission,
            assigningRole,
          },
    );

    if (!decision.allowed) {
      return {
        allowed: false,
        reason:
          decision.reason === "membership_suspended" ||
          decision.reason === "permission_not_granted"
            ? decision.reason
            : "actor_not_member",
      };
    }

    return { allowed: true, role: decision.role };
  }

  public async create(
    input: Readonly<{
      organizationId: string;
      email: string;
      role: StaffRole;
      invitedBy: string;
    }>,
  ): Promise<CreateInvitationResult> {
    await this.database.query(
      `UPDATE identity.invitations
          SET status = 'expired'
        WHERE organization_id = $1
          AND LOWER(email) = LOWER($2)
          AND status = 'pending'
          AND expires_at < now()`,
      [input.organizationId, input.email],
    );

    const existing = await this.database.query(
      `SELECT id
         FROM identity.invitations
        WHERE organization_id = $1
          AND LOWER(email) = LOWER($2)
          AND status = 'pending'`,
      [input.organizationId, input.email],
    );

    if (existing.rows.length > 0) {
      throw new ConflictError(
        "A pending invitation already exists for this member.",
      );
    }

    const token = randomBytes(32).toString("base64url");
    const id = `inv-${randomBytes(12).toString("hex")}`;
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.database.query(
      `INSERT INTO identity.invitations
           (id, organization_id, email, role, token_hash, status, invited_by_user_id, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)`,
      [
        id,
        input.organizationId,
        input.email,
        input.role,
        hashInvitationToken(token),
        input.invitedBy,
        expiresAt,
      ],
    );

    await recordIdentityAuditEvent(this.database, {
      id: randomUUID(),
      eventName: "invitation_created",
      correlationId: input.organizationId,
      organizationId: input.organizationId,
      actorId: input.invitedBy,
      metadata: { invitationId: id, role: input.role },
    });

    return {
      id,
      email: input.email,
      role: input.role,
      token,
      expiresAt,
    };
  }

  public async accept(
    input: Readonly<{ id: string; token: string; actorId: string }>,
  ): Promise<
    | Readonly<{
        accepted: true;
        invitation: Readonly<{
          id: string;
          organizationId: string;
          email: string;
          role: StaffRole;
        }>;
      }>
    | Readonly<{ accepted: false }>
  > {
    const result = await this.database.query(
      `SELECT id, organization_id, email, role, token_hash, status, expires_at, consumed_at
         FROM identity.invitations
        WHERE id = $1`,
      [input.id],
    );
    const row = result.rows[0] as InvitationRow | undefined;

    if (
      row === undefined ||
      row.status !== "pending" ||
      row.consumed_at !== null ||
      row.expires_at.getTime() <= Date.now() ||
      !safeTokenEquals(input.token, row.token_hash)
    ) {
      return { accepted: false };
    }

    await this.database.query(
      `UPDATE identity.invitations
          SET status = 'accepted', consumed_at = now()
        WHERE id = $1 AND status = 'pending'`,
      [row.id],
    );

    await this.database.query(
      `INSERT INTO identity.memberships
           (id, user_id, organization_id, role, status, invited_by_user_id, accepted_at)
         VALUES ($1, $2, $3, $4, 'active', $5, now())
       ON CONFLICT (user_id, organization_id)
         DO UPDATE SET role = EXCLUDED.role,
                       status = 'active',
                       accepted_at = now(),
                       version = identity.memberships.version + 1`,
      [
        `ms-${randomBytes(12).toString("hex")}`,
        input.actorId,
        row.organization_id,
        row.role,
        null,
      ],
    );

    await recordIdentityAuditEvent(this.database, {
      id: randomUUID(),
      eventName: "invitation_accepted",
      correlationId: row.id,
      organizationId: row.organization_id,
      actorId: input.actorId,
      metadata: { invitationId: row.id, role: row.role },
    });

    return {
      accepted: true,
      invitation: {
        id: row.id,
        organizationId: row.organization_id,
        email: row.email,
        role: isStaffRole(row.role) ? row.role : "member",
      },
    };
  }
}

function safeTokenEquals(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashInvitationToken(token), "utf8");
  const expected = Buffer.from(expectedHash, "utf8");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

class ConflictError extends HttpException {
  public constructor(message: string) {
    super({ code: "CONFLICT", message }, HttpStatus.CONFLICT);
  }
}

import { Inject, Injectable } from "@nestjs/common";

import { PlatformDatabaseService } from "../../platform-database.service.js";

export const SESSION_IDLE_EXPIRY_MS = 12 * 60 * 60 * 1000;

export type SessionView = Readonly<{
  id: string;
  organizationId: string | null;
  status: "active";
  mfaSatisfied: boolean;
  expiresAt: string;
  createdAt: string;
}>;

type SessionRow = {
  id: string;
  organization_id: string | null;
  mfa_satisfied: boolean;
  expires_at: Date;
  created_at: Date;
};

@Injectable()
export class SessionService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async listActive(actorId: string): Promise<SessionView[]> {
    const result = await this.database.query(
      `SELECT id, organization_id, mfa_satisfied, expires_at, created_at
         FROM identity.sessions
        WHERE user_id = $1
          AND status = 'active'
          AND expires_at > now()
        ORDER BY created_at DESC`,
      [actorId],
    );

    return (result.rows as SessionRow[]).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      status: "active",
      mfaSatisfied: row.mfa_satisfied,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
    }));
  }

  public async revokeOwn(actorId: string, sessionId: string): Promise<boolean> {
    const result = await this.database.query(
      `UPDATE identity.sessions
          SET status = 'revoked', revoked_at = now()
        WHERE id = $1
          AND user_id = $2
          AND status = 'active'
          AND expires_at > now()
       RETURNING id`,
      [sessionId, actorId],
    );

    return result.rows.length > 0;
  }
}

import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PlatformDatabaseService } from "../platform-database.service.js";

@Injectable()
export class ProvisioningService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}
  public async list(organizationId: string) {
    const result = await this.database.query(
      "SELECT * FROM platform.provisioning_requests WHERE organization_id=$1 ORDER BY updated_at DESC LIMIT 200",
      [organizationId],
    );
    return { data: result.rows };
  }
  public async get(organizationId: string, id: string) {
    const request = await this.database.query(
      "SELECT * FROM platform.provisioning_requests WHERE id=$1 AND organization_id=$2",
      [id, organizationId],
    );
    if (!request.rows[0])
      throw new NotFoundException("Provisioning request not found.");
    const steps = await this.database.query(
      "SELECT * FROM platform.provisioning_steps WHERE request_id=$1 AND organization_id=$2 ORDER BY position",
      [id, organizationId],
    );
    return { data: { ...request.rows[0], steps: steps.rows } };
  }
  public async create(
    organizationId: string,
    actorId: string,
    input: {
      customerId?: string;
      sourceType: string;
      sourceId: string;
      idempotencyKey: string;
      ownerId?: string;
      steps: readonly {
        key: string;
        privileged?: boolean;
        highCost?: boolean;
        ownerId?: string;
      }[];
    },
  ) {
    if (
      !input.sourceId.trim() ||
      !input.idempotencyKey.trim() ||
      input.steps.length === 0
    )
      throw new ConflictException(
        "An accepted outcome, idempotency key and steps are required.",
      );
    const existing = await this.database.query(
      "SELECT * FROM platform.provisioning_requests WHERE organization_id=$1 AND idempotency_key=$2",
      [organizationId, input.idempotencyKey],
    );
    if (existing.rows[0])
      return this.get(organizationId, String(existing.rows[0].id));
    const id = `provision_${randomUUID()}`;
    const privileged = input.steps.some(
      (step) => step.privileged === true || step.highCost === true,
    );
    let approvalId: string | null = null;
    if (privileged) {
      const approval = await this.database.query(
        "INSERT INTO platform.approval_requests (id,organization_id,requester_id,resource_type,resource_id,reason,expires_at) VALUES ($1,$2,$3,'provisioning',$4,$5,now()+interval '7 days') RETURNING id",
        [
          `approval_${randomUUID()}`,
          organizationId,
          actorId,
          id,
          "Approve privileged or high-cost customer provisioning",
        ],
      );
      if (!approval.rows[0])
        throw new ConflictException("Provisioning approval was not created.");
      approvalId = String(approval.rows[0].id);
    }
    await this.database.query(
      "INSERT INTO platform.provisioning_requests (id,organization_id,customer_id,source_type,source_id,idempotency_key,status,owner_id,requested_by,approval_request_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [
        id,
        organizationId,
        input.customerId ?? null,
        input.sourceType,
        input.sourceId,
        input.idempotencyKey,
        privileged ? "blocked" : "pending",
        input.ownerId ?? actorId,
        actorId,
        approvalId,
      ],
    );
    for (const [position, step] of input.steps.entries())
      await this.database.query(
        "INSERT INTO platform.provisioning_steps (id,organization_id,request_id,step_key,position,owner_id,privileged,high_cost,approval_request_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          `provision_step_${randomUUID()}`,
          organizationId,
          id,
          step.key,
          position,
          step.ownerId ?? input.ownerId ?? actorId,
          step.privileged === true,
          step.highCost === true,
          approvalId,
        ],
      );
    await this.database.query(
      "INSERT INTO platform.outbox_events (id,event_type,organization_id,correlation_id,payload) VALUES ($1,'provisioning.requested',$2,$3,$4::jsonb)",
      [
        `event_${randomUUID()}`,
        organizationId,
        `provisioning:${id}`,
        JSON.stringify({ provisioningRequestId: id }),
      ],
    );
    return this.get(organizationId, id);
  }
  public async retry(organizationId: string, actorId: string, id: string) {
    const result = await this.database.query(
      "UPDATE platform.provisioning_requests SET status='pending', failure_reason=NULL, retry_count=retry_count+1, updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='failed' RETURNING id,status,retry_count",
      [id, organizationId],
    );
    if (!result.rows[0])
      throw new ConflictException(
        "Only failed provisioning requests can be retried.",
      );
    await this.database.query(
      "UPDATE platform.provisioning_steps SET status='pending', failure_reason=NULL, updated_at=now() WHERE request_id=$1 AND organization_id=$2 AND status='failed'",
      [id, organizationId],
    );
    await this.database.query(
      "INSERT INTO platform.audit_events (id,organization_id,actor_id,action,correlation_id,metadata) VALUES ($1,$2,$3,'provisioning.retry',$4,$5::jsonb)",
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        `provisioning-${id}`,
        JSON.stringify({ requestId: id }),
      ],
    );
    return { data: result.rows[0] };
  }
}

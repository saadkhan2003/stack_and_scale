import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PlatformDatabaseService } from "../platform-database.service.js";

const categoryFor = (eventType: string) =>
  eventType.startsWith("support")
    ? "support"
    : eventType.startsWith("invoice") || eventType.startsWith("payment")
      ? "billing"
      : eventType.startsWith("provisioning")
        ? "operations"
        : "crm";
@Injectable()
export class CommunicationsService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}
  public async list(organizationId: string) {
    const result = await this.database.query(
      "SELECT * FROM platform.commercial_communications WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 200",
      [organizationId],
    );
    return { data: result.rows };
  }
  public async createTemplate(
    organizationId: string,
    actorId: string,
    eventType: string,
    subject: string,
    body: string,
  ) {
    const version = await this.database.query(
      "SELECT COALESCE(MAX(version),0)+1 AS version FROM platform.communication_templates WHERE organization_id=$1 AND event_type=$2",
      [organizationId, eventType],
    );
    const result = await this.database.query(
      "INSERT INTO platform.communication_templates (id,organization_id,event_type,version,subject,body,status,created_by) VALUES ($1,$2,$3,$4,$5,$6,'draft',$7) RETURNING *",
      [
        `communication_template_${randomUUID()}`,
        organizationId,
        eventType,
        Number(version.rows[0]?.version ?? 1),
        subject,
        body,
        actorId,
      ],
    );
    return { data: result.rows[0] };
  }
  public async approveTemplate(
    organizationId: string,
    actorId: string,
    id: string,
  ) {
    const result = await this.database.query(
      "UPDATE platform.communication_templates SET status='approved' WHERE id=$1 AND organization_id=$2 AND status='draft' RETURNING *",
      [id, organizationId],
    );
    if (!result.rows[0])
      throw new ConflictException("Template is not approvable.");
    await this.database.query(
      "INSERT INTO platform.audit_events (id,organization_id,actor_id,action,correlation_id,metadata) VALUES ($1,$2,$3,'communication.template.approved',$4,$5::jsonb)",
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        `template-${id}`,
        JSON.stringify({ templateId: id }),
      ],
    );
    return { data: result.rows[0] };
  }
  public async send(
    organizationId: string,
    _actorId: string,
    input: {
      eventType: string;
      resourceId: string;
      recipientId: string;
      variables?: Record<string, string>;
    },
  ) {
    const template = await this.database.query(
      "SELECT id,version FROM platform.communication_templates WHERE organization_id=$1 AND event_type=$2 AND status='approved' ORDER BY version DESC LIMIT 1",
      [organizationId, input.eventType],
    );
    if (!template.rows[0])
      throw new NotFoundException("No approved communication template exists.");
    const preference = await this.database.query(
      "SELECT enabled FROM platform.notification_preferences WHERE organization_id=$1 AND recipient_id=$2 AND category=$3",
      [organizationId, input.recipientId, categoryFor(input.eventType)],
    );
    const enabled = preference.rows[0]?.enabled !== false;
    const variables = input.variables ?? {};
    const render = (value: string) =>
      value.replace(
        /{{\s*([A-Za-z0-9_.-]+)\s*}}/g,
        (_, key: string) => variables[key] ?? "",
      );
    const id = `communication_${randomUUID()}`;
    const result = await this.database.query(
      "INSERT INTO platform.commercial_communications (id,organization_id,event_type,resource_id,recipient_id,template_id,template_version,variables,rendered_subject,rendered_body,delivery_state) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11) ON CONFLICT (organization_id,event_type,resource_id,recipient_id) DO UPDATE SET template_id=EXCLUDED.template_id,template_version=EXCLUDED.template_version,variables=EXCLUDED.variables,rendered_subject=EXCLUDED.rendered_subject,rendered_body=EXCLUDED.rendered_body,delivery_state=EXCLUDED.delivery_state RETURNING *",
      [
        id,
        organizationId,
        input.eventType,
        input.resourceId,
        input.recipientId,
        template.rows[0]?.id,
        template.rows[0]?.version,
        JSON.stringify(variables),
        render(
          typeof template.rows[0]?.subject === "string"
            ? template.rows[0].subject
            : "",
        ),
        render(
          typeof template.rows[0]?.body === "string"
            ? template.rows[0].body
            : "",
        ),
        enabled ? "queued" : "not_requested",
      ],
    );
    if (enabled)
      await this.database.query(
        "INSERT INTO platform.outbox_events (id,event_type,organization_id,correlation_id,payload) VALUES ($1,'communication.email',$2,$3,$4::jsonb) ON CONFLICT DO NOTHING",
        [
          `event_${randomUUID()}`,
          organizationId,
          `communication:${String(result.rows[0]?.id)}`,
          JSON.stringify({ communicationId: result.rows[0]?.id }),
        ],
      );
    await this.database.query(
      "INSERT INTO platform.communication_delivery_audits (id,organization_id,communication_id,action,metadata) VALUES ($1,$2,$3,'queued',$4::jsonb)",
      [
        `communication_audit_${randomUUID()}`,
        organizationId,
        String(result.rows[0]?.id),
        JSON.stringify({ eventType: input.eventType }),
      ],
    );
    return { data: result.rows[0] };
  }
  public async resend(organizationId: string, _actorId: string, id: string) {
    const result = await this.database.query(
      "UPDATE platform.commercial_communications SET delivery_state='queued', resend_count=resend_count+1, last_error=NULL WHERE id=$1 AND organization_id=$2 AND delivery_state IN ('failed','delivered') RETURNING *",
      [id, organizationId],
    );
    if (!result.rows[0])
      throw new ConflictException("Communication cannot be resent.");
    await this.database.query(
      "INSERT INTO platform.outbox_events (id,event_type,organization_id,correlation_id,payload) VALUES ($1,'communication.email',$2,$3,$4::jsonb)",
      [
        `event_${randomUUID()}`,
        organizationId,
        `communication:${id}:resend`,
        JSON.stringify({ communicationId: id, resend: true }),
      ],
    );
    await this.database.query(
      "INSERT INTO platform.communication_delivery_audits (id,organization_id,communication_id,action,actor_id,metadata) VALUES ($1,$2,$3,'resent',$4,$5::jsonb)",
      [
        `communication_audit_${randomUUID()}`,
        organizationId,
        id,
        _actorId,
        JSON.stringify({ resend: true }),
      ],
    );
    return { data: result.rows[0] };
  }

  public async produce(
    organizationId: string,
    actorId: string,
    input: {
      eventType: string;
      resourceId: string;
      recipientId: string;
      variables?: Record<string, string>;
    },
  ) {
    return this.send(organizationId, actorId, input);
  }
}

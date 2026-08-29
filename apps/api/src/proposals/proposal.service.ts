import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  calculateCommercialTotals,
  createMoney,
  createProposalVersion,
  type CommercialLineItem,
} from "@stack-and-scale/contracts";
import { PlatformDatabaseService } from "../platform-database.service.js";

export type ProposalLineInput = Readonly<{
  id?: string;
  description: string;
  quantity: number;
  unitPriceMinorUnits: number;
  currency?: string;
  optional?: boolean;
  tax?: {
    code: string;
    ratePercent: string;
    jurisdiction?: string;
    rounding?: "half-up" | "half-even" | "down" | "up";
  };
}>;
export type ProposalVersionInput = Readonly<{
  currency: string;
  validFrom: string;
  validUntil: string;
  notes: string;
  lineItems: readonly ProposalLineInput[];
}>;
export type ProposalInput = ProposalVersionInput &
  Readonly<{ title: string; leadId: string; opportunityId?: string }>;

@Injectable()
export class ProposalService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(organizationId: string) {
    const result = await this.database.query(
      `SELECT id, lead_id, opportunity_id, title, status, current_version, created_at, updated_at FROM platform.proposals WHERE organization_id = $1 ORDER BY updated_at DESC LIMIT 200`,
      [organizationId],
    );
    return { data: result.rows };
  }

  public async get(id: string, organizationId: string) {
    const proposal = await this.database.query(
      `SELECT id, lead_id, opportunity_id, title, status, current_version, accepted_version, created_at, updated_at FROM platform.proposals WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    );
    if (!proposal.rows[0]) throw new NotFoundException("Proposal not found.");
    const versions = await this.database.query(
      `SELECT id, version, status, currency, valid_from, valid_until, notes, totals, issued_at, issued_by, created_at FROM platform.proposal_versions WHERE proposal_id = $1 AND organization_id = $2 ORDER BY version DESC`,
      [id, organizationId],
    );
    const items = await this.database.query(
      `SELECT id, version_id, description, quantity, unit_price_minor_units, currency, optional, tax_configuration, position FROM platform.proposal_line_items WHERE organization_id = $1 AND version_id IN (SELECT id FROM platform.proposal_versions WHERE proposal_id = $2) ORDER BY version_id, position`,
      [organizationId, id],
    );
    return {
      data: {
        ...proposal.rows[0],
        versions: versions.rows.map((version) => ({
          ...version,
          lineItems: items.rows.filter(
            (item) => item["version_id"] === version["id"],
          ),
        })),
      },
    };
  }

  public async create(
    organizationId: string,
    actorId: string,
    input: ProposalInput,
    correlationId: string,
  ) {
    const versionInput = validateVersion(input);
    const proposalId = `proposal_${randomUUID()}`;
    const created = await this.database.query(
      `INSERT INTO platform.proposals (id, organization_id, lead_id, opportunity_id, title, created_by) SELECT $1, l.organization_id, l.id, o.id, $4, $5 FROM platform.leads l LEFT JOIN platform.opportunities o ON o.id = $3 AND o.lead_id = l.id WHERE l.id = $2 AND l.organization_id = $6 RETURNING id, lead_id, opportunity_id, title, status, current_version, created_at`,
      [
        proposalId,
        input.leadId,
        input.opportunityId ?? null,
        input.title,
        actorId,
        organizationId,
      ],
    );
    if (!created.rows[0])
      throw new NotFoundException(
        "Lead or opportunity not found in this tenant.",
      );
    await this.insertVersion(
      proposalId,
      organizationId,
      actorId,
      1,
      versionInput,
    );
    await this.audit(
      organizationId,
      actorId,
      "proposal.created",
      correlationId,
      { proposalId, version: 1 },
    );
    return { data: { ...created.rows[0], publicToken: null } };
  }

  public async createVersion(
    id: string,
    organizationId: string,
    actorId: string,
    input: ProposalVersionInput,
    correlationId: string,
  ) {
    const versionInput = validateVersion(input);
    const current = await this.database.query(
      `SELECT current_version FROM platform.proposals WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    );
    if (!current.rows[0]) throw new NotFoundException("Proposal not found.");
    const version = Number(current.rows[0]["current_version"]) + 1;
    await this.insertVersion(
      id,
      organizationId,
      actorId,
      version,
      versionInput,
    );
    await this.database.query(
      "UPDATE platform.proposals SET current_version = $3, status = 'draft', updated_at = now() WHERE id = $1 AND organization_id = $2",
      [id, organizationId, version],
    );
    await this.audit(
      organizationId,
      actorId,
      "proposal.version_created",
      correlationId,
      { proposalId: id, version },
    );
    return this.get(id, organizationId);
  }

  public async submit(
    id: string,
    version: number,
    organizationId: string,
    actorId: string,
    correlationId: string,
  ) {
    const current = await this.requireVersion(id, version, organizationId);
    if (current.status !== "draft")
      throw new ConflictException("Only a draft version can be submitted.");
    await this.database.query(
      "UPDATE platform.proposals SET status = 'pending_approval', updated_at = now() WHERE id = $1 AND organization_id = $2 AND current_version = $3",
      [id, organizationId, version],
    );
    const approval = await this.database.query(
      `INSERT INTO platform.approval_requests (id, organization_id, requester_id, resource_type, resource_id, reason, expires_at) VALUES ($1, $2, $3, 'proposal', $4, $5, now() + interval '7 days') RETURNING id, decision, expires_at`,
      [
        `approval_${randomUUID()}`,
        organizationId,
        actorId,
        `${id}:v${version}`,
        `Approve proposal ${id} version ${version}`,
      ],
    );
    await this.audit(
      organizationId,
      actorId,
      "proposal.submitted",
      correlationId,
      { proposalId: id, version, approvalId: approval.rows[0]?.["id"] },
    );
    return {
      data: {
        proposalId: id,
        version,
        status: "pending_approval",
        approval: approval.rows[0],
      },
    };
  }

  public async approve(
    id: string,
    version: number,
    organizationId: string,
    actorId: string,
    reason: string,
    correlationId: string,
  ) {
    const approval = await this.database.query(
      `SELECT id, requester_id, decision, expires_at FROM platform.approval_requests WHERE organization_id = $1 AND resource_type = 'proposal' AND resource_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [organizationId, `${id}:v${version}`],
    );
    const row = approval.rows[0];
    if (
      !row ||
      row["decision"] !== "pending" ||
      new Date(String(row["expires_at"])).getTime() <= Date.now()
    )
      throw new ConflictException("Proposal approval is no longer actionable.");
    if (row["requester_id"] === actorId)
      throw new ConflictException("Approval requires separation of duties.");
    await this.database.query(
      "UPDATE platform.approval_requests SET decision = 'approved', approver_id = $3, decided_at = now(), updated_at = now() WHERE id = $1 AND organization_id = $2 AND decision = 'pending'",
      [row["id"], organizationId, actorId],
    );
    await this.database.query(
      "UPDATE platform.proposals SET status = 'approved', updated_at = now() WHERE id = $1 AND organization_id = $2 AND current_version = $3",
      [id, organizationId, version],
    );
    await this.audit(
      organizationId,
      actorId,
      "proposal.approved",
      correlationId,
      { proposalId: id, version, reason },
    );
    return { data: { proposalId: id, version, status: "approved" } };
  }

  public async publish(
    id: string,
    version: number,
    organizationId: string,
    actorId: string,
    correlationId: string,
  ) {
    const proposal = await this.database.query(
      "SELECT status, current_version FROM platform.proposals WHERE id = $1 AND organization_id = $2",
      [id, organizationId],
    );
    if (!proposal.rows[0]) throw new NotFoundException("Proposal not found.");
    if (
      proposal.rows[0]["status"] !== "approved" ||
      Number(proposal.rows[0]["current_version"]) !== version
    )
      throw new ConflictException(
        "Only the approved current version can be published.",
      );
    const draft = await this.database.query(
      "SELECT valid_until FROM platform.proposal_versions WHERE proposal_id = $1 AND organization_id = $2 AND version = $3",
      [id, organizationId, version],
    );
    if (
      !draft.rows[0] ||
      new Date(String(draft.rows[0]["valid_until"])).getTime() <= Date.now()
    )
      throw new ConflictException("An expired proposal cannot be published.");
    const updated = await this.database.query(
      "UPDATE platform.proposal_versions SET status = 'issued', issued_at = now(), issued_by = $3 WHERE proposal_id = $1 AND organization_id = $2 AND version = $4 AND status = 'draft' RETURNING id, version, currency, valid_from, valid_until, totals",
      [id, organizationId, actorId, version],
    );
    if (!updated.rows[0])
      throw new ConflictException("Proposal version is no longer publishable.");
    const token = randomBytes(32).toString("base64url");
    await this.database.query(
      "UPDATE platform.proposals SET status = 'issued', public_token_hash = $3, updated_at = now() WHERE id = $1 AND organization_id = $2",
      [id, organizationId, hashToken(token)],
    );
    await this.audit(
      organizationId,
      actorId,
      "proposal.published",
      correlationId,
      { proposalId: id, version },
    );
    return {
      data: {
        ...updated.rows[0],
        status: "issued",
        publicToken: token,
        publicPath: `/api/v1/public/proposals/${token}`,
      },
    };
  }

  public async publicView(token: string) {
    const result = await this.database.query(
      `SELECT p.id, p.organization_id, p.title, p.status, v.id AS version_id, v.version, v.currency, v.valid_from, v.valid_until, v.notes, v.totals FROM platform.proposals p JOIN platform.proposal_versions v ON v.proposal_id = p.id AND v.version = p.current_version WHERE p.public_token_hash = $1 AND p.status IN ('issued', 'accepted') AND v.status = 'issued'`,
      [hashToken(token)],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Published proposal not found.");
    if (new Date(String(row["valid_until"])).getTime() < Date.now()) {
      await this.database.query(
        "UPDATE platform.proposals SET status = 'expired', updated_at = now() WHERE id = $1 AND status = 'issued'",
        [row["id"]],
      );
      throw new ConflictException("Proposal has expired.");
    }
    const items = await this.database.query(
      "SELECT id, description, quantity, unit_price_minor_units, currency, optional, tax_configuration, position FROM platform.proposal_line_items WHERE version_id = $1 ORDER BY position",
      [row["version_id"]],
    );
    await this.database.query(
      "INSERT INTO platform.proposal_view_events (id, proposal_id, version_id, organization_id) VALUES ($1, $2, $3, $4)",
      [
        `proposal_view_${randomUUID()}`,
        row["id"],
        row["version_id"],
        row["organization_id"],
      ],
    );
    await this.audit(
      String(row["organization_id"]),
      "public-recipient",
      "proposal.viewed",
      "public-proposal",
      { proposalId: row["id"], version: row["version"] },
    );
    const publicData = Object.fromEntries(
      Object.entries(row).filter(([key]) => key !== "organization_id"),
    );
    return { data: { ...publicData, lineItems: items.rows } };
  }

  public async accept(
    token: string,
    name: string,
    email: string | undefined,
    ip: string,
    userAgent: string,
  ) {
    const result = await this.database.query(
      `SELECT p.id, p.organization_id, p.status, v.id AS version_id, v.version, v.valid_until FROM platform.proposals p JOIN platform.proposal_versions v ON v.proposal_id = p.id AND v.version = p.current_version WHERE p.public_token_hash = $1 AND p.status = 'issued' AND v.status = 'issued'`,
      [hashToken(token)],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Published proposal not found.");
    if (new Date(String(row["valid_until"])).getTime() < Date.now()) {
      await this.database.query(
        "UPDATE platform.proposals SET status = 'expired', updated_at = now() WHERE id = $1 AND status = 'issued'",
        [row["id"]],
      );
      throw new ConflictException("Proposal has expired.");
    }
    const evidence = await this.database.query(
      `INSERT INTO platform.proposal_acceptance_evidence (id, proposal_id, version_id, organization_id, accepted_name, accepted_email, ip_address, user_agent, declaration) VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::inet, NULLIF($8, ''), 'The recipient confirms acceptance of this proposal version.') ON CONFLICT (proposal_id, version_id) DO NOTHING RETURNING id, accepted_at, proposal_id, version_id`,
      [
        `acceptance_${randomUUID()}`,
        row["id"],
        row["version_id"],
        row["organization_id"],
        name,
        email ?? null,
        ip,
        userAgent,
      ],
    );
    if (!evidence.rows[0])
      throw new ConflictException("Proposal has already been accepted.");
    await this.database.query(
      "UPDATE platform.proposals SET status = 'accepted', accepted_version = $2, updated_at = now() WHERE id = $1 AND status = 'issued'",
      [row["id"], row["version"]],
    );
    await this.audit(
      String(row["organization_id"]),
      "public-recipient",
      "proposal.accepted",
      "public-proposal",
      {
        proposalId: row["id"],
        version: row["version"],
        evidenceId: evidence.rows[0]["id"],
      },
    );
    return {
      data: {
        proposalId: row["id"],
        version: row["version"],
        status: "accepted",
        evidenceId: evidence.rows[0]["id"],
      },
    };
  }

  private async insertVersion(
    proposalId: string,
    organizationId: string,
    actorId: string,
    version: number,
    input: ProposalVersionInput,
  ) {
    const checked = createProposalVersion({
      proposalId,
      version,
      status: "draft",
      validFrom: input.validFrom,
      validUntil: input.validUntil,
    });
    const required = input.lineItems
      .filter((item) => !item.optional)
      .map((item, index) => toCommercial(item, input.currency, index));
    const optional = input.lineItems
      .filter((item) => item.optional)
      .map((item, index) => toCommercial(item, input.currency, index));
    if (required.length === 0)
      throw new ConflictException("At least one required line item is needed.");
    const totals = calculateCommercialTotals(required);
    const optionalTotals = optional.length
      ? calculateCommercialTotals(optional)
      : null;
    const versionId = `proposal_version_${randomUUID()}`;
    await this.database.query(
      `INSERT INTO platform.proposal_versions (id, proposal_id, organization_id, version, currency, valid_from, valid_until, notes, totals, created_by) VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, $9::jsonb, $10)`,
      [
        versionId,
        proposalId,
        organizationId,
        checked.version,
        input.currency,
        input.validFrom,
        input.validUntil,
        input.notes,
        JSON.stringify({ ...totals, optional: optionalTotals }),
        actorId,
      ],
    );
    for (const [position, item] of input.lineItems.entries())
      await this.database.query(
        `INSERT INTO platform.proposal_line_items (id, version_id, organization_id, description, quantity, unit_price_minor_units, currency, optional, tax_configuration, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
        [
          `proposal_item_${randomUUID()}`,
          versionId,
          organizationId,
          item.description,
          item.quantity,
          item.unitPriceMinorUnits,
          input.currency,
          item.optional ?? false,
          item.tax ? JSON.stringify(item.tax) : null,
          position,
        ],
      );
  }
  private async requireVersion(
    id: string,
    version: number,
    organizationId: string,
  ): Promise<{ status: string }> {
    const result = await this.database.query(
      "SELECT status FROM platform.proposal_versions WHERE proposal_id = $1 AND version = $2 AND organization_id = $3",
      [id, version, organizationId],
    );
    if (!result.rows[0])
      throw new NotFoundException("Proposal version not found.");
    return { status: String(result.rows[0]["status"]) };
  }
  private async audit(
    organizationId: string,
    actorId: string,
    action: string,
    correlationId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.database.query(
      "INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata) VALUES ($1, $2, $3, $4, $5, $6::jsonb)",
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        `commercial.${action}`,
        correlationId,
        JSON.stringify(metadata),
      ],
    );
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
function validateVersion(input: ProposalVersionInput): ProposalVersionInput {
  if (
    !/^[A-Z]{3}$/.test(input.currency) ||
    input.lineItems.length === 0 ||
    input.lineItems.some(
      (item) =>
        typeof item.description !== "string" ||
        !item.description.trim() ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isSafeInteger(item.unitPriceMinorUnits) ||
        item.unitPriceMinorUnits < 0 ||
        (item.currency !== undefined && item.currency !== input.currency),
    )
  )
    throw new ConflictException(
      "Line items require the proposal currency, positive integer quantities and non-negative integer minor-unit prices.",
    );
  if (
    Number.isNaN(Date.parse(input.validFrom)) ||
    Number.isNaN(Date.parse(input.validUntil)) ||
    Date.parse(input.validUntil) < Date.parse(input.validFrom)
  )
    throw new ConflictException("validUntil must not be before validFrom.");
  return input;
}
function toCommercial(
  item: ProposalLineInput,
  currency: string,
  index: number,
): CommercialLineItem {
  return {
    id: item.id ?? `line-${index}`,
    description: item.description.trim(),
    quantity: item.quantity,
    unitPrice: createMoney(item.unitPriceMinorUnits, item.currency ?? currency),
    ...(item.tax ? { tax: item.tax } : {}),
  };
}

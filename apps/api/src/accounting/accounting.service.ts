import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import {
  createAccountingExport,
  createImportKey,
  type AccountingRecord,
} from "@stack-and-scale/contracts";
import { PlatformDatabaseService } from "../platform-database.service.js";

@Injectable()
export class AccountingService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(organizationId: string) {
    const result = await this.database.query(
      "SELECT id, contract_version, period_start, period_end, correction_of, content_sha256, created_by, created_at FROM platform.accounting_exports WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 100",
      [organizationId],
    );
    return { data: result.rows };
  }

  public async export(
    organizationId: string,
    actorId: string,
    periodStart: string,
    periodEnd: string,
    correctionOf?: string,
  ) {
    if (
      Number.isNaN(Date.parse(periodStart)) ||
      Number.isNaN(Date.parse(periodEnd)) ||
      Date.parse(periodEnd) <= Date.parse(periodStart)
    )
      throw new BadRequestException(
        "A valid, ordered export period is required.",
      );
    const result = await this.database.query(
      `SELECT kind, id, occurred_at, correction_of, payload FROM (
        SELECT 'customer' AS kind, id, created_at AS occurred_at, NULL::text AS correction_of, jsonb_build_object('email', email, 'name', name) AS payload FROM platform.contacts WHERE organization_id=$1 AND created_at >= $2::timestamptz AND created_at < $3::timestamptz
        UNION ALL SELECT 'invoice', id, COALESCE(issued_at, created_at), NULL, jsonb_build_object('number', number, 'status', status, 'currency', currency, 'totalMinorUnits', total_minor_units) FROM platform.invoices WHERE organization_id=$1 AND COALESCE(issued_at, created_at) >= $2::timestamptz AND COALESCE(issued_at, created_at) < $3::timestamptz
        UNION ALL SELECT 'credit', id, occurred_at, correction_of, to_jsonb(accounting_credits) - 'organization_id' FROM platform.accounting_credits WHERE organization_id=$1 AND occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz
        UNION ALL SELECT 'payment', id, COALESCE(received_at, created_at), NULL, jsonb_build_object('amountMinorUnits', amount_minor_units, 'currency', currency, 'method', method, 'status', status, 'paymentReference', payment_reference) FROM platform.payment_attempts WHERE organization_id=$1 AND COALESCE(received_at, created_at) >= $2::timestamptz AND COALESCE(received_at, created_at) < $3::timestamptz
        UNION ALL SELECT 'fee', id, occurred_at, NULL, to_jsonb(accounting_fee_entries) - 'organization_id' FROM platform.accounting_fee_entries WHERE organization_id=$1 AND occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz
        UNION ALL SELECT 'tax', id, occurred_at, NULL, to_jsonb(accounting_tax_entries) - 'organization_id' FROM platform.accounting_tax_entries WHERE organization_id=$1 AND occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz
        UNION ALL SELECT 'reconciliation', id, occurred_at, correction_of, to_jsonb(accounting_reconciliation_events) - 'organization_id' FROM platform.accounting_reconciliation_events WHERE organization_id=$1 AND occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz
      ) records`,
      [organizationId, periodStart, periodEnd],
    );
    const records = result.rows.map((row) => ({
      kind: row.kind,
      id: row.id,
      occurredAt: new Date(String(row.occurred_at)).toISOString(),
      ...(row.correction_of ? { correctionOf: row.correction_of } : {}),
      payload: row.payload,
    })) as AccountingRecord[];
    const data = createAccountingExport({
      organizationId,
      periodStart: new Date(periodStart).toISOString(),
      periodEnd: new Date(periodEnd).toISOString(),
      records,
    });
    const id = `accounting_export_${randomUUID()}`;
    const hash = createHash("sha256").update(data.serialized).digest("hex");
    try {
      const created = await this.database.query(
        "INSERT INTO platform.accounting_exports (id,organization_id,contract_version,period_start,period_end,correction_of,content_sha256,serialized,created_by) VALUES ($1,$2,$3,$4::timestamptz,$5::timestamptz,$6,$7,$8::jsonb,$9) RETURNING id,contract_version,period_start,period_end,correction_of,content_sha256,created_at",
        [
          id,
          organizationId,
          data.contractVersion,
          data.periodStart,
          data.periodEnd,
          correctionOf ?? null,
          hash,
          data.serialized,
          actorId,
        ],
      );
      for (const record of data.records)
        await this.database.query(
          "INSERT INTO platform.accounting_export_records (id,organization_id,export_id,import_key,record_kind,record_id,correction_of,occurred_at,payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::timestamptz,$9::jsonb)",
          [
            `accounting_record_${randomUUID()}`,
            organizationId,
            id,
            createImportKey(organizationId, record.kind, record.id),
            record.kind,
            record.id,
            record.correctionOf ?? null,
            record.occurredAt,
            JSON.stringify(record.payload),
          ],
        );
      return { data: { ...created.rows[0], serialized: data.serialized } };
    } catch (error) {
      if (
        String(error).includes(
          "accounting_exports_organization_id_contract_version_period_start_period_end_key",
        ) ||
        String(error).includes(
          "accounting_export_records_organization_id_import_key",
        )
      )
        throw new ConflictException(
          "This accounting period or record has already been exported.",
        );
      throw error;
    }
  }
}

export const ACCOUNTING_EXPORT_VERSION = 1 as const;

export type AccountingRecordKind =
  | "customer"
  | "invoice"
  | "credit"
  | "payment"
  | "fee"
  | "tax"
  | "reconciliation";

export type AccountingRecord = Readonly<{
  kind: AccountingRecordKind;
  id: string;
  occurredAt: string;
  correctionOf?: string;
  payload: Readonly<Record<string, unknown>>;
}>;

export type AccountingExport = Readonly<{
  contractVersion: typeof ACCOUNTING_EXPORT_VERSION;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  records: readonly AccountingRecord[];
  serialized: string;
}>;

export type AccountingAdapter = Readonly<{
  name: string;
  contractVersion: typeof ACCOUNTING_EXPORT_VERSION;
  import(
    exportData: AccountingExport,
  ): Promise<Readonly<{ importKey: string }>>;
}>;

function requireText(value: string, field: string): void {
  if (value.trim().length === 0) throw new Error(`${field} must not be empty`);
}

function requireTimestamp(value: string, field: string): number {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp))
    throw new Error(`${field} must be an ISO-8601 timestamp`);
  return timestamp;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

export function createImportKey(
  organizationId: string,
  kind: AccountingRecordKind,
  recordId: string,
  contractVersion = ACCOUNTING_EXPORT_VERSION,
): string {
  requireText(organizationId, "organizationId");
  requireText(recordId, "recordId");
  return `${organizationId}:${kind}:${recordId}:v${contractVersion}`;
}

export function createAccountingExport(input: {
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  records: readonly AccountingRecord[];
}): AccountingExport {
  requireText(input.organizationId, "organizationId");
  const start = requireTimestamp(input.periodStart, "periodStart");
  const end = requireTimestamp(input.periodEnd, "periodEnd");
  if (end <= start) throw new Error("periodEnd must be after periodStart");
  for (const record of input.records) {
    requireText(record.id, "record id");
    requireText(record.kind, "record kind");
    const occurredAt = requireTimestamp(record.occurredAt, "occurredAt");
    if (occurredAt < start || occurredAt >= end)
      throw new Error("record occurredAt must be within export period");
    if (record.correctionOf !== undefined)
      requireText(record.correctionOf, "correctionOf");
  }
  const records: AccountingRecord[] = [...input.records]
    .map((record) => ({
      ...record,
      payload: stableValue(record.payload) as Readonly<Record<string, unknown>>,
    }))
    .sort(
      (left, right) =>
        left.occurredAt.localeCompare(right.occurredAt) ||
        left.kind.localeCompare(right.kind) ||
        left.id.localeCompare(right.id),
    );
  const body = {
    contractVersion: ACCOUNTING_EXPORT_VERSION,
    organizationId: input.organizationId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    records,
  };
  return Object.freeze({ ...body, serialized: JSON.stringify(body) });
}

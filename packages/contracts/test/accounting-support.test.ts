import { describe, expect, it } from "vitest";

import {
  createAccountingExport,
  createImportKey,
  calculateSlaClock,
  type AccountingRecord,
} from "../src/index.js";

describe("accounting export contract", () => {
  it("sorts records deterministically and derives stable import keys", () => {
    const records: AccountingRecord[] = [
      {
        kind: "invoice",
        id: "inv-2",
        occurredAt: "2026-08-02T00:00:00.000Z",
        payload: { totalMinorUnits: 200 },
      },
      {
        kind: "customer",
        id: "cus-1",
        occurredAt: "2026-08-01T00:00:00.000Z",
        payload: { name: "Acme" },
      },
      {
        kind: "invoice",
        id: "inv-1",
        occurredAt: "2026-08-02T00:00:00.000Z",
        payload: { totalMinorUnits: 100 },
      },
    ];

    const first = createAccountingExport({
      organizationId: "org-1",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-09-01T00:00:00.000Z",
      records,
    });
    const second = createAccountingExport({
      organizationId: "org-1",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-09-01T00:00:00.000Z",
      records: [...records].reverse(),
    });

    expect(first).toEqual(second);
    expect(first.records.map((record) => record.id)).toEqual([
      "cus-1",
      "inv-1",
      "inv-2",
    ]);
    expect(createImportKey("org-1", "invoice", "inv-1", 1)).toBe(
      "org-1:invoice:inv-1:v1",
    );
  });

  it("requires a correction to identify its source record", () => {
    expect(() =>
      createAccountingExport({
        organizationId: "org-1",
        periodStart: "2026-08-01T00:00:00.000Z",
        periodEnd: "2026-09-01T00:00:00.000Z",
        records: [
          {
            kind: "credit",
            id: "credit-1",
            occurredAt: "2026-08-02T00:00:00.000Z",
            correctionOf: "",
            payload: {},
          },
        ],
      }),
    ).toThrow("correctionOf");
  });
});

describe("support SLA contract", () => {
  it("pauses elapsed time and excludes paused intervals", () => {
    expect(
      calculateSlaClock({
        startedAt: "2026-08-01T10:00:00.000Z",
        now: "2026-08-01T14:00:00.000Z",
        pauseIntervals: [
          {
            startedAt: "2026-08-01T11:00:00.000Z",
            endedAt: "2026-08-01T13:00:00.000Z",
          },
        ],
      }),
    ).toEqual({ elapsedSeconds: 7200, pausedSeconds: 7200 });
  });
});

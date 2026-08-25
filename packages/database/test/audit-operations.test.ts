import { describe, expect, it } from "vitest";

import {
  AuditEventError,
  containsSensitiveMetadataKey,
  normalizeIdentityAction,
  recordIdentityAuditEvent,
} from "../src/audit-operations.js";
import type { Queryable, QueryResult } from "../src/queryable.js";

type Row = Record<string, unknown>;

type CapturedQuery = {
  text: string;
  values: readonly unknown[];
};

function fakeDb(rows: Row[] = [], captured?: CapturedQuery[]): Queryable {
  return {
    async query(
      text: string,
      values?: readonly unknown[],
    ): Promise<QueryResult<Row>> {
      if (captured !== undefined) {
        captured.push({ text, values: [...(values ?? [])] });
      }
      return Promise.resolve({ rows });
    },
  };
}

function baseInput(
  overrides: Partial<Parameters<typeof recordIdentityAuditEvent>[1]> = {},
): Parameters<typeof recordIdentityAuditEvent>[1] {
  return {
    id: "evt-1",
    eventName: "session_revoked",
    correlationId: "corr-9",
    organizationId: "org-1",
    actorId: "user-7",
    metadata: { reason: "admin_action" },
    ...overrides,
  };
}

describe("identity audit event persistence", () => {
  it("writes a namespaced identity action with metadata jsonb", async () => {
    const captured: CapturedQuery[] = [];
    const db = fakeDb([{ id: "evt-1" }], captured);

    const written = await recordIdentityAuditEvent(db, baseInput());

    expect(written).toEqual({ id: "evt-1" });
    expect(captured).toHaveLength(1);
    const query = captured[0];
    if (query === undefined) {
      throw new Error("expected one captured insert");
    }
    expect(query.text).toContain("platform.audit_events");
    expect(query.values[3]).toBe("identity.session_revoked");
    expect(query.values[4]).toBe("corr-9");
    expect(JSON.parse(query.values[6] as string)).toEqual({
      reason: "admin_action",
    });
  });

  it("refuses metadata containing a password key, case-insensitively", async () => {
    const captured: CapturedQuery[] = [];
    const db = fakeDb([], captured);

    await expect(
      recordIdentityAuditEvent(
        db,
        baseInput({ metadata: { PassWord: "hunter2" } }),
      ),
    ).rejects.toMatchObject({
      name: "AuditEventError",
      reason: "sensitive_metadata_key",
    });
    expect(captured).toHaveLength(0);
  });

  it("refuses sensitive keys nested inside metadata objects and arrays", () => {
    expect(containsSensitiveMetadataKey({ context: { api_TOKEN: "x" } })).toBe(
      true,
    );
    expect(
      containsSensitiveMetadataKey({ steps: [{ client_secret: "y" }] }),
    ).toBe(true);
    expect(containsSensitiveMetadataKey({ steps: ["safe"] })).toBe(false);
  });

  it("refuses empty required fields without touching the database", async () => {
    const captured: CapturedQuery[] = [];
    const db = fakeDb([], captured);

    for (const overrides of [
      { id: "  " },
      { eventName: "" },
      { correlationId: "" },
    ]) {
      await expect(
        recordIdentityAuditEvent(db, baseInput(overrides)),
      ).rejects.toBeInstanceOf(AuditEventError);
    }
    expect(captured).toHaveLength(0);
  });

  it("requires a correlation id", async () => {
    const db = fakeDb([]);

    await expect(
      recordIdentityAuditEvent(db, baseInput({ correlationId: "" })),
    ).rejects.toMatchObject({ reason: "missing_correlation_id" });
  });

  it("enforces the identity. namespace on the event name", async () => {
    expect(normalizeIdentityAction("login_succeeded")).toBe(
      "identity.login_succeeded",
    );
    expect(() =>
      normalizeIdentityAction("identity.login_succeeded"),
    ).toThrowError(AuditEventError);
    expect(() => normalizeIdentityAction("mfa.enrolled")).toThrowError(
      AuditEventError,
    );

    await expect(
      recordIdentityAuditEvent(
        fakeDb([]),
        baseInput({ eventName: "identity.session_revoked" }),
      ),
    ).rejects.toMatchObject({ reason: "invalid_event_name" });
  });

  it("defaults optional columns to null and occurred_at to a timestamp", async () => {
    const before = new Date();
    const captured: CapturedQuery[] = [];
    const db = fakeDb([{ id: "evt-2" }], captured);

    await recordIdentityAuditEvent(db, {
      id: "evt-2",
      eventName: "recovery_started",
      correlationId: "corr-10",
    });

    const query = captured[0];
    if (query === undefined) {
      throw new Error("expected one captured insert");
    }
    expect(query.values[1]).toBeNull();
    expect(query.values[2]).toBeNull();
    expect(query.values[5]).toBeInstanceOf(Date);
    expect((query.values[5] as Date).getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(query.values[3]).toBe("identity.recovery_started");
  });
});

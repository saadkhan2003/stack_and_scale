import { describe, expect, it } from "vitest";

import {
  createPrivacyRequestRecord,
  transitionPrivacyRequestStatus,
  type Queryable,
} from "../src/index.js";

class RecordingClient implements Queryable {
  public readonly calls: ReadonlyArray<{
    text: string;
    values: readonly unknown[];
  }> = [];

  async query(text: string, values: readonly unknown[] = []) {
    (this.calls as Array<{ text: string; values: readonly unknown[] }>).push({
      text,
      values,
    });

    return { rows: [] };
  }
}

describe("privacy operation persistence", () => {
  it("persists a verified request, target statuses and minimized audit", async () => {
    const client = new RecordingClient();

    const result = await createPrivacyRequestRecord(client, {
      id: "privacy-001",
      requesterKind: "account_holder",
      requesterContactId: "contact-001",
      organizationId: "org-alpha",
      requestType: "erasure",
      identityVerified: true,
      scope: { email: "client@example.test" },
      targets: ["contacts", "files", "analytics"],
      actorId: "system",
      correlationId: "corr-privacy-001",
    });

    expect(result).toEqual({
      id: "privacy-001",
      status: "identity_verified",
      targetCount: 3,
    });
    expect(client.calls).toHaveLength(5);
    expect(client.calls[0]?.text).toContain(
      "INSERT INTO platform.privacy_requests",
    );
    expect(client.calls[1]?.text).toContain(
      "INSERT INTO platform.privacy_request_targets",
    );
    expect(client.calls[4]?.text).toContain(
      "INSERT INTO platform.audit_events",
    );
    expect(JSON.stringify(client.calls)).not.toContain("client@example.test");
  });

  it("denies unverified requests before persistence", async () => {
    const client = new RecordingClient();

    await expect(
      createPrivacyRequestRecord(client, {
        id: "privacy-002",
        requesterKind: "lead",
        requesterContactId: null,
        organizationId: null,
        requestType: "access",
        identityVerified: false,
        scope: {},
        targets: ["leads"],
        actorId: "system",
        correlationId: "corr-privacy-002",
      }),
    ).rejects.toThrow("privacy request identity must be verified");

    expect(client.calls).toEqual([]);
  });

  it("enforces the approved privacy lifecycle", async () => {
    expect(
      transitionPrivacyRequestStatus("identity_verified", "scoped"),
    ).toBe("scoped");
    expect(transitionPrivacyRequestStatus("executing", "completed")).toBe(
      "completed",
    );

    expect(() =>
      transitionPrivacyRequestStatus("received", "completed"),
    ).toThrow("invalid privacy request status transition");
  });
});

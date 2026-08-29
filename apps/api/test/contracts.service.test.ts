import { afterEach, describe, expect, it, vi } from "vitest";
import { ContractService } from "../src/contracts/contract.service.js";
import { signESignCallback } from "@stack-and-scale/contracts";

function database(...rows: Array<{ rows: Array<Record<string, unknown>> }>) {
  return {
    query: vi
      .fn()
      .mockImplementation(() => Promise.resolve(rows.shift() ?? { rows: [] })),
  };
}

describe("contract service safety boundaries", () => {
  afterEach(() => {
    delete process.env["ESIGN_PROVIDER_CALLBACK_SECRET"];
    delete process.env["ESIGN_PROVIDER_ENABLED"];
    delete process.env["ESIGN_PROVIDER_APPROVED"];
  });

  it("binds a contract to the exact approved template and issued proposal versions", async () => {
    const db = database(
      {
        rows: [
          {
            template_version_id: "tv",
            template_id: "t",
            template_status: "approved",
            body: "Hi {{name}}",
            proposal_id: "p",
            proposal_version_id: "pv",
            proposal_status: "issued",
          },
        ],
      },
      { rows: [{ id: "c" }] },
    );
    const service = new ContractService(db as never, undefined);
    const result = await service.createContract("org-a", "actor", {
      templateId: "t",
      templateVersion: 2,
      proposalId: "p",
      proposalVersion: 7,
      variables: { name: "Ada" },
    });
    expect(result.data).toMatchObject({ id: "c" });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("proposal_versions"),
      ["org-a", "t", 2, "p", 7],
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO platform.contracts"),
      expect.arrayContaining(["org-a", "t", "tv", "p", "pv"]),
    );
  });

  it("rejects invalid callbacks before persistence and makes duplicate events idempotent", async () => {
    process.env["ESIGN_PROVIDER_CALLBACK_SECRET"] = "secret";
    const payload = {
      provider: "test",
      eventId: "evt-1",
      eventType: "envelope.signed",
      organizationId: "org-a",
      contractId: "c",
      status: "signed" as const,
    };
    const body = JSON.stringify(payload);
    const invalidDb = database();
    await expect(
      new ContractService(invalidDb as never, undefined).handleCallback(
        body,
        "bad",
        payload,
      ),
    ).rejects.toThrow("Invalid e-sign callback");
    expect(invalidDb.query).not.toHaveBeenCalled();
    const db = database(
      { rows: [{ id: "callback" }] },
      { rows: [{ id: "c", status: "signed" }] },
      { rows: [{ id: "callback" }] },
      { rows: [] },
    );
    const service = new ContractService(db as never, undefined);
    await expect(
      service.handleCallback(body, signESignCallback(body, "secret"), payload),
    ).resolves.toMatchObject({ data: { duplicate: false } });
    await expect(
      service.handleCallback(body, signESignCallback(body, "secret"), payload),
    ).resolves.toMatchObject({ data: { duplicate: true } });
  });

  it("records retryable provider failure and keeps provider use gated", async () => {
    const adapter = {
      provider: "test",
      createEnvelope: vi.fn().mockRejectedValue(new Error("timeout")),
      cancelEnvelope: vi.fn(),
    };
    process.env["ESIGN_PROVIDER_ENABLED"] = "true";
    process.env["ESIGN_PROVIDER_APPROVED"] = "true";
    const db = database(
      { rows: [{ id: "c", rendered_sha256: "a".repeat(64) }] },
      {
        rows: [
          {
            name: "Ada",
            email: "ada@example.test",
            identity_method: "email",
            identity_evidence: {},
          },
        ],
      },
      { rows: [{ id: "attempt" }] },
      { rows: [] },
      { rows: [] },
    );
    await expect(
      new ContractService(db as never, adapter).startSigning(
        "org-a",
        "actor",
        "c",
        "corr",
      ),
    ).rejects.toThrow("retryable");
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("retryable_failure"),
      expect.arrayContaining(["timeout", 2000]),
    );
  });

  it("retains uploaded signed documents as explicitly non-substitutive fallback metadata", async () => {
    const db = database(
      { rows: [{ id: "c" }] },
      {
        rows: [
          {
            id: "artifact",
            kind: "uploaded_signed_fallback",
            legal_hold: true,
          },
        ],
      },
    );
    const result = await new ContractService(
      db as never,
      undefined,
    ).recordUploadedFallback("org-a", "actor", "c", {
      kind: "uploaded_signed_fallback",
      storageKey: "contracts/c/signed.pdf",
      originalFilename: "signed.pdf",
      contentType: "application/pdf",
      sizeBytes: 10,
      checksumSha256: "a".repeat(64),
      legalHold: true,
    });
    expect(result.data).toMatchObject({
      completionSubstitute: false,
      kind: "uploaded_signed_fallback",
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  calculateRetryDelayMs,
  createContractTemplateVersion,
  createContractVersionBinding,
  createSignedArtifactMetadata,
  hashContractContent,
  signESignCallback,
  verifyESignCallback,
} from "../src/index.js";

describe("contract and e-sign boundaries", () => {
  it("hashes immutable template and proposal-version bindings", () => {
    const version = createContractTemplateVersion({
      templateId: "t",
      organizationId: "o",
      version: 1,
      body: "Hello {{name}}",
      variables: ["name"],
      status: "draft",
    });
    expect(version.contentSha256).toBe(hashContractContent("Hello {{name}}"));
    expect(() =>
      createContractVersionBinding({
        contractId: "c",
        organizationId: "o",
        templateId: "t",
        templateVersionId: "tv",
        proposalId: "p",
        proposalVersionId: "pv",
        renderedSha256: "bad",
      }),
    ).toThrow("SHA-256");
  });

  it("verifies authentic callbacks and rejects tampering", () => {
    const body = '{"eventId":"evt-1"}';
    const signature = signESignCallback(body, "secret");
    expect(verifyESignCallback(body, signature, "secret")).toBe(true);
    expect(verifyESignCallback(`${body}x`, signature, "secret")).toBe(false);
    expect(verifyESignCallback(body, signature, "wrong")).toBe(false);
  });

  it("validates artifact retention metadata and bounded retry delay", () => {
    expect(calculateRetryDelayMs(3)).toBe(8000);
    expect(() =>
      createSignedArtifactMetadata({
        kind: "uploaded_signed_fallback",
        storageKey: "../signed.pdf",
        originalFilename: "signed.pdf",
        contentType: "application/pdf",
        sizeBytes: 1,
        checksumSha256: "a".repeat(64),
        legalHold: false,
      }),
    ).toThrow("relative");
    expect(
      createSignedArtifactMetadata({
        kind: "uploaded_signed_fallback",
        storageKey: "contracts/c/signed.pdf",
        originalFilename: "signed.pdf",
        contentType: "application/pdf",
        sizeBytes: 1,
        checksumSha256: "a".repeat(64),
        retentionUntil: "2027-01-01T00:00:00Z",
        legalHold: true,
      }).legalHold,
    ).toBe(true);
  });
});

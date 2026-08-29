import { describe, expect, it } from "vitest";

import { CrmService } from "../src/crm/crm.service.js";
import { OperationsSearchService } from "../src/operations/operations.service.js";

describe("bounded staff list and search load", () => {
  it("runs common read paths against realistic bounded fixtures locally", async () => {
    const database = {
      query: (text: string) =>
        Promise.resolve({
          rows: text.includes("operations_search_documents")
            ? Array.from({ length: 25 }, (_, index) => ({
                id: `result-${index}`,
                title: "Lead result",
                resource_type: "lead",
              }))
            : Array.from({ length: 200 }, (_, index) => ({
                id: `lead-${index}`,
                email: `lead-${index}@example.test`,
                name: "Lead",
                intake_type: "contact",
                stage: "new",
                source: "load",
                created_at: new Date().toISOString(),
              })),
        }),
    };
    const crm = new CrmService(database as never);
    const search = new OperationsSearchService(database as never);
    const started = performance.now();
    await Promise.all(
      Array.from({ length: 100 }, async () => {
        await crm.listLeads("org-load");
        await search.search("org-load", "lead");
      }),
    );
    expect(performance.now() - started).toBeLessThan(2_000);
  });
});

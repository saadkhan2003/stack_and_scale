import { describe, expect, it } from "vitest";

import { MetricsService } from "../src/observability/metrics.service.js";

describe("MetricsService", () => {
  it("exports route templates and statuses without query values", () => {
    const metrics = new MetricsService();
    metrics.recordRequest({
      method: "POST",
      route: "/api/v1/leads",
      statusCode: 201,
      durationMs: 12.5,
    });
    metrics.recordRequest({
      method: "GET",
      route: "/unsafe?email=person@example.com",
      statusCode: 500,
      durationMs: 4,
    });

    const output = metrics.renderPrometheus();

    expect(output).toContain(
      'method="POST",route="/api/v1/leads",status="201"',
    );
    expect(output).toContain('method="GET",route="unknown",status="500"');
    expect(output).not.toContain("person@example.com");
    expect(output).toContain(
      'stack_and_scale_api_failures_total{method="GET",route="unknown"} 1',
    );
  });
});

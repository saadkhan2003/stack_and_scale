import { Injectable } from "@nestjs/common";
import { readFileSync } from "node:fs";

type RequestMetric = Readonly<{
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
}>;

type Counter = Map<string, number>;

function labelValue(value: string): string {
  return value
    .replace(/\\\\/gu, "\\\\\\\\")
    .replace(/"/gu, '\\"')
    .replace(/\n/gu, "\\n");
}

function labels(values: Record<string, string | number>): string {
  return `{${Object.entries(values)
    .map(([key, value]) => `${key}="${labelValue(String(value))}"`)
    .join(",")}}`;
}

/**
 * Deliberately small Prometheus text exporter. It avoids another runtime
 * dependency and records only route templates, never request bodies, query
 * values, authorization headers or customer identifiers.
 */
@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private readonly requests: Counter = new Map();
  private readonly failures: Counter = new Map();
  private requestDurationMsTotal = 0;

  recordRequest(metric: RequestMetric): void {
    const route = this.safeRoute(metric.route);
    const key = [
      metric.method.toUpperCase(),
      route,
      String(metric.statusCode),
    ].join("|");
    this.requests.set(key, (this.requests.get(key) ?? 0) + 1);
    this.requestDurationMsTotal += Math.max(0, metric.durationMs);

    if (metric.statusCode >= 500) {
      const failureKey = [metric.method.toUpperCase(), route].join("|");
      this.failures.set(failureKey, (this.failures.get(failureKey) ?? 0) + 1);
    }
  }

  renderPrometheus(): string {
    const lines = [
      "# HELP stack_and_scale_api_requests_total Completed HTTP requests by route and status.",
      "# TYPE stack_and_scale_api_requests_total counter",
    ];

    for (const [key, value] of this.requests) {
      const [method = "unknown", route = "unknown", status = "0"] =
        key.split("|");
      lines.push(
        `stack_and_scale_api_requests_total${labels({ method, route, status })} ${value}`,
      );
    }

    lines.push(
      "# HELP stack_and_scale_api_failures_total Completed HTTP requests with a 5xx status.",
      "# TYPE stack_and_scale_api_failures_total counter",
    );
    for (const [key, value] of this.failures) {
      const [method = "unknown", route = "unknown"] = key.split("|");
      lines.push(
        `stack_and_scale_api_failures_total${labels({ method, route })} ${value}`,
      );
    }

    lines.push(
      "# HELP stack_and_scale_api_request_duration_milliseconds_total Total completed request duration in milliseconds.",
      "# TYPE stack_and_scale_api_request_duration_milliseconds_total counter",
      `stack_and_scale_api_request_duration_milliseconds_total ${this.requestDurationMsTotal}`,
      "# HELP stack_and_scale_api_process_uptime_seconds Process uptime in seconds.",
      "# TYPE stack_and_scale_api_process_uptime_seconds gauge",
      `stack_and_scale_api_process_uptime_seconds ${Math.floor((Date.now() - this.startedAt) / 1000)}`,
      "# HELP stack_and_scale_api_process_resident_memory_bytes Resident process memory in bytes.",
      "# TYPE stack_and_scale_api_process_resident_memory_bytes gauge",
      `stack_and_scale_api_process_resident_memory_bytes ${process.memoryUsage().rss}`,
    );

    return `${lines.join("\n")}\n`;
  }

  configuredBearerToken(): string | undefined {
    const direct = process.env["METRICS_BEARER_TOKEN"]?.trim();
    if (direct !== undefined && direct.length >= 24) return direct;

    const file = process.env["METRICS_BEARER_TOKEN_FILE"]?.trim();
    if (file === undefined || file.length === 0) return undefined;
    try {
      const value = readFileSync(file, "utf8").trim();
      return value.length >= 24 ? value : undefined;
    } catch {
      return undefined;
    }
  }

  private safeRoute(route: string): string {
    if (route.startsWith("/") && route.length <= 160 && !route.includes("?")) {
      return route;
    }
    return "unknown";
  }
}

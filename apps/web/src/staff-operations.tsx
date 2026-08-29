"use client";

import { useEffect, useState } from "react";
import { playStaffCue } from "./staff-sfx";

type Release = {
  environment: string;
  deployedVersion: string;
  migrationVersion: string;
  health: {
    status: string;
    database: string;
    migrations: string;
    outbox: string;
    privacy: string;
  };
  deploymentHistory: Array<{
    environment: string;
    imageTag: string;
    schemaVersion: string;
  }>;
  rollback: { status: string; targetVersion: string | null; policy: string };
};
type Metric = {
  current: number;
  projected: number;
  limit: number;
  unit: string;
  utilizationPercent: number;
};
type Capacity = {
  capturedAt: string;
  environment: string;
  metrics: { cpu: Metric; memory: Metric; disk: Metric; connections: Metric };
  retention: { metricsDays: number; logsDays: number; traces: string };
  degradationControls: string[];
  nextTopology: string;
};

export function StaffOperations() {
  const [release, setRelease] = useState<Release | null>(null);
  const [capacity, setCapacity] = useState<Capacity | null>(null);
  const [notice, setNotice] = useState("Loading release and capacity data...");

  useEffect(() => {
    void Promise.all([
      fetch("/api/staff/operations/release", { cache: "no-store" }).then(
        (response) =>
          response.ok
            ? response.json()
            : Promise.reject(new Error(`release:${response.status}`)),
      ),
      fetch("/api/staff/operations/capacity", { cache: "no-store" }).then(
        (response) =>
          response.ok
            ? response.json()
            : Promise.reject(new Error(`capacity:${response.status}`)),
      ),
    ])
      .then(([releasePayload, capacityPayload]) => {
        setRelease((releasePayload as { data: Release }).data);
        setCapacity((capacityPayload as { data: Capacity }).data);
        setNotice("Read-only operational snapshot loaded.");
        playStaffCue("check");
      })
      .catch(() => {
        setNotice("Release or capacity data is unavailable.");
        playStaffCue("error");
      });
  }, []);

  return (
    <section
      className="staff-crm staff-operations"
      aria-labelledby="operations-heading"
    >
      <p className="eyebrow">Staff operations</p>
      <h1 id="operations-heading">Release &amp; capacity</h1>
      <p className="staff-crm-lede">
        Read-only delivery visibility and bounded runtime measurements. No
        deployment controls or secrets are shown.
      </p>
      <p aria-live="polite" role="status">
        {notice}
      </p>
      {release ? <ReleasePanel release={release} /> : null}
      {capacity ? <CapacityPanel capacity={capacity} /> : null}
    </section>
  );
}

function ReleasePanel({ release }: { release: Release }) {
  return (
    <section className="staff-ops-section" aria-labelledby="release-heading">
      <div className="staff-ops-heading">
        <div>
          <p className="eyebrow">Delivery</p>
          <h2 id="release-heading">Release visibility</h2>
        </div>
        <strong
          className={`staff-health staff-health-${release.health.status}`}
        >
          {release.health.status}
        </strong>
      </div>
      <dl className="staff-ops-facts">
        <div>
          <dt>Environment</dt>
          <dd>{release.environment}</dd>
        </div>
        <div>
          <dt>Deployed version</dt>
          <dd>{release.deployedVersion}</dd>
        </div>
        <div>
          <dt>Migration version</dt>
          <dd>{release.migrationVersion}</dd>
        </div>
        <div>
          <dt>Rollback</dt>
          <dd>
            {release.rollback.status}
            {release.rollback.targetVersion
              ? ` to ${release.rollback.targetVersion}`
              : ""}
          </dd>
        </div>
      </dl>
      <p className="staff-ops-checks">
        Database {release.health.database} · migrations{" "}
        {release.health.migrations} · outbox {release.health.outbox} · privacy{" "}
        {release.health.privacy}
      </p>
      <h3>Deployment history</h3>
      <div className="staff-ops-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Environment</th>
              <th>Version</th>
              <th>Migration</th>
            </tr>
          </thead>
          <tbody>
            {release.deploymentHistory.map((item) => (
              <tr key={`${item.environment}-${item.imageTag}`}>
                <td>{item.environment}</td>
                <td>{item.imageTag}</td>
                <td>{item.schemaVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CapacityPanel({ capacity }: { capacity: Capacity }) {
  return (
    <section className="staff-ops-section" aria-labelledby="capacity-heading">
      <div className="staff-ops-heading">
        <div>
          <p className="eyebrow">Runtime</p>
          <h2 id="capacity-heading">Capacity snapshot</h2>
        </div>
        <span>{new Date(capacity.capturedAt).toLocaleString()}</span>
      </div>
      <div className="staff-capacity-grid">
        {Object.entries(capacity.metrics).map(([name, metric]) => (
          <article className="staff-capacity-metric" key={name}>
            <h3>{name}</h3>
            <strong>{formatMetric(metric.current, metric.unit)}</strong>
            <p>
              {metric.utilizationPercent}% of{" "}
              {formatMetric(metric.limit, metric.unit)}
            </p>
            <small>
              Projected at 2x: {formatMetric(metric.projected, metric.unit)}
            </small>
          </article>
        ))}
      </div>
      <div className="staff-ops-notes">
        <div>
          <h3>Retention</h3>
          <p>
            Metrics {capacity.retention.metricsDays} days · logs{" "}
            {capacity.retention.logsDays} days · traces{" "}
            {capacity.retention.traces}
          </p>
        </div>
        <div>
          <h3>Degradation controls</h3>
          <ul>
            {capacity.degradationControls.map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Next topology trigger</h3>
          <p>{capacity.nextTopology}</p>
        </div>
      </div>
    </section>
  );
}

function formatMetric(value: number, unit: string): string {
  if (unit === "bytes") return `${(value / 1024 ** 3).toFixed(2)} GiB`;
  if (unit === "percent") return `${value.toFixed(1)}%`;
  return `${Math.round(value)} ${unit}`;
}

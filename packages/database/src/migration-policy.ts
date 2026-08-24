export type MigrationKind = "schema" | "data";
export type MigrationCompatibility = "additive" | "breaking";
export type MigrationRecovery = "rollback" | "roll-forward" | "none";

export type MigrationPlan = Readonly<{
  name: string;
  kind: MigrationKind;
  compatibility: MigrationCompatibility;
  reviewed: boolean;
  stagingTested: boolean;
  backupReady: boolean;
  recovery: MigrationRecovery;
  deployed: boolean;
  modifiedAfterDeployment: boolean;
  includesSchemaChanges?: boolean;
  compatibilityPlan?: "expand-contract";
}>;

const migrationNamePattern = /^\d{4}_[a-z0-9]+(?:_[a-z0-9]+)*$/;

export function validateMigrationPlan(plan: MigrationPlan): readonly string[] {
  const violations: string[] = [];

  if (!migrationNamePattern.test(plan.name)) {
    violations.push("name must use the immutable NNNN_description format");
  }

  if (plan.deployed && plan.modifiedAfterDeployment) {
    violations.push("deployed migrations are immutable");
  }

  if (!plan.reviewed) {
    violations.push("migration must be reviewed before it can run");
  }

  if (!plan.stagingTested) {
    violations.push("migration must be tested in staging before it can run");
  }

  if (!plan.backupReady) {
    violations.push("backup readiness is required before a migration can run");
  }

  if (plan.recovery === "none") {
    violations.push(
      "migration requires a rollback or roll-forward recovery plan",
    );
  }

  if (plan.kind === "data" && plan.includesSchemaChanges) {
    violations.push("data migrations must not include schema changes");
  }

  if (
    plan.compatibility === "breaking" &&
    plan.compatibilityPlan !== "expand-contract"
  ) {
    violations.push("breaking migrations require a compatibility rollout plan");
  }

  return violations;
}

export function assertMigrationPlan(plan: MigrationPlan): void {
  const violations = validateMigrationPlan(plan);

  if (violations.length > 0) {
    throw new Error(`Unsafe migration plan: ${violations.join("; ")}`);
  }
}

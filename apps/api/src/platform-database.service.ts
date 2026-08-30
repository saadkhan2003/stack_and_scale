import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import {
  checkDatabaseReadiness,
  createPostgresPoolFromEnv,
  createPrivacyRequestRecord,
  type CreatePrivacyRequestRecordInput,
  type CreatePrivacyRequestRecordResult,
  type DatabasePool,
  type DatabaseReadiness,
  type Queryable,
} from "@stack-and-scale/database";

@Injectable()
export class PlatformDatabaseService implements OnModuleDestroy {
  private readonly pool: DatabasePool;

  public constructor() {
    this.pool = createPostgresPoolFromEnv();
  }

  public async readiness(): Promise<DatabaseReadiness> {
    return checkDatabaseReadiness(this.pool);
  }

  public query(text: string, values?: readonly unknown[]) {
    return this.pool.query(text, values);
  }

  public transaction<T>(work: (client: Queryable) => Promise<T>): Promise<T> {
    return this.pool.transaction(work);
  }

  public async createPrivacyRequest(
    input: CreatePrivacyRequestRecordInput,
  ): Promise<CreatePrivacyRequestRecordResult> {
    return createPrivacyRequestRecord(this.pool, input);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

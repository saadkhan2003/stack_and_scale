import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AppController } from "./app.controller.js";
import { ApiExceptionFilter } from "./common/http/api-exception.filter.js";
import { CorrelationIdInterceptor } from "./common/http/correlation-id.interceptor.js";
import { AuthModule } from "./auth/auth.module.js";
import { IdentityController } from "./identity/identity.controller.js";
import { InvitationModule } from "./identity/invitations/invitation.module.js";
import { SessionModule } from "./identity/sessions/session.module.js";
import { TenantAccessService } from "./identity/tenant-access.service.js";
import { LeadModule } from "./leads/lead.module.js";
import { PlatformDatabaseModule } from "./platform-database.module.js";
import { RateLimitInterceptor } from "./common/http/rate-limit.interceptor.js";
import { RateLimitModule } from "./common/http/rate-limit.module.js";
import { CrmModule } from "./crm/crm.module.js";
import { MetricsInterceptor } from "./observability/metrics.interceptor.js";
import { MetricsService } from "./observability/metrics.service.js";
import { OperationsModule } from "./operations/operations.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { KnowledgeModule } from "./knowledge/knowledge.module.js";
import { ReportsModule } from "./reports/reports.module.js";
import { ProposalModule } from "./proposals/proposal.module.js";
import { ContractModule } from "./contracts/contract.module.js";
import { InvoiceModule } from "./invoices/invoice.module.js";
import { AccountingModule } from "./accounting/accounting.module.js";
import { SupportModule } from "./support/support.module.js";

@Module({
  imports: [
    AuthModule,
    SessionModule,
    InvitationModule,
    PlatformDatabaseModule,
    LeadModule,
    CrmModule,
    RateLimitModule,
    OperationsModule,
    NotificationsModule,
    KnowledgeModule,
    ReportsModule,
    ProposalModule,
    ContractModule,
    InvoiceModule,
    AccountingModule,
    SupportModule,
  ],
  controllers: [AppController, IdentityController],
  providers: [
    TenantAccessService,
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: RateLimitInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}

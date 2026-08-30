import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrivateFilesModule } from "../files/private-files.module.js";
import { PlatformDatabaseModule } from "../platform-database.module.js";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";
import {
  InvoiceController,
  PaymentProviderController,
} from "./invoice.controller.js";
import {
  hmacPaymentVerifier,
  InvoiceService,
  PAYMENT_PROVIDER_ADAPTER,
} from "./invoice.service.js";

@Module({
  imports: [AuthModule, PlatformDatabaseModule, PrivateFilesModule],
  controllers: [InvoiceController, PaymentProviderController],
  providers: [
    TenantAccessService,
    CrmAccessService,
    InvoiceService,
    {
      provide: PAYMENT_PROVIDER_ADAPTER,
      useFactory: () => {
        const secret = process.env["PAYMENT_PROVIDER_CALLBACK_SECRET"];
        return secret ? hmacPaymentVerifier(secret) : undefined;
      },
    },
  ],
})
export class InvoiceModule {}

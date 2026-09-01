import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { CrmModule } from "../crm/crm.module.js";
import { ProductAccountController } from "./product-account.controller.js";
import { ProductCatalogController } from "./product-catalog.controller.js";
import { ProductAccountAccessService } from "./product-account-access.service.js";
import { ProductAccountService } from "./product-account.service.js";

@Module({
  imports: [AuthModule, CrmModule],
  controllers: [ProductAccountController, ProductCatalogController],
  providers: [
    PlatformDatabaseService,
    ProductAccountAccessService,
    ProductAccountService,
  ],
})
export class ProductAccountModule {}

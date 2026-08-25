import { Module } from "@nestjs/common";

import { RateLimitInterceptor } from "./rate-limit.interceptor.js";
import {
  RATE_LIMIT_STORE,
  SlidingWindowRateLimitStore,
} from "./rate-limit.store.js";

@Module({
  providers: [
    SlidingWindowRateLimitStore,
    {
      provide: RATE_LIMIT_STORE,
      useExisting: SlidingWindowRateLimitStore,
    },
    RateLimitInterceptor,
  ],
  exports: [
    SlidingWindowRateLimitStore,
    { provide: RATE_LIMIT_STORE, useExisting: SlidingWindowRateLimitStore },
    RateLimitInterceptor,
  ],
})
export class RateLimitModule {}

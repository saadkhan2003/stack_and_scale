import { Inject, Injectable, Optional } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";

export const RATE_LIMIT_CLOCK = Symbol("RATE_LIMIT_CLOCK");
export const RATE_LIMIT_STORE = Symbol("RATE_LIMIT_STORE");
export const RATE_LIMIT_OPTIONS = Symbol("RATE_LIMIT_OPTIONS");

export type RateLimitClock = () => number;

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitStore = {
  hit(key: string, windowMs: number): number;
};

@Injectable()
export class SlidingWindowRateLimitStore
  implements RateLimitStore, OnModuleDestroy
{
  private readonly hits = new Map<string, number[]>();
  private readonly clock: RateLimitClock;

  constructor(@Optional() @Inject(RATE_LIMIT_CLOCK) clock?: RateLimitClock) {
    this.clock = clock ?? Date.now;
  }

  hit(key: string, windowMs: number): number {
    const now = this.clock();
    const cutoff = now - windowMs;
    const previous = this.hits.get(key) ?? [];
    const timestamps = previous.filter((timestamp) => timestamp > cutoff);
    timestamps.push(now);
    this.hits.set(key, timestamps);

    return timestamps.length;
  }

  get size(): number {
    return this.hits.size;
  }

  onModuleDestroy(): void {
    this.hits.clear();
  }
}

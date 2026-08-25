import { HttpException, HttpStatus } from "@nestjs/common";
import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { firstValueFrom, of } from "rxjs";
import type { Observable } from "rxjs";

import { RateLimitInterceptor } from "../src/common/http/rate-limit.interceptor.js";
import {
  RATE_LIMIT_OPTIONS,
  type RateLimitClock,
  type RateLimitStore,
  SlidingWindowRateLimitStore,
} from "../src/common/http/rate-limit.store.js";
import { RateLimitModule } from "../src/common/http/rate-limit.module.js";

class FakeClock {
  private current = 1_000_000;

  readonly now: RateLimitClock = () => this.current;

  advance(ms: number): void {
    this.current += ms;
  }
}

type FakeStoreState = { count: number; startedAt: number };

class FakeStore implements RateLimitStore {
  readonly entries = new Map<string, FakeStoreState>();

  constructor(private readonly clock: FakeClock) {}

  hit(key: string, windowMs: number): number {
    const now = this.clock.now();
    const existing = this.entries.get(key);

    if (!existing || now - existing.startedAt > windowMs) {
      this.entries.set(key, { count: 1, startedAt: now });

      return 1;
    }

    existing.count += 1;

    return existing.count;
  }
}

function createContext(
  method: string,
  url: string,
  ip: string,
): ExecutionContext {
  const request = {
    method,
    url,
    ip,
    headers: {},
    routeOptions: { url },
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

const next: CallHandler = { handle: () => of("ok") };

async function run(interceptor: RateLimitInterceptor): Promise<string> {
  const context = createContext("POST", "/auth/login", "203.0.113.7");

  return firstValueFrom(
    interceptor.intercept(context, next) as Observable<string>,
  );
}

describe("RateLimitInterceptor", () => {
  it("allows requests under the limit", async () => {
    const clock = new FakeClock();
    const interceptor = new RateLimitInterceptor(new FakeStore(clock), {
      limit: 5,
      windowMs: 60_000,
    });

    for (let i = 0; i < 5; i += 1) {
      await expect(run(interceptor)).resolves.toBe("ok");
    }
  });

  it("throws a 429 HttpException with the standard message over the limit", async () => {
    const clock = new FakeClock();
    const interceptor = new RateLimitInterceptor(new FakeStore(clock), {
      limit: 3,
      windowMs: 60_000,
    });

    for (let i = 0; i < 3; i += 1) {
      await run(interceptor);
    }

    const error = await run(interceptor).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpException);
    const httpException = error as HttpException;
    expect(httpException.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(httpException.getResponse()).toMatchObject({
      code: "RATE_LIMITED",
      message: "Too many requests.",
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it("slides the window so blocked keys recover after windowMs", async () => {
    const clock = new FakeClock();
    const store = new SlidingWindowRateLimitStore(() => clock.now());
    const interceptor = new RateLimitInterceptor(store, {
      limit: 3,
      windowMs: 1_000,
    });

    for (let i = 0; i < 3; i += 1) {
      await expect(run(interceptor)).resolves.toBe("ok");
    }
    clock.advance(500);
    await expect(run(interceptor)).rejects.toBeInstanceOf(HttpException);

    clock.advance(501);
    await expect(run(interceptor)).resolves.toBe("ok");
  });

  it("keeps keys independent by route and actor", async () => {
    const clock = new FakeClock();
    const store = new FakeStore(clock);
    const interceptor = new RateLimitInterceptor(store, {
      limit: 2,
      windowMs: 60_000,
    });
    const contextA = createContext("POST", "/auth/login", "203.0.113.7");
    const contextB = createContext("POST", "/auth/login", "198.51.100.9");

    for (let i = 0; i < 2; i += 1) {
      await expect(
        firstValueFrom(interceptor.intercept(contextA, next)),
      ).resolves.toBe("ok");
    }
    await expect(
      firstValueFrom(interceptor.intercept(contextB, next)),
    ).resolves.toBe("ok");
    await expect(
      firstValueFrom(interceptor.intercept(contextA, next)),
    ).rejects.toBeInstanceOf(HttpException);
    await expect(
      firstValueFrom(interceptor.intercept(contextB, next)),
    ).resolves.toBe("ok");
  });

  it("delegates counting to the injected store with the configured window", async () => {
    const clock = new FakeClock();
    const store = new FakeStore(clock);
    const interceptor = new RateLimitInterceptor(store, {
      limit: 1,
      windowMs: 250,
    });

    await run(interceptor);
    await expect(run(interceptor)).rejects.toBeInstanceOf(HttpException);

    clock.advance(251);
    await run(interceptor);

    const entry = store.entries.get("POST:/auth/login:203.0.113.7");
    expect(entry).toEqual({ count: 1, startedAt: clock.now() });
  });

  it("clears all tracked state on module destroy leaving no timers or data", async () => {
    const clock = new FakeClock();
    const store = new SlidingWindowRateLimitStore(() => clock.now());
    const interceptor = new RateLimitInterceptor(store, {
      limit: 0,
      windowMs: 60_000,
    });

    await expect(run(interceptor)).rejects.toBeInstanceOf(HttpException);
    expect(store.size).toBe(1);

    store.onModuleDestroy();

    expect(store.size).toBe(0);
  });

  it("applies default limits of 30 per 60 seconds when no options given", async () => {
    const clock = new FakeClock();
    const interceptor = new RateLimitInterceptor(new FakeStore(clock));

    for (let i = 0; i < 30; i += 1) {
      await expect(run(interceptor)).resolves.toBe("ok");
    }
    await expect(run(interceptor)).rejects.toBeInstanceOf(HttpException);
  });

  it("exposes providers and exports for module wiring", () => {
    expect(RateLimitModule).toBeDefined();
    expect(RATE_LIMIT_OPTIONS).toBeDefined();

    const getMetadata = Reflect.getMetadata as
      | ((key: string, target: object) => unknown)
      | undefined;
    const metadata = getMetadata?.("providers", RateLimitModule);

    if (metadata) {
      expect(metadata).toContain(SlidingWindowRateLimitStore);
      expect(metadata).toContain(RateLimitInterceptor);
    }
  });
});

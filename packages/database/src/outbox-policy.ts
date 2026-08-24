export type OutboxStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "dead_letter";

export type OutboxEventState = Readonly<{
  status: OutboxStatus;
  attempts: number;
}>;

export type OutboxTransition =
  | Readonly<{ type: "claim" }>
  | Readonly<{ type: "deliver" }>
  | Readonly<{ type: "retry" }>
  | Readonly<{ type: "dead-letter" }>
  | Readonly<{ type: "replay"; authorized: boolean }>;

export type RetryDelayInput = Readonly<{
  attempt: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}>;

const defaultBaseDelayMs = 1_000;
const defaultMaxDelayMs = 300_000;

export function calculateRetryDelayMs({
  attempt,
  baseDelayMs = defaultBaseDelayMs,
  maxDelayMs = defaultMaxDelayMs,
}: RetryDelayInput): number {
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new Error("attempt must be a positive integer");
  }

  if (!Number.isFinite(baseDelayMs) || baseDelayMs <= 0) {
    throw new Error("baseDelayMs must be greater than zero");
  }

  if (!Number.isFinite(maxDelayMs) || maxDelayMs < baseDelayMs) {
    throw new Error("maxDelayMs must be at least baseDelayMs");
  }

  return Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
}

export function transitionOutboxEvent(
  state: OutboxEventState,
  transition: OutboxTransition,
): OutboxEventState {
  assertValidAttempts(state.attempts);

  switch (transition.type) {
    case "claim":
      assertStatus(state, "pending", "claim");
      return { status: "processing", attempts: state.attempts + 1 };
    case "deliver":
      assertStatus(state, "processing", "deliver");
      return { status: "delivered", attempts: state.attempts };
    case "retry":
      assertStatus(state, "processing", "retry");
      return { status: "pending", attempts: state.attempts };
    case "dead-letter":
      assertStatus(state, "processing", "dead-letter");
      return { status: "dead_letter", attempts: state.attempts };
    case "replay":
      assertStatus(state, "dead_letter", "replay");
      if (!transition.authorized) {
        throw new Error("manual replay must be authorized");
      }
      return { status: "pending", attempts: state.attempts };
  }
}

function assertValidAttempts(attempts: number): void {
  if (!Number.isInteger(attempts) || attempts < 0) {
    throw new Error("attempts must be a non-negative integer");
  }
}

function assertStatus(
  state: OutboxEventState,
  expectedStatus: OutboxStatus,
  action: OutboxTransition["type"],
): void {
  if (state.status !== expectedStatus) {
    throw new Error(
      `cannot ${action} an outbox event in ${state.status} status`,
    );
  }
}

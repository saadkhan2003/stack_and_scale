import { calculateRetryDelayMs } from "@stack-and-scale/database";

export type DeliverableOutboxEvent = Readonly<{
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  attempts: number;
}>;

export type OutboxDeliveryRepository = Readonly<{
  claimNext(): Promise<DeliverableOutboxEvent | null>;
  markDelivered(eventId: string): Promise<void>;
  releaseForRetry(
    eventId: string,
    delayMs: number,
    reason: string,
  ): Promise<void>;
  markDeadLetter(eventId: string, reason: string): Promise<void>;
  authorizeReplay(
    eventId: string,
    approverId: string,
    reason: string,
  ): Promise<void>;
}>;

export type OutboxDeliveryResult = Readonly<
  | {
      processed: false;
    }
  | {
      processed: true;
      finalStatus: "delivered" | "pending" | "dead_letter";
      eventId: string;
    }
>;

export type RunOutboxDeliveryOptions = Readonly<{
  maxAttempts?: number;
  retryDelayMs?: number;
}>;

export type DeadLetterReplayInput = Readonly<{
  eventId: string;
  approverId: string;
  reason: string;
}>;

export async function runOutboxDeliveryCycle(
  repository: OutboxDeliveryRepository,
  handler: (event: DeliverableOutboxEvent) => Promise<void>,
  options: RunOutboxDeliveryOptions = {},
): Promise<OutboxDeliveryResult> {
  const event = await repository.claimNext();
  if (event === null) {
    return { processed: false };
  }

  try {
    await handler(event);
    await repository.markDelivered(event.id);

    return {
      processed: true,
      finalStatus: "delivered",
      eventId: event.id,
    };
  } catch (error) {
    const reason = safeErrorMessage(error);
    const maxAttempts = options.maxAttempts ?? 5;

    if (event.attempts >= maxAttempts) {
      await repository.markDeadLetter(event.id, reason);

      return {
        processed: true,
        finalStatus: "dead_letter",
        eventId: event.id,
      };
    }

    const delayMs =
      options.retryDelayMs ??
      calculateRetryDelayMs({
        attempt: event.attempts,
      });
    await repository.releaseForRetry(event.id, delayMs, reason);

    return {
      processed: true,
      finalStatus: "pending",
      eventId: event.id,
    };
  }
}

export async function authorizeDeadLetterReplay(
  repository: OutboxDeliveryRepository,
  input: DeadLetterReplayInput,
): Promise<void> {
  if (input.approverId.trim().length === 0) {
    throw new Error("manual replay must include an approver");
  }

  if (input.reason.trim().length === 0) {
    throw new Error("manual replay must include a reason");
  }

  await repository.authorizeReplay(
    input.eventId,
    input.approverId,
    input.reason,
  );
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "unknown delivery failure";
}

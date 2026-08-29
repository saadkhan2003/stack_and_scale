import { appendFile } from "node:fs/promises";

import type { DeliverableOutboxEvent } from "./outbox-worker.js";

export type TransactionalEmail = Readonly<{
  to: string;
  subject: string;
  text: string;
}>;
export type EmailAdapter = Readonly<{
  send(email: TransactionalEmail): Promise<void>;
}>;
type Queryable = Readonly<{
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>;
}>;

export function createEmailAdapter(
  env: NodeJS.ProcessEnv = process.env,
): EmailAdapter {
  if (env["NODE_ENV"] !== "production")
    return new DevelopmentCaptureEmailAdapter(
      env["EMAIL_CAPTURE_PATH"] ?? "/tmp/stack-and-scale-email-capture.jsonl",
    );
  const apiKey = env["RESEND_API_KEY"];
  const from = env["TRANSACTIONAL_EMAIL_FROM"];
  if (!apiKey || !from)
    return {
      send: () =>
        Promise.reject(new Error("Transactional email is not configured.")),
    };
  return new ResendEmailAdapter(apiKey, from);
}

export class DevelopmentCaptureEmailAdapter implements EmailAdapter {
  public constructor(private readonly capturePath: string) {}
  public async send(email: TransactionalEmail): Promise<void> {
    await appendFile(
      this.capturePath,
      `${JSON.stringify({ ...email, capturedAt: new Date().toISOString() })}\n`,
      { encoding: "utf8", mode: 0o600 },
    );
  }
}

export class ResendEmailAdapter implements EmailAdapter {
  public constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}
  public async send(email: TransactionalEmail): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
      }),
    });
    if (!response.ok)
      throw new Error(`Email provider rejected delivery (${response.status}).`);
  }
}

export async function deliverLeadEmail(
  event: DeliverableOutboxEvent,
  database: Queryable,
  email: EmailAdapter,
  staffAddress: string | undefined,
): Promise<void> {
  if (event.eventType === "notification.email") {
    await deliverNotificationEmail(event, database, email);
    return;
  }
  if (
    event.eventType !== "crm.lead.created" &&
    event.eventType !== "crm.booking.confirmed"
  )
    return;
  const leadId = value(event.payload["leadId"]);
  if (!leadId) throw new Error("Lead event is missing a lead ID.");
  const result = await database.query(
    "SELECT name, email, intake_type FROM platform.leads WHERE id = $1",
    [leadId],
  );
  const lead = result.rows[0];
  if (!lead) throw new Error("Lead referenced by event no longer exists.");
  const name = value(lead["name"]) ?? "there";
  const recipient = value(lead["email"]);
  if (!recipient) throw new Error("Lead has no email address.");
  if (event.eventType === "crm.lead.created") {
    await email.send({
      to: recipient,
      subject: "We received your Stack & Scale enquiry",
      text: `Hi ${name},\n\nThanks for contacting Stack & Scale. Our team will review your enquiry and follow up shortly.\n\nStack & Scale`,
    });
    if (staffAddress)
      await email.send({
        to: staffAddress,
        subject: "New Stack & Scale lead",
        text: `A new ${value(lead["intake_type"]) ?? "contact"} lead has been added to the CRM. Open the staff inbox to review and assign it.`,
      });
  } else {
    await email.send({
      to: recipient,
      subject: "Your Stack & Scale demo booking",
      text: `Hi ${name},\n\nYour requested demo time has been recorded. Our team will confirm the details shortly.\n\nStack & Scale`,
    });
  }
}

async function deliverNotificationEmail(
  event: DeliverableOutboxEvent,
  database: Queryable,
  email: EmailAdapter,
): Promise<void> {
  const notificationId = value(event.payload["notificationId"]);
  if (!notificationId) throw new Error("Notification event is missing an ID.");
  const result = await database.query(
    `SELECT n.title, n.body, u.email
       FROM platform.notifications n
       JOIN identity.users u ON u.id = n.recipient_id
      WHERE n.id = $1`,
    [notificationId],
  );
  const notification = result.rows[0];
  if (!notification)
    throw new Error("Notification referenced by event no longer exists.");
  try {
    const recipient = value(notification["email"]);
    if (!recipient)
      throw new Error("Notification recipient has no email address.");
    await email.send({
      to: recipient,
      subject: value(notification["title"]) ?? "Stack & Scale notification",
      text:
        value(notification["body"]) ??
        "You have a new notification in the staff workspace.",
    });
    await database.query(
      "UPDATE platform.notifications SET delivery_state = 'delivered' WHERE id = $1",
      [notificationId],
    );
  } catch (error) {
    await database.query(
      "UPDATE platform.notifications SET delivery_state = 'failed' WHERE id = $1",
      [notificationId],
    );
    throw error;
  }
}

function value(input: unknown): string | undefined {
  return typeof input === "string" && input.trim() ? input : undefined;
}

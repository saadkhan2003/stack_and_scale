"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormStatus = "idle" | "sending" | "success" | "error";
const whatsappNumber =
  process.env["NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER"]?.replace(/\D/g, "") ?? "";

export function LeadForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");
  const [intakeType, setIntakeType] = useState("project");
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    void fetch("/api/demo-slots")
      .then((response) =>
        response.ok ? (response.json() as Promise<{ data?: unknown }>) : null,
      )
      .then((payload) =>
        setSlots(
          Array.isArray(payload?.data)
            ? payload.data.filter(
                (slot): slot is string => typeof slot === "string",
              )
            : [],
        ),
      )
      .catch(() => setSlots([]));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      message: form.get("message"),
      intakeType: form.get("intakeType"),
      consent: form.get("consent") === "on",
      honeypot: form.get("company"),
      attribution: {
        landingPage: window.location.pathname,
        source: "public-web",
        cta: "contact-form",
      },
    };
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(
          await responseMessage(response, "We could not send your request."),
        );
      const receipt = (await response.json()) as { id: string };
      if (body.intakeType === "demo") {
        const startsAt = form.get("demoStartsAt");
        const alternateRequest = form.get("alternateRequest");
        if (
          (typeof startsAt === "string" && startsAt) ||
          (typeof alternateRequest === "string" && alternateRequest.trim())
        ) {
          const booking = await fetch(
            `/api/leads/${encodeURIComponent(receipt.id)}/bookings`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                ...(typeof startsAt === "string" && startsAt
                  ? { startsAt: new Date(startsAt).toISOString() }
                  : {}),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ...(typeof alternateRequest === "string" &&
                alternateRequest.trim()
                  ? { alternateRequest }
                  : {}),
              }),
            },
          );
          if (!booking.ok)
            throw new Error(
              `Your enquiry was received, but ${await responseMessage(booking, "we could not reserve that demo time.")}`,
            );
        }
      }
      if (body.intakeType === "whatsapp" && whatsappNumber) {
        await fetch(
          `/api/leads/${encodeURIComponent(receipt.id)}/whatsapp-handoffs`,
          { method: "POST" },
        );
        window.location.assign(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Stack & Scale, I have submitted an enquiry and would like to continue here.")}`,
        );
        return;
      }
      setStatus("success");
      event.currentTarget.reset();
      setIntakeType("project");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not send your request.",
      );
      setStatus("error");
    }
  }

  if (status === "success")
    return (
      <Card className="lead-success" aria-live="polite">
        <CardHeader>
          <CardTitle>Thank you — your request is with us.</CardTitle>
          <CardDescription>
            We will reply using the email address you provided. If it is urgent,
            include that in your message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            onClick={() => setStatus("idle")}
            type="button"
          >
            Send another request
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <form className="lead-form" onSubmit={(event) => void submit(event)}>
      <div className="form-grid">
        <Label htmlFor="lead-name">
          Name
          <Input autoComplete="name" id="lead-name" name="name" required />
        </Label>
        <Label htmlFor="lead-email">
          Email
          <Input
            autoComplete="email"
            id="lead-email"
            name="email"
            required
            type="email"
          />
        </Label>
        <Label htmlFor="lead-phone">
          Phone <span>(optional)</span>
          <Input autoComplete="tel" id="lead-phone" name="phone" type="tel" />
        </Label>
        <Label htmlFor="lead-intake-type">
          How can we help?
          <Select
            id="lead-intake-type"
            name="intakeType"
            onValueChange={(value) => setIntakeType(value ?? "project")}
            value={intakeType}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demo">Book a product demo</SelectItem>
              <SelectItem value="project">Discuss a custom project</SelectItem>
              <SelectItem value="contact">General contact</SelectItem>
              {whatsappNumber ? (
                <SelectItem value="whatsapp">Continue on WhatsApp</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </Label>
      </div>
      {intakeType === "demo" ? (
        <fieldset className="demo-request">
          <legend>
            Book a product demo <span>(optional)</span>
          </legend>
          {slots.length > 0 ? (
            <Label htmlFor="demo-starts-at">
              Available time
              <Select name="demoStartsAt">
                <SelectTrigger className="w-full" id="demo-starts-at">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {new Date(slot).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <p>
              No public slots are currently listed. Send an alternate time and
              our team will confirm it.
            </p>
          )}
          <Label htmlFor="alternate-request">
            Alternative time or notes
            <Textarea id="alternate-request" name="alternateRequest" rows={3} />
          </Label>
        </fieldset>
      ) : null}
      <Label htmlFor="lead-message">
        What would you like to improve?
        <Textarea id="lead-message" name="message" rows={5} />
      </Label>
      <label className="honeypot" aria-hidden="true">
        Company
        <Input autoComplete="off" name="company" tabIndex={-1} />
      </label>
      <Label className="consent-check" htmlFor="lead-consent">
        <Checkbox id="lead-consent" name="consent" required />
        <span>
          I agree that Stack &amp; Scale may use these details to respond to
          this request. <a href="/privacy">Privacy details</a>.
        </span>
      </Label>
      {status === "error" ? (
        <Alert className="form-error" variant="destructive">
          <AlertDescription>
            {error} Your details are still in this form. You can try again
            shortly.
          </AlertDescription>
        </Alert>
      ) : null}
      <Button disabled={status === "sending"} type="submit">
        {status === "sending" ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}

async function responseMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  const error = payload?.error;
  if (typeof error === "string") return error;
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  )
    return error.message;
  return fallback;
}

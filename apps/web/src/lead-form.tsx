"use client";

import { useEffect, useState, type FormEvent } from "react";

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
      <section className="lead-success" aria-live="polite">
        <h2>Thank you — your request is with us.</h2>
        <p>
          We will reply using the email address you provided. If it is urgent,
          email hello@stackandscale.com.
        </p>
        <button
          className="button button-secondary"
          onClick={() => setStatus("idle")}
          type="button"
        >
          Send another request
        </button>
      </section>
    );
  return (
    <form className="lead-form" onSubmit={(event) => void submit(event)}>
      <div className="form-grid">
        <label>
          Name
          <input autoComplete="name" name="name" required />
        </label>
        <label>
          Email
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <label>
          Phone <span>(optional)</span>
          <input autoComplete="tel" name="phone" type="tel" />
        </label>
        <label>
          How can we help?
          <select
            name="intakeType"
            onChange={(event) => setIntakeType(event.target.value)}
            value={intakeType}
          >
            <option value="demo">Book a product demo</option>
            <option value="project">Discuss a custom project</option>
            <option value="contact">General contact</option>
            {whatsappNumber ? (
              <option value="whatsapp">Continue on WhatsApp</option>
            ) : null}
          </select>
        </label>
      </div>
      {intakeType === "demo" ? (
        <fieldset className="demo-request">
          <legend>
            Book a product demo <span>(optional)</span>
          </legend>
          {slots.length > 0 ? (
            <label>
              Available time
              <select defaultValue="" name="demoStartsAt">
                <option value="">Choose a time</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {new Date(slot).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p>
              No public slots are currently listed. Send an alternate time and
              our team will confirm it.
            </p>
          )}
          <label>
            Alternative time or notes
            <textarea name="alternateRequest" rows={3} />
          </label>
        </fieldset>
      ) : null}
      <label>
        What would you like to improve?
        <textarea name="message" rows={5} />
      </label>
      <label className="honeypot" aria-hidden="true">
        Company
        <input autoComplete="off" name="company" tabIndex={-1} />
      </label>
      <label className="consent-check">
        <input name="consent" required type="checkbox" />{" "}
        <span>
          I agree that Stack &amp; Scale may use these details to respond to
          this request. <a href="/privacy">Privacy details</a>.
        </span>
      </label>
      {status === "error" ? (
        <p className="form-error" role="alert">
          {error} Your details are still in this form. You can try again or
          email hello@stackandscale.com.
        </p>
      ) : null}
      <button
        className="button button-primary"
        disabled={status === "sending"}
        type="submit"
      >
        {status === "sending" ? "Sending…" : "Send request"}
      </button>
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

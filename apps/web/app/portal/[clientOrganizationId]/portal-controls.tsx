"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type Review = {
  id: string;
  target: { version: string; renderedChecksumSha256: string };
};

type Preference = {
  category: "security" | "billing" | "system";
  enabled: boolean;
};

type Member = {
  id: string;
  email: string;
  role: "client_admin" | "client_member";
  status: "active" | "suspended" | "revoked";
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
};

export function PortalControls({
  clientOrganizationId,
  reviews,
  preferences,
  tickets,
  members,
  canManageMembers,
}: Readonly<{
  clientOrganizationId: string;
  reviews: Review[];
  preferences: Preference[];
  tickets: Ticket[];
  members: Member[];
  canManageMembers: boolean;
}>) {
  const [message, setMessage] = useState<string | null>(null);
  const root = `/api/portal/${encodeURIComponent(clientOrganizationId)}`;

  async function send(path: string, body: unknown) {
    const response = await fetch(`${root}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("The change could not be saved.");
  }

  return (
    <>
      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading">Reviews</h2>
        {reviews.length === 0 ? <p>No reviews need your decision.</p> : null}
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <Button
                type="button"
                onClick={() => {
                  void (async () => {
                    try {
                      await send(`reviews/${review.id}/decisions`, {
                        idempotencyKey: crypto.randomUUID(),
                        decision: "accepted",
                        targetVersion: review.target.version,
                        renderedChecksumSha256:
                          review.target.renderedChecksumSha256,
                      });
                      setMessage(
                        "Review accepted. Refresh this page to see the updated list.",
                      );
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "Unable to save review.",
                      );
                    }
                  })();
                }}
              >
                Accept review
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  void (async () => {
                    try {
                      await send(`reviews/${review.id}/decisions`, {
                        idempotencyKey: crypto.randomUUID(),
                        decision: "rejected",
                        targetVersion: review.target.version,
                        renderedChecksumSha256:
                          review.target.renderedChecksumSha256,
                      });
                      setMessage(
                        "Review declined. Refresh this page to see the updated list.",
                      );
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "Unable to save review.",
                      );
                    }
                  })();
                }}
              >
                Decline review
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="support-heading">
        <h2 id="support-heading">Open a support request</h2>
        <form
          onSubmit={(event) => {
            void (async () => {
              event.preventDefault();
              const formElement = event.currentTarget;
              const form = new FormData(formElement);
              try {
                await send("support/tickets", {
                  subject: form.get("subject"),
                  description: form.get("description"),
                  category: form.get("category"),
                });
                formElement.reset();
                setMessage("Your support request has been created.");
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Unable to create ticket.",
                );
              }
            })();
          }}
        >
          <Label>
            Subject <Input name="subject" required maxLength={180} />
          </Label>
          <Label>
            Category
            <Select name="category" defaultValue="question">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="request">Request</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Label>
          <Label>
            Details <Textarea name="description" required maxLength={12000} />
          </Label>
          <Button type="submit">Send request</Button>
        </form>
        {tickets.length ? <h3>Your open and recent requests</h3> : null}
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <strong>{ticket.subject}</strong> —{" "}
              <Badge variant="outline">{ticket.status}</Badge>
              <form
                onSubmit={(event) => {
                  void (async () => {
                    event.preventDefault();
                    const formElement = event.currentTarget;
                    const form = new FormData(formElement);
                    try {
                      await send(`support/tickets/${ticket.id}/comments`, {
                        body: form.get("body"),
                      });
                      formElement.reset();
                      setMessage(
                        "Your reply has been added. Refresh to see the updated ticket.",
                      );
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "Unable to add reply.",
                      );
                    }
                  })();
                }}
              >
                <Label>
                  Add a public reply
                  <Textarea name="body" required maxLength={12000} />
                </Label>
                <Button type="submit">Send reply</Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="notifications-heading">
        <h2 id="notifications-heading">Notifications</h2>
        {preferences.map((preference) => (
          <Label key={preference.category}>
            <Checkbox
              defaultChecked={preference.enabled}
              disabled={preference.category === "security"}
              onCheckedChange={(checked) => {
                void (async () => {
                  try {
                    await send(
                      `notification-preferences/${preference.category}`,
                      {
                        enabled: checked,
                      },
                    );
                    setMessage("Notification preference saved.");
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Unable to save preference.",
                    );
                  }
                })();
              }}
            />
            {preference.category} notifications
          </Label>
        ))}
      </section>
      {canManageMembers ? (
        <section aria-labelledby="members-heading">
          <h2 id="members-heading">Portal members</h2>
          <p>
            A person must sign in once before you can grant them portal access.
          </p>
          <form
            onSubmit={(event) => {
              void (async () => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                try {
                  await send("members", {
                    email: form.get("email"),
                    role: form.get("role"),
                  });
                  event.currentTarget.reset();
                  setMessage(
                    "Portal member saved. Refresh to see the updated list.",
                  );
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Unable to save portal member.",
                  );
                }
              })();
            }}
          >
            <Label>
              Email <Input name="email" type="email" required maxLength={254} />
            </Label>
            <Label>
              Role
              <Select name="role" defaultValue="client_member">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_member">Member</SelectItem>
                  <SelectItem value="client_admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            <Button type="submit">Grant access</Button>
          </form>
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                <strong>{member.email}</strong> — {member.role} ({member.status}
                ){" "}
                {member.status === "active" ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    type="button"
                    onClick={() => {
                      void (async () => {
                        try {
                          await send(`members/${member.id}/revoke`, {});
                          setMessage(
                            "Portal access revoked. Refresh to see the updated list.",
                          );
                        } catch (error) {
                          setMessage(
                            error instanceof Error
                              ? error.message
                              : "Unable to revoke portal access.",
                          );
                        }
                      })();
                    }}
                  >
                    Revoke access
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {message ? (
        <Alert aria-live="polite">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}

"use client";

import { useState } from "react";

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
              <button
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
              </button>
              <button
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
              </button>
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
          <label>
            Subject <input name="subject" required maxLength={180} />
          </label>
          <label>
            Category
            <select name="category" defaultValue="question">
              <option value="question">Question</option>
              <option value="request">Request</option>
              <option value="bug">Bug</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Details <textarea name="description" required maxLength={12000} />
          </label>
          <button type="submit">Send request</button>
        </form>
        {tickets.length ? <h3>Your open and recent requests</h3> : null}
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <strong>{ticket.subject}</strong> — {ticket.status}
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
                <label>
                  Add a public reply
                  <textarea name="body" required maxLength={12000} />
                </label>
                <button type="submit">Send reply</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="notifications-heading">
        <h2 id="notifications-heading">Notifications</h2>
        {preferences.map((preference) => (
          <label key={preference.category}>
            <input
              type="checkbox"
              defaultChecked={preference.enabled}
              disabled={preference.category === "security"}
              onChange={(event) => {
                void (async () => {
                  try {
                    await send(
                      `notification-preferences/${preference.category}`,
                      {
                        enabled: event.currentTarget.checked,
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
          </label>
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
            <label>
              Email <input name="email" type="email" required maxLength={254} />
            </label>
            <label>
              Role
              <select name="role" defaultValue="client_member">
                <option value="client_member">Member</option>
                <option value="client_admin">Administrator</option>
              </select>
            </label>
            <button type="submit">Grant access</button>
          </form>
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                <strong>{member.email}</strong> — {member.role} ({member.status}
                ){" "}
                {member.status === "active" ? (
                  <button
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
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p aria-live="polite">{message}</p>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { playStaffCue } from "./staff-sfx";

type Notification = {
  id: string;
  category: string;
  urgency: string;
  title: string;
  body: string;
  deepLink: string;
  readAt: string | null;
  deliveryState: string;
  createdAt: string;
};

export function StaffNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [notice, setNotice] = useState("Loading notifications...");
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  const refresh = async () => {
    const response = await fetch("/api/staff/notifications", {
      cache: "no-store",
    });
    if (!response.ok) {
      setNotice(
        response.status === 403
          ? "You do not have access to notifications."
          : "Unable to load notifications.",
      );
      return;
    }
    const payload = (await response.json()) as { data: Notification[] };
    setItems(payload.data);
    setNotice(payload.data.length ? "" : "No notifications yet.");
    const preferenceResponse = await fetch(
      "/api/staff/notifications/preferences",
      { cache: "no-store" },
    );
    if (preferenceResponse.ok) {
      const preferencePayload = (await preferenceResponse.json()) as {
        data: { category: string; enabled: boolean }[];
      };
      setPreferences(
        Object.fromEntries(
          preferencePayload.data.map((item) => [item.category, item.enabled]),
        ),
      );
    }
  };
  useEffect(() => {
    void refresh();
  }, []);

  const markRead = async (item: Notification) => {
    if (item.readAt) return;
    const response = await fetch(
      `/api/staff/notifications/${encodeURIComponent(item.id)}/read`,
      { method: "PATCH" },
    );
    if (response.ok) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, readAt: new Date().toISOString() }
            : entry,
        ),
      );
      playStaffCue("check");
    }
  };

  const togglePreference = async (category: string) => {
    const enabled = !preferences[category];
    const response = await fetch(
      `/api/staff/notifications/preferences/${encodeURIComponent(category)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled }),
      },
    );
    if (response.ok)
      setPreferences((current) => ({ ...current, [category]: enabled }));
  };

  return (
    <section
      className="staff-notifications"
      aria-labelledby="notifications-heading"
    >
      <p className="eyebrow">Staff workspace</p>
      <h1 id="notifications-heading">Notification inbox</h1>
      <p className="staff-crm-lede">
        Durable operational and security notices for this workspace.
      </p>
      {notice ? <p role="status">{notice}</p> : null}
      <div
        className="staff-notification-preferences"
        aria-label="Notification preferences"
      >
        {Object.keys(preferences).map((category) => (
          <Label key={category}>
            <Checkbox
              checked={preferences[category]}
              disabled={category === "security"}
              onCheckedChange={() => void togglePreference(category)}
            />
            {category} notices
          </Label>
        ))}
      </div>
      <ul className="staff-notification-list">
        {items.map((item) => (
          <li
            className={`${item.readAt ? "is-read" : "is-unread"} urgency-${item.urgency}`}
            key={item.id}
          >
            <Button onClick={() => void markRead(item)} variant="ghost">
              <Badge className="staff-record-id" variant="outline">
                {item.category} / {item.urgency}
              </Badge>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
              <small>
                {new Date(item.createdAt).toLocaleString()} · email{" "}
                {item.deliveryState}
              </small>
            </Button>
            <Button
              render={<a href={item.deepLink} />}
              onClick={() => void markRead(item)}
              variant="link"
            >
              Open record
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

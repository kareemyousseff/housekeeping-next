"use client";

import { useState } from "react";
import { loadOlderEvents } from "./loadolderevents";

type HistoryEvent = {
  id: string;
  room: string;
  startedAt: Date | string;
  endedAt: Date | string | null;
  member: {
    user: { name: string | null; email: string };
  };
};

function displayName(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email;
}

function formatWhen(value: Date | string | null) {
  if (value === null) return "still running";
  return new Date(value).toLocaleString();
}

export default function EventHistoryList({
  familyId,
  initialEvents,
  initialHasMore,
}: {
  familyId: string;
  initialEvents: HistoryEvent[];
  initialHasMore: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function showMore() {
    const last = events[events.length - 1];
    if (!last || loading) return;
    setLoading(true);
    try {
      const page = await loadOlderEvents(familyId, last.startedAt, last.id);
      setEvents((prev) => [...prev, ...page.events]);
      setHasMore(page.hasMore);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Event History</h2>
      {events.length === 0 ? (
        <p>No occupancy history yet.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              {displayName(event.member.user)} {event.room} - started at{" "}
              {formatWhen(event.startedAt)} ended at {formatWhen(event.endedAt)}
            </li>
          ))}
        </ul>
      )}
      {hasMore ? (
        <button type="button" onClick={showMore} disabled={loading}>
          {loading ? "Loading..." : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

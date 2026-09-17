"use client";
import { useState } from "react";
import { displayName } from "./event-history";

export default function EventHistoryList({ initialNumberOfEvents }: { initialNumberOfEvents: number }) {
    const [numberOfEvents, setNumberOfEvents] = useState(initialNumberOfEvents);

    return (


        <div>
             <h2>Event History</h2>
            {events.length === 0 ? (
                <p>No occupancy history yet.</p>
            ) : (
                <ul>
                    {events.map((event) => (
                        <li key={event.id}>
                            {displayName(event.member.user)} {event.room} - started at {event.startedAt.toLocaleString()} ended at {event.endedAt?.toLocaleString() || "still running"}
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={() => setNumberOfEvents(numberOfEvents + 6)}>Show more</button>
            <button onClick={() => setNumberOfEvents(numberOfEvents - 6)}>Show less</button>
        </div>
    );
}
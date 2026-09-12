"use client";

import { useEffect, useState } from "react";
import { OccupancyChange } from "@/app/modules/occupancy/occupancy.server";

function isOccupancyChange(value: unknown): value is OccupancyChange {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    return "id" in value && typeof value.id === "string";
}

export default function EventListener({ familyID }: { familyID: string }) {
    const [events, setEvents] = useState<OccupancyChange[]>([]);

    useEffect(() => {
        const eventSource = new EventSource(`/api/map/${familyID}/events`);
        eventSource.onmessage = (event) => {
            if (!event.data || event.data === "hello") {
                return;
            }
            const parsed: unknown = JSON.parse(event.data);
            if (!isOccupancyChange(parsed)) {
                return;
            }
            setEvents((current) =>
                current.some((item) => item.id === parsed.id)
                    ? current
                    : [...current, parsed],
            );
        };
        return () => {
            eventSource.close();
        };
    }, [familyID]);

    

    return (
        <div>
            <h1>Events</h1>
            <ul>
                {events.map((event) => (
                    <li key={event.id}>{event.actorName} {event.room} {event.at} {event.occupied ? "occupied" : "vacant"}</li>
                ))}
            </ul>
        </div>
    );
}

import { Client } from "pg";
import { OccupancyChange } from "./occupancy.server";

type StreamController = ReadableStreamDefaultController<Uint8Array>;

const globalForListeners = globalThis as typeof globalThis & {
    occupancyListeners?: Map<string, Set<StreamController>>;
};

const listeners = globalForListeners.occupancyListeners ?? new Map<string, Set<StreamController>>();
globalForListeners.occupancyListeners = listeners;

export async function startListening() {
    const g = globalThis as typeof globalThis & { occupancyListenStarted?: boolean };
    if (g.occupancyListenStarted) return;
    g.occupancyListenStarted = true;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query("LISTEN occupancy_event");
    client.on("notification", (msg) => {
        if (msg.channel === "occupancy_event" && msg.payload) {
            notifyFamily(JSON.parse(msg.payload) as OccupancyChange); // payload is the family id
  }
});}

export function addListener(familyId: string, controller: StreamController) {
    startListening().catch(console.error);
    if (!listeners.has(familyId)) {
        listeners.set(familyId, new Set());
    }
    listeners.get(familyId)!.add(controller);
}

export function removeListener(familyId: string, controller: StreamController) {
    listeners.get(familyId)?.delete(controller);
}

export function notifyFamily(change: OccupancyChange) {
    const encoder = new TextEncoder();
    const payload = encoder.encode(`data: ${JSON.stringify(change)}\n\n`);
    for (const controller of listeners.get(change.familyId) ?? []) {
        try {
            controller.enqueue(payload);
        } catch {
            listeners.get(change.familyId)?.delete(controller);
        }
    }
}
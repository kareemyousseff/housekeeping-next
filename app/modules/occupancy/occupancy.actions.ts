"use server";
import { getMembership, OccupancyChange, type Room } from "./occupancy.server";
import { prisma } from "../lib/prisma";
import { notifyFamily } from "./occupancy-subs";
import { occupantName } from "./occupancy.server";
import { applyRoomOccupancy } from "./occupancy.write";

export async function setRoomOccupancy(
  familyId: string,
  room: Room,
  occupied: boolean,
) {
  const membership = await getMembership(familyId);
  if (!membership) {
    return { ok: false as const, error: "NOT_A_MEMBER" };
  }

  const now = new Date();

  try {
    await applyRoomOccupancy(membership.id, familyId, room, occupied);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_IN_ROOM") {
      return { ok: false as const, error: "NOT_IN_ROOM" };
    }
    throw error;
  }

  const change: OccupancyChange = {
    id: crypto.randomUUID(),
    familyId,
    room,
    occupied,
    actorName: occupantName({ name: membership.user.name, email: membership.user.email }),
    at: now.toISOString(),
  };

  await prisma.$executeRaw`NOTIFY outbox`;
  await prisma.$executeRaw`SELECT pg_notify('occupancy_event', ${JSON.stringify(change)})`;

  notifyFamily(change);
  return { ok: true as const };
}

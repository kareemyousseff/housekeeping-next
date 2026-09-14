"use server";
import { getMembership, OccupancyChange, type Room } from "./occupancy.server";
import { prisma } from "../lib/prisma";
import { notifyFamily } from "./occupancy-subs";
import { occupantName } from "./occupancy.server";

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
    await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ location: string | null }[]>`
  SELECT location FROM "FamilyMember"
  WHERE id = ${membership.id}
  FOR UPDATE
`;
    
    if (!occupied && locked[0].location !== room) {
      throw new Error("NOT_IN_ROOM");
    }

    await tx.familyMember.update({
      where: { id: membership.id },
      data: {
        location: occupied ? room : null,
        startedAt: now,
      },
    });

    // one open stay per member: close whatever is in progress
    await tx.occupancyEvent.updateMany({
      where: { memberId: membership.id, endedAt: null },
      data: { endedAt: now },
    });

    if (occupied) {
      await tx.occupancyEvent.create({
        data: {
          memberId: membership.id,
          familyId,
          room,
          startedAt: now,
          endedAt: null,
        },
      });
    }

    await tx.outbox.create({
      data: {
        type: "occupancy",
        payload: {
          familyId,
          room,
          occupied,
        },
        },
      });
    });
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

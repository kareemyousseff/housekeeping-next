import { prisma } from "../lib/prisma";

type Room = "bathroom" | "kitchen";

export async function applyRoomOccupancy(
  memberId: string,
  familyId: string,
  room: Room,
  occupied: boolean,
) {
  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ location: string | null }[]>`
      SELECT location FROM "FamilyMember"
      WHERE id = ${memberId}
      FOR UPDATE
    `;

    if (!locked[0]) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    if (!occupied && locked[0].location !== room) {
      throw new Error("NOT_IN_ROOM");
    }

    const now = new Date();

    await tx.familyMember.update({
      where: { id: memberId },
      data: {
        location: occupied ? room : null,
        startedAt: now,
      },
    });

    await tx.occupancyEvent.updateMany({
      where: { memberId, endedAt: null },
      data: { endedAt: now },
    });

    if (occupied) {
      await tx.occupancyEvent.create({
        data: {
          memberId,
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
}

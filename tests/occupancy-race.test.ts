import { afterEach, beforeEach, expect, test } from "vitest";
import { prisma } from "@/app/modules/lib/prisma";
import { applyRoomOccupancy } from "@/app/modules/occupancy/occupancy.write";
import type { Room } from "@/app/modules/occupancy/occupancy.server";

const rooms: [Room, Room] = ["bathroom", "kitchen"];

let userId: number;
let familyId: string;
let memberId: string;

beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      email: `race-${crypto.randomUUID()}@test.local`,
      password: "test",
    },
  });
  const family = await prisma.family.create({
    data: { name: "race-test" },
  });
  const member = await prisma.familyMember.create({
    data: {
      userId: user.id,
      familyId: family.id,
    },
  });

  userId = user.id;
  familyId = family.id;
  memberId = member.id;
});

afterEach(async () => {
  await prisma.occupancyEvent.deleteMany({ where: { memberId } });
  await prisma.$executeRaw`DELETE FROM "Outbox" WHERE payload->>'familyId' = ${familyId}`;
  await prisma.familyMember.delete({ where: { id: memberId } });
  await prisma.family.delete({ where: { id: familyId } });
  await prisma.user.delete({ where: { id: userId } });
});

test("two overlapping occupies leave location as the room that finished last", async () => {
  const finished: Room[] = [];

  await Promise.all([
    applyRoomOccupancy(memberId, familyId, rooms[0], true).then(() => {
      finished.push(rooms[0]);
    }),
    applyRoomOccupancy(memberId, familyId, rooms[1], true).then(() => {
      finished.push(rooms[1]);
    }),
  ]);

  const member = await prisma.familyMember.findUniqueOrThrow({
    where: { id: memberId },
  });
  const openStays = await prisma.occupancyEvent.findMany({
    where: { memberId, endedAt: null },
  });

  const lastFinished = finished[1];

  expect(finished).toHaveLength(2);
  expect(member.location).toBe(lastFinished);
  expect(openStays).toHaveLength(1);
  expect(openStays[0].room).toBe(lastFinished);
});

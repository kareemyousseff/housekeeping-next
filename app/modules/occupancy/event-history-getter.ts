import { prisma } from "../lib/prisma";
import { getMembership } from "./occupancy.server";

const PAGE_SIZE = 6;

export type HistoryCursor = {
  startedAt: Date;
  id: string;
};

export async function getEventHistory(
  familyId: string,
  cursor?: HistoryCursor,
) {
  const membership = await getMembership(familyId);
  if (!membership) {
    return { events: [], hasMore: false };
  }

  const events = await prisma.occupancyEvent.findMany({
    where: {
      familyId,
      ...(cursor
        ? {
            OR: [
              { startedAt: { lt: cursor.startedAt } },
              {
                startedAt: cursor.startedAt,
                id: { lt: cursor.id },
              },
            ],
          }
        : {}),
    },
    include: {
      member: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
  });

  const hasMore = events.length > PAGE_SIZE;
  return { events: events.slice(0, PAGE_SIZE), hasMore };
}

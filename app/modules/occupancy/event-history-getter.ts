import { prisma } from "../lib/prisma";
import { getMembership } from "./occupancy.server";

export async function getEventHistory(familyId: string) {
    const membership = await getMembership(familyId);
    if (!membership) {
        return [];
    }

    return prisma.occupancyEvent.findMany({
        where: { familyId },
        include: {
            member: {
                include: {
                    user: {
                        select: { name: true, email: true },
                        
                    },
                },
            },
        },
        orderBy: { startedAt: "desc" },
        take: 6,
    });
}

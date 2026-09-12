import { getCurrentUserId } from "@/app/modules/auth/auth";
import { prisma } from "@/app/modules/lib/prisma";
import { addListener, removeListener } from "@/app/modules/occupancy/occupancy-subs";

export async function GET(request: Request, { params }: { params: Promise<{ familyID: string }> }) {
    const userId = await getCurrentUserId();
    const { familyID } = await params;
    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }
    const familyofuser = await prisma.familyMember.findMany({
        where: { userId },
        include: { family: true },
    });
    if (!familyofuser.some((f) => f.family.id === familyID)) {
        return new Response("Unauthorized", { status: 401 });
    }
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            addListener(familyID, controller);

            const data = encoder.encode( `data: ${JSON.stringify({ type: "ping" })}\n\n`);
            
                try {
                    controller.enqueue(data);
                } catch {
                    removeListener(familyID, controller);
                }
            

            request.signal.addEventListener("abort", () => {
                removeListener(familyID, controller);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}

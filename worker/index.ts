import { Client } from "pg";
import { prisma } from "@/app/modules/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const worker = async () => {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not set");
  }
  const emailFrom = from;
  console.log("worker starting", {
    emailFrom,
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
  });
  let draining = false;
  let queued = false;

  async function drain() {
    while (true) {
      const outbox = await prisma.outbox.findMany({
        where: { processedAt: null },
        take: 10,
      });
      if (outbox.length === 0) {
        return;
      }

      console.log("worker draining", { count: outbox.length });

      for (const item of outbox) {
        try {
          const payload = item.payload;
          if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
            continue;
          }

          const familyId = payload.familyId;
          const room = payload.room;
          const occupied = payload.occupied;
          if (typeof familyId !== "string" || typeof room !== "string" || typeof occupied !== "boolean") {
            await prisma.outbox.update({
              where: { id: item.id },
              data: { processedAt: new Date() },
            });
            continue;
          }

          const members = await prisma.familyMember.findMany({
            where: { familyId },
            include: { user: { select: { email: true } } },
          });

          const to = members.map((m) => m.user.email);
          const subject = occupied ? `${room} is occupied` : `${room} is free`;

          const result = await resend.emails.send({ from: emailFrom, to, subject, html: `<p>${subject}</p>` });
          if (result.error) {
            console.error("resend failed", result.error);
            continue;
          }
          console.log("email sent", { to, subject });
          await prisma.outbox.update({
            where: { id: item.id },
            data: { processedAt: new Date() },
          });
        } catch (error) {
          console.error("Error processing outbox item", error);
        }
      }

      if (outbox.length < 10) {
        return;
      }
    }
  }

  async function drainSafe() {
    queued = true;
    if (draining) {
      return;
    }
    draining = true;
    try {
      while (queued) {
        queued = false;
        await drain();
      }
    } finally {
      draining = false;
    }
  }

  await drainSafe();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("LISTEN outbox");
  console.log("worker listening for outbox");
  client.on("notification", () => {
    console.log("worker got outbox notification");
    drainSafe().catch(console.error);
  });
};

worker().catch(console.error);

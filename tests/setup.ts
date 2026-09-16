import { config } from "dotenv";
import { afterAll } from "vitest";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const { prisma } = await import("@/app/modules/lib/prisma");

afterAll(async () => {
  await prisma.$disconnect();
});

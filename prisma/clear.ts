import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEED_IDS = ["seed-user-1", "seed-user-2", "seed-user-3", "seed-user-4", "seed-user-5"];

async function main() {
  await prisma.rating.deleteMany({ where: { userId: { in: SEED_IDS } } });
  await prisma.post.deleteMany({ where: { userId: { in: SEED_IDS } } });
  await prisma.user.deleteMany({ where: { id: { in: SEED_IDS } } });
  console.log("✓ Cleared seed data");
}

main().catch(console.error).finally(() => prisma.$disconnect());

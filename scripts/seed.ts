/**
 * Seeds the database with a default recruiter account.
 * Run with: npx tsx scripts/seed.ts
 *
 * Default credentials:
 *   email:    recruiter@sparkhire.com
 *   password: recruiter123
 */
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/client";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("recruiter123", 10);

  await prisma.user.upsert({
    where: { email: "recruiter@sparkhire.com" },
    update: {},
    create: {
      email: "recruiter@sparkhire.com",
      password,
      role: "RECRUITER",
    },
  });

  console.log("✅ Seeded recruiter user: recruiter@sparkhire.com / recruiter123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
